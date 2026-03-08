import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

// Contract ABI (Subset of required functions for the API)
const CONTRACT_ABI = [
  "function registerInstitution(address institution, string memory name) external",
  "function issueCertificate(bytes32 certId, bytes32 certHash) external",
  "function batchIssueCertificates(bytes32[] calldata certIds, bytes32[] calldata certHashes) external",
  "function revokeCertificate(bytes32 certId, string memory reason) external",
  "function verifyCertificate(bytes32 certId) external returns (tuple(bytes32 certHash, address issuer, uint256 issuedAt, bool revoked, string revokeReason, uint256 revokedAt))",
  "function getCertificate(bytes32 certId) external view returns (tuple(bytes32 certHash, address issuer, uint256 issuedAt, bool revoked, string revokeReason, uint256 revokedAt))",
  "function registeredInstitutions(address) external view returns (bool)"
];

const isProduction = process.env.NODE_ENV === 'production';

const provider = isProduction
  ? new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL)
  : new ethers.JsonRpcProvider('http://127.0.0.1:8545'); // Hardhat localhost fallback

// In production, DEPLOYER_PRIVATE_KEY must be set. In dev, fall back to Hardhat Account #0.
const HARDHAT_DEV_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const privateKey = process.env.DEPLOYER_PRIVATE_KEY || (isProduction ? null : HARDHAT_DEV_KEY);
if (!privateKey) {
  throw new Error('DEPLOYER_PRIVATE_KEY environment variable is required in production.');
}
const wallet = new ethers.Wallet(privateKey, provider);

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

export const blockchainService = {
  /**
   * Reads a certificate's on-chain data without bumping the view counter
   */
  async getCertificate(certId) {
    try {
      const result = await contract.getCertificate(certId);
      // issuedAt == 0 means it doesn't exist
      if (result.issuedAt.toString() === '0') return null;
      return result;
    } catch (e) {
      console.error("Blockchain get error:", e);
      return null;
    }
  },

  /**
   * Calls the verifying function on-chain (costs gas / or requires read execution if pure view)
   * Using static call since we want to trigger the event listener in actual prod, 
   * but for API immediate response, view read is often better. We will use getCertificate + increment logic off-chain for speed.
   */
  async triggerVerificationEvent(certId) {
    // In a real prod environment we might delegate this or let the front-end call it to pay gas.
    // For this build, we rely on off-chain Mongo tracking for counts to keep it 0-friction for employers.
    return true;
  },

  /**
   * Register a new institution on-chain
   */
  async registerInstitution(walletAddress, name) {
    // Use ethers.getAddress() to prevent ENS resolution on local networks
    const checksummedAddress = ethers.getAddress(walletAddress);
    const nonce = await provider.getTransactionCount(wallet.address, 'latest');
    const tx = await contract.registerInstitution(checksummedAddress, name, { nonce });
    const receipt = await tx.wait();
    return receipt.hash;
  },

  /**
   * API server calling issuance directly (Proxy pattern)
   */
  async issueSingle(certId, certHash) {
    const nonce = await provider.getTransactionCount(wallet.address, 'latest');
    const tx = await contract.issueCertificate(certId, certHash, { nonce });
    const receipt = await tx.wait();
    return receipt.hash;
  },

  /**
   * Batch issuance proxy
   */
  async issueBatch(certIds, certHashes) {
    const nonce = await provider.getTransactionCount(wallet.address, 'latest');
    const tx = await contract.batchIssueCertificates(certIds, certHashes, { nonce });
    const receipt = await tx.wait();
    return receipt.hash;
  },

  /**
   * Revoke Proxy
   */
  async revoke(certId, reason) {
    const nonce = await provider.getTransactionCount(wallet.address, 'latest');
    const tx = await contract.revokeCertificate(certId, reason, { nonce });
    const receipt = await tx.wait();
    return receipt.hash;
  }
};

