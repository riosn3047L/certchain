import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  certId: { type: String, required: true, unique: true, index: true },
  certHash: { type: String, required: true },
  txHash: { type: String },
  
  student: {
    fullName: { type: String, required: true },
    walletAddress: String,
    email: String,
    studentId: { type: String, required: true, index: true },
    degreeProgramme: { type: String, required: true },
    specialisation: String,
    graduationYear: { type: Number, required: true },
    grade: String
  },
  
  institutionAddress: { type: String, required: true, index: true },
  institutionName: { type: String, required: true },
  
  status: { type: String, enum: ['active', 'revoked'], default: 'active', index: true },
  revokeReason: String,
  revokedAt: Date,
  
  verificationCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Certificate', CertificateSchema);
