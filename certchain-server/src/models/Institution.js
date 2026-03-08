import mongoose from 'mongoose';

const InstitutionSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  logoUrl: String,
  websiteUrl: String,
  adminWallets: [String],
  registrationTxHash: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Institution', InstitutionSchema);
