import express from 'express';
import { ethers } from 'ethers';
import Certificate from '../models/Certificate.js';
import VerificationLog from '../models/VerificationLog.js';
import { hashCertificateData, generateCertificateId } from '../services/hash.service.js';
import { blockchainService } from '../services/blockchain.service.js';

const router = express.Router();

/**
 * @route POST /api/v1/certificates/issue
 * @desc Admin issues a single certificate directly to the blockchain
 */
router.post('/issue', async (req, res) => {
  try {
    const { student, institutionAddress, institutionName } = req.body;

    // Validate Ethereum address format
    let checksummedInstitution;
    try {
      checksummedInstitution = ethers.getAddress(institutionAddress);
    } catch {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Invalid institution wallet address.', statusCode: 400 }
      });
    }

    // 1. Generate local certId
    const certId = generateCertificateId(checksummedInstitution, student.studentId, student.degreeProgramme, student.graduationYear);

    // 2. Hash the data for the blockchain
    const certDataForHashing = {
      studentId: student.studentId,
      degreeProgramme: student.degreeProgramme,
      graduationYear: student.graduationYear.toString(),
      institutionName
    };
    const certHash = hashCertificateData(certDataForHashing);

    // 3. Trigger Blockchain Transaction via Proxy Service
    const txHash = await blockchainService.issueSingle(certId, certHash);

    // 4. Save to MongoDB
    const newCert = new Certificate({
      certId,
      certHash,
      txHash,
      student,
      institutionAddress: checksummedInstitution,
      institutionName,
      status: 'active'
    });
    await newCert.save();

    res.status(201).json({
      success: true,
      message: 'Certificate issued and recorded on-chain successfully.',
      data: {
        certId,
        certHash,
        txHash
      }
    });

  } catch (error) {
    console.error("Issuance Error:", error);
    res.status(500).json({ success: false, error: 'Failed to issue certificate' });
  }
});

/**
 * @route GET /api/v1/certificates/verify/:certId
 * @desc Public instant verification lookup
 */
router.get('/verify/:certId', async (req, res) => {
  try {
    const { certId } = req.params;
    const { source = 'portal', verifierType = 'employer' } = req.query;

    // 1. Fetch off-chain Mongo record first (fast)
    const localCert = await Certificate.findOne({ certId });

    // 2. Fetch on-chain status (immutable truth)
    const onchainCert = await blockchainService.getCertificate(certId);

    let resultStatus = 'not_found';
    let responseData = null;

    if (!localCert && !onchainCert) {
      resultStatus = 'not_found';
    } else if (onchainCert && onchainCert.revoked) {
      resultStatus = 'revoked';
      responseData = {
        reason: onchainCert.revokeReason,
        revokedAt: new Date(Number(onchainCert.revokedAt) * 1000)
      };
    } else if (localCert && onchainCert) {
      // Cross-check hashes to detect tampering in MongoDB
      const certDataForHashing = {
        studentId: localCert.student.studentId,
        degreeProgramme: localCert.student.degreeProgramme,
        graduationYear: localCert.student.graduationYear.toString(),
        institutionName: localCert.institutionName
      };

      const computedHash = hashCertificateData(certDataForHashing);

      console.log("Local computed:", computedHash);
      console.log("OnChain computed:", onchainCert.certHash);

      if (computedHash === onchainCert.certHash) {
        resultStatus = 'verified';

        // Increase verification count stats
        localCert.verificationCount += 1;
        await localCert.save();

        responseData = {
          studentName: localCert.student.fullName,
          degree: localCert.student.degreeProgramme,
          institution: localCert.institutionName,
          year: localCert.student.graduationYear,
          txHash: localCert.txHash,
          issuedAt: localCert.createdAt
        };
      } else {
        // Hashes mismatch. Mongo data was tampered off-chain.
        console.warn("Hash mismatch logic triggered.");
        resultStatus = 'not_found';
      }
    }

    // 3. Log the Verification Event
    await VerificationLog.create({
      certId,
      verifierType,
      source,
      resultStatus
    });

    res.status(200).json({
      success: true,
      status: resultStatus,
      data: responseData
    });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, error: 'Verification failed due to server error' });
  }
});


/**
 * @route POST /api/v1/certificates/:certId/revoke
 * @desc Revoke a certificate on-chain and off-chain
 */
router.post('/:certId/revoke', async (req, res) => {
  try {
    const { certId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Revocation reason is required.', statusCode: 400 }
      });
    }

    // Check if cert exists locally
    const cert = await Certificate.findOne({ certId });
    if (!cert) {
      return res.status(404).json({
        success: false,
        error: { code: 'CERT_NOT_FOUND', message: 'Certificate not found.', statusCode: 404 }
      });
    }

    if (cert.status === 'revoked') {
      return res.status(409).json({
        success: false,
        error: { code: 'CERT_ALREADY_REVOKED', message: 'Certificate is already revoked.', statusCode: 409 }
      });
    }

    // Revoke on-chain
    const txHash = await blockchainService.revoke(certId, reason);

    // Update MongoDB
    cert.status = 'revoked';
    cert.revokeReason = reason;
    cert.revokedAt = new Date();
    await cert.save();

    res.json({
      success: true,
      message: 'Certificate revoked successfully.',
      data: { certId, reason, txHash }
    });
  } catch (error) {
    console.error("Revocation Error:", error);
    res.status(500).json({ success: false, error: 'Failed to revoke certificate' });
  }
});

/**
 * @route GET /api/v1/certificates
 * @desc List all certificates (with optional institution filter)
 */
router.get('/', async (req, res) => {
  try {
    const { institutionAddress, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (institutionAddress) filter.institutionAddress = institutionAddress;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const certs = await Certificate.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('certId student.fullName student.degreeProgramme student.graduationYear institutionName status verificationCount createdAt');

    const total = await Certificate.countDocuments(filter);

    res.json({
      success: true,
      data: certs,
      meta: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error("List Error:", error);
    res.status(500).json({ success: false, error: 'Failed to list certificates' });
  }
});

export default router;
