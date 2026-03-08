import mongoose from 'mongoose';

const VerificationLogSchema = new mongoose.Schema({
  certId: { type: String, required: true, index: true },
  verifierIp: { type: String }, // Hashed for privacy
  verifierType: { type: String, enum: ['employer', 'government', 'other'], default: 'employer' },
  employerCategory: { type: String, default: 'Other' },
  geolocation: {
    country: String,
    state: String,
    city: String
  },
  source: { type: String, enum: ['portal', 'qr_scan', 'api'], default: 'portal' },
  resultStatus: { type: String, enum: ['verified', 'revoked', 'not_found'], required: true }
}, { timestamps: true });

// Index for getting recent logs
VerificationLogSchema.index({ createdAt: -1 });

export default mongoose.model('VerificationLog', VerificationLogSchema);
