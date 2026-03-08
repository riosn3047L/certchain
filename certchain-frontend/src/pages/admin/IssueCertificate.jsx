import React, { useState } from 'react';
import axios from 'axios';
import Card, { CardBody, CardFooter } from '../../components/Card.jsx';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import { CheckCircle2, ChevronRight, Hash } from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';
import './IssueCertificate.css';

// Compute SHA-256 hash in the browser using Web Crypto API
async function computeHash(data) {
  const sortedKeys = Object.keys(data).sort();
  const sortedObj = {};
  for (const key of sortedKeys) {
    sortedObj[key] = data[key];
  }
  const jsonStr = JSON.stringify(sortedObj);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function IssueCertificate() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certId, setCertId] = useState(null);
  const [hashPreview, setHashPreview] = useState('');

  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    walletAddress: '',
    degree: '',
    specialisation: '',
    year: '',
    institutionName: 'Testing Institution',
    institutionAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = async () => {
    // Compute the real hash preview before showing step 2
    const hashData = {
      studentId: formData.studentId,
      degreeProgramme: formData.degree,
      graduationYear: formData.year.toString(),
      institutionName: formData.institutionName
    };
    const hash = await computeHash(hashData);
    setHashPreview(hash);
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/certificates/issue`, {
        student: {
          fullName: formData.studentName,
          studentId: formData.studentId,
          degreeProgramme: formData.degree,
          graduationYear: parseInt(formData.year)
        },
        institutionAddress: formData.institutionAddress,
        institutionName: formData.institutionName
      });

      if (response.data.success) {
        setCertId(response.data.data.certId);
        setStep(3);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to issue certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="issue-certificate max-w-3xl mx-auto">
      <div className="mb-8">
        <h1>Issue Single Certificate</h1>
        <p className="text-muted mt-1">Generate and store a verified credential hash on Polygon.</p>
      </div>

      {/* Stepper */}
      <div className="stepper mb-8">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-circle">{step > 1 ? <CheckCircle2 size={16} /> : 1}</div>
          <span>Student Details</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-circle">{step > 2 ? <CheckCircle2 size={16} /> : 2}</div>
          <span>Preview & Hash</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step === 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <span>Confirm & Sign</span>
        </div>
      </div>

      {/* Forms */}
      {step === 1 && (
        <Card className="animate-fade-in">
          <CardBody className="flex flex-col gap-6">
            <div className="grid-2-col">
              <Input label="Student Full Name" name="studentName" value={formData.studentName} onChange={handleChange} required />
              <Input label="Student ID / Roll Number" name="studentId" value={formData.studentId} onChange={handleChange} required />
            </div>
            <Input label="Student Wallet Address (Optional)" name="walletAddress" value={formData.walletAddress} onChange={handleChange} placeholder="0x..." />

            <div className="grid-2-col">
              <div className="input-group">
                <label className="input-label">Degree Programme</label>
                <select className="input" name="degree" value={formData.degree} onChange={handleChange}>
                  <option value="">Select Degree...</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="B.Sc">B.Sc</option>
                </select>
              </div>
              <Input label="Year of Graduation" type="number" name="year" value={formData.year} onChange={handleChange} required />
            </div>

            <div className="grid-2-col">
              <Input label="Institution Name" name="institutionName" value={formData.institutionName} onChange={handleChange} required />
              <Input label="Institution Wallet Address" name="institutionAddress" value={formData.institutionAddress} onChange={handleChange} placeholder="0x..." required />
            </div>
          </CardBody>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNext} disabled={!formData.studentName || !formData.studentId || !formData.degree || !formData.year}>
              Continue to Preview <ChevronRight size={18} />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="animate-slide-up">
          <CardBody>
            <div className="preview-grid mb-6">
              <div className="preview-label">Student Name</div><div className="preview-value">{formData.studentName}</div>
              <div className="preview-label">Student ID</div><div className="preview-value">{formData.studentId}</div>
              <div className="preview-label">Degree</div><div className="preview-value">{formData.degree}</div>
              <div className="preview-label">Year</div><div className="preview-value">{formData.year}</div>
              <div className="preview-label">Institution</div><div className="preview-value">{formData.institutionName}</div>
            </div>

            <div className="hash-preview bg-primary-10 border-primary-20 p-4 rounded-md">
              <div className="flex items-center gap-2 text-primary font-medium mb-2">
                <Hash size={18} /> SHA-256 Hash Generated (To be stored on-chain)
              </div>
              <div className="mono text-sm break-all">
                {hashPreview || 'Computing...'}
              </div>
            </div>
          </CardBody>
          <CardFooter className="flex justify-between items-center">
            <Button variant="ghost" onClick={handleBack}>Back to Edit</Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              Issue & Sign Transaction
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="animate-spring text-center py-12">
          <CardBody className="flex flex-col items-center">
            <div className="w-16 h-16 bg-success-10 text-success rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="mb-2">Certificate Issued Successfully!</h2>
            <p className="text-muted mb-6">The certificate hash is now permanently recorded on the blockchain.</p>

            <div className="bg-surface border p-4 rounded-md w-full max-w-md mb-8">
              <div className="text-sm font-medium text-muted mb-1">Certificate ID</div>
              <div className="mono truncate">{certId}</div>
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => { setStep(1); setFormData({ ...formData, studentName: '', studentId: '', walletAddress: '' }); setHashPreview(''); }}>
                Issue Another
              </Button>
              <Button onClick={() => window.location.href = '/admin'}>Return to Dashboard</Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
