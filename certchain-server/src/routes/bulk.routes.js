import express from 'express';
import Certificate from '../models/Certificate.js';
import { hashCertificateData, generateCertificateId } from '../services/hash.service.js';
import { blockchainService } from '../services/blockchain.service.js';
import { parseCSV, validateCertificateRow } from '../services/csv.service.js';

const router = express.Router();

/**
 * @route POST /api/v1/bulk/upload-csv
 * @desc Upload CSV, validate, return preview of parsed data
 */
router.post('/upload-csv', async (req, res, next) => {
  try {
    const { csvContent, institutionAddress, institutionName } = req.body;

    if (!csvContent || !institutionAddress || !institutionName) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'csvContent, institutionAddress, and institutionName are required.', statusCode: 400 }
      });
    }

    const rows = parseCSV(csvContent);
    const validRows = [];
    const errors = [];

    rows.forEach((row, idx) => {
      const validation = validateCertificateRow(row);
      if (validation.valid) {
        validRows.push(row);
      } else {
        errors.push({ row: idx + 1, errors: validation.errors });
      }
    });

    res.json({
      success: true,
      data: {
        totalRows: rows.length,
        validCount: validRows.length,
        errorCount: errors.length,
        preview: validRows.slice(0, 5),
        errors: errors.slice(0, 20) // Cap error list
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/bulk/batch-issue
 * @desc Issue certificates in batch from validated CSV data (max 50 per call)
 */
router.post('/batch-issue', async (req, res, next) => {
  try {
    const { students, institutionAddress, institutionName } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'students array is required.', statusCode: 400 }
      });
    }

    if (students.length > 50) {
      return res.status(422).json({
        success: false,
        error: { code: 'BATCH_TOO_LARGE', message: 'Maximum 50 certificates per batch.', statusCode: 422 }
      });
    }

    // Generate certIds and hashes
    const certIds = [];
    const certHashes = [];
    const enrichedStudents = [];

    for (const student of students) {
      const certId = generateCertificateId(
        institutionAddress,
        student.studentId,
        student.degreeProgramme,
        student.graduationYear
      );

      const certHash = hashCertificateData({
        studentId: student.studentId,
        degreeProgramme: student.degreeProgramme,
        graduationYear: student.graduationYear.toString(),
        institutionName
      });

      certIds.push(certId);
      certHashes.push(certHash);
      enrichedStudents.push({ ...student, certId, certHash });
    }

    // Batch issue on-chain
    const txHash = await blockchainService.issueBatch(certIds, certHashes);

    // Save all to MongoDB
    const certDocs = enrichedStudents.map((student) => ({
      certId: student.certId,
      certHash: student.certHash,
      txHash,
      student: {
        fullName: student.fullName,
        studentId: student.studentId,
        degreeProgramme: student.degreeProgramme,
        graduationYear: student.graduationYear
      },
      institutionAddress,
      institutionName,
      status: 'active'
    }));

    await Certificate.insertMany(certDocs);

    res.status(201).json({
      success: true,
      message: `${students.length} certificates issued in batch.`,
      data: {
        count: students.length,
        txHash,
        certIds
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
