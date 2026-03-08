import mongoose from 'mongoose';

const ShareLinkSchema = new mongoose.Schema({
  shortCode: { type: String, required: true, unique: true, index: true },
  certId: { type: String, required: true },
  graduateWallet: { type: String },
  disclosedFields: [{ type: String }], // e.g. ["fullName", "degreeProgramme", "graduationYear"]
  expiresAt: { type: Date },
  accessCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('ShareLink', ShareLinkSchema);
