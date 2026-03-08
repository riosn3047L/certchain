import express from 'express';
import { ethers } from 'ethers';
import Institution from '../models/Institution.js';
import { blockchainService } from '../services/blockchain.service.js';

const router = express.Router();

/**
 * @route POST /api/v1/institutions/register
 * @desc Register a new institution both on-chain and off-chain
 */
router.post('/register', async (req, res, next) => {
  try {
    const { walletAddress, name, logoUrl, websiteUrl } = req.body;

    if (!walletAddress || !name) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'walletAddress and name are required.', statusCode: 400 }
      });
    }

    // Validate Ethereum address format
    let checksummedAddress;
    try {
      checksummedAddress = ethers.getAddress(walletAddress);
    } catch {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ADDRESS', message: 'Invalid Ethereum wallet address. Must be a 0x-prefixed hex string (42 chars).', statusCode: 400 }
      });
    }

    // Check if already registered
    const existing = await Institution.findOne({ walletAddress });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_REGISTERED', message: 'This institution wallet is already registered.', statusCode: 409 }
      });
    }

    // Register on-chain via the admin deployer's wallet
    const txHash = await blockchainService.registerInstitution(checksummedAddress, name);

    // Save to MongoDB
    const institution = new Institution({
      walletAddress,
      name,
      logoUrl: logoUrl || '',
      websiteUrl: websiteUrl || '',
      registrationTxHash: txHash,
      isActive: true
    });
    await institution.save();

    res.status(201).json({
      success: true,
      message: 'Institution registered successfully.',
      data: { walletAddress, name, txHash }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/institutions
 * @desc List all registered institutions
 */
router.get('/', async (req, res, next) => {
  try {
    const institutions = await Institution.find({ isActive: true })
      .select('walletAddress name logoUrl websiteUrl createdAt');
    res.json({ success: true, data: institutions });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/institutions/:address
 * @desc Get institution profile by wallet address
 */
router.get('/:address', async (req, res, next) => {
  try {
    const institution = await Institution.findOne({ walletAddress: req.params.address });
    if (!institution) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Institution not found.', statusCode: 404 }
      });
    }
    res.json({ success: true, data: institution });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/v1/institutions/:address
 * @desc Update institution profile (off-chain fields only)
 */
router.put('/:address', async (req, res, next) => {
  try {
    const { name, logoUrl, websiteUrl } = req.body;
    const institution = await Institution.findOneAndUpdate(
      { walletAddress: req.params.address },
      { $set: { name, logoUrl, websiteUrl } },
      { new: true }
    );

    if (!institution) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Institution not found.', statusCode: 404 }
      });
    }

    res.json({ success: true, data: institution });
  } catch (error) {
    next(error);
  }
});

export default router;
