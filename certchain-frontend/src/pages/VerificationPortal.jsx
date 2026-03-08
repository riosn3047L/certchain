import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Card, { CardBody } from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import { Search, QrCode, AlertTriangle, ShieldAlert, Download } from 'lucide-react';
import { API_BASE_URL } from '../config/api.js';
import './VerificationPortal.css';

export default function VerificationPortal() {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'qr'
  const [certId, setCertId] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'verified' | 'revoked' | 'not-found'
  const [certData, setCertData] = useState(null);
  const [searchParams] = useSearchParams();

  const simulateVerification = async (idToVerify = certId) => {
    if (!idToVerify) return;
    setStatus('loading');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/certificates/verify/${idToVerify}`);
      const data = response.data;

      if (data.status === 'verified') {
        setStatus('verified');
        setCertData({
          student: data.data.studentName,
          degree: data.data.degree,
          year: data.data.year,
          institution: data.data.institution,
          issuedOn: data.data.issuedAt ? new Date(data.data.issuedAt).toLocaleDateString() : 'N/A',
          id: certId,
          txHash: data.data.txHash
        });
      } else if (data.status === 'revoked') {
        setStatus('revoked');
        setCertData({
          reason: data.data.reason || 'Fraudulent Issuance',
          revokedOn: new Date(data.data.revokedAt).toLocaleDateString(),
          originalIssue: 'N/A',
          id: idToVerify
        });
      } else {
        setStatus('not-found');
        setCertData(null);
      }
    } catch (e) {
      console.error(e);
      setStatus('not-found');
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setCertId(idFromUrl);
      simulateVerification(idFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setStatus('idle');
    setCertId('');
    setCertData(null);
  };

  return (
    <div className="verification-page">
      <Navbar />

      <main className="container verify-main">
        <div className="verify-container animate-slide-up">
          <div className="verify-header text-center mb-8">
            <h1>Verify Certificate</h1>
            <p className="text-muted mt-2">Instantly check the authenticity of an on-chain credential.</p>
          </div>

          {status === 'idle' && (
            <Card className="verify-card">
              <div className="verify-tabs">
                <button
                  className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
                  onClick={() => setActiveTab('text')}
                >
                  <Search size={18} /> Enter ID
                </button>
                <button
                  className={`tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
                  onClick={() => setActiveTab('qr')}
                >
                  <QrCode size={18} /> Scan QR
                </button>
              </div>

              <CardBody className="verify-body text-center">
                {activeTab === 'text' ? (
                  <div className="flex flex-col gap-4">
                    <Input
                      placeholder="Enter Certificate ID (e.g., 0xabc...123)"
                      value={certId}
                      onChange={(e) => setCertId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && simulateVerification()}
                    />
                    <Button onClick={simulateVerification} disabled={!certId} className="w-full">
                      Verify Now
                    </Button>
                  </div>
                ) : (
                  <div className="qr-scanner-placeholder">
                    <QrCode size={48} className="text-muted mb-4" />
                    <p className="text-muted mb-4">Position the QR code within the frame to scan.</p>
                    <Button variant="secondary" onClick={() => setActiveTab('text')}>Switch to Manual Entry</Button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {status === 'loading' && (
            <Card className="verify-result skeleton-card animate-fade-in">
              <CardBody className="flex flex-col items-center justify-center py-12">
                <div className="spinner mb-4 text-primary">
                  <svg viewBox="0 0 24 24" style={{ width: 40, height: 40 }}>
                    <circle className="path" cx="12" cy="12" r="10" fill="none" strokeWidth="3"></circle>
                  </svg>
                </div>
                <h3>Querying Polygon Blockchain...</h3>
                <p className="text-muted">Fetching cryptography evidence</p>
              </CardBody>
            </Card>
          )}

          {status === 'verified' && certData && (
            <Card className="verify-result result-success animate-spring border-l-success">
              <CardBody>
                <div className="result-header mb-6">
                  <Badge variant="verified">CERTIFICATE VERIFIED</Badge>
                </div>

                <div className="data-grid mb-8">
                  <div className="data-row">
                    <span className="text-muted">Student:</span>
                    <span className="font-medium">{certData.student}</span>
                  </div>
                  <div className="data-row">
                    <span className="text-muted">Degree:</span>
                    <span className="font-medium">{certData.degree}</span>
                  </div>
                  <div className="data-row">
                    <span className="text-muted">Year:</span>
                    <span className="font-medium">{certData.year}</span>
                  </div>
                  <div className="data-row">
                    <span className="text-muted">Institution:</span>
                    <span className="font-medium">{certData.institution}</span>
                  </div>
                  <div className="data-row mt-4">
                    <span className="text-muted">Issued On:</span>
                    <span className="font-medium">{certData.issuedOn}</span>
                  </div>
                  <div className="data-row">
                    <span className="text-muted">Cert ID:</span>
                    <span className="mono">{certData.id}</span>
                  </div>
                  <div className="data-row">
                    <span className="text-muted">Tx Hash:</span>
                    <a href={`https://amoy.polygonscan.com/tx/${certData.txHash}`} target="_blank" rel="noopener noreferrer" className="mono flex items-center gap-1">{certData.txHash} <Search size={12} /></a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={() => {
                    const report = `CERTCHAIN VERIFICATION REPORT\n${'='.repeat(40)}\nStatus: VERIFIED\nStudent: ${certData.student}\nDegree: ${certData.degree}\nYear: ${certData.year}\nInstitution: ${certData.institution}\nIssued On: ${certData.issuedOn}\nCert ID: ${certData.id}\nTx Hash: ${certData.txHash}\n${'='.repeat(40)}\nVerified at: ${new Date().toLocaleString()}\nBlockchain: Polygon Amoy\n`;
                    const blob = new Blob([report], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `verification-${certData.id.slice(0, 10)}.txt`; a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download size={18} /> Report
                  </Button>
                  <Button variant="primary" className="w-full" onClick={reset}>
                    Verify Another
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {status === 'revoked' && certData && (
            <Card className="verify-result result-danger animate-spring border-l-danger">
              <CardBody>
                <div className="result-header mb-6">
                  <Badge variant="revoked">CERTIFICATE REVOKED</Badge>
                </div>

                <div className="danger-banner mb-6">
                  <ShieldAlert size={20} />
                  <p>This certificate was permanently revoked by the issuing institution. Do NOT accept this credential.</p>
                </div>

                <div className="data-grid mb-8">
                  <div className="data-row">
                    <span className="text-muted">Reason:</span>
                    <span className="font-medium text-danger">{certData.reason}</span>
                  </div>
                  <div className="data-row">
                    <span className="text-muted">Revoked On:</span>
                    <span className="font-medium">{certData.revokedOn}</span>
                  </div>
                  <div className="data-row">
                    <span className="text-muted">Original Issue:</span>
                    <span className="font-medium">{certData.originalIssue}</span>
                  </div>
                  <div className="data-row">
                    <span className="text-muted">Cert ID:</span>
                    <span className="mono">{certData.id}</span>
                  </div>
                </div>

                <Button variant="primary" className="w-full" onClick={reset}>
                  Verify Another
                </Button>
              </CardBody>
            </Card>
          )}

          {status === 'not-found' && (
            <Card className="verify-result result-not-found animate-spring border-l-muted">
              <CardBody className="text-center py-8">
                <div className="mb-6 flex justify-center">
                  <Badge variant="not-found">CERTIFICATE NOT FOUND</Badge>
                </div>
                <AlertTriangle size={48} className="text-muted mx-auto mb-4" />
                <h3 className="mb-2">No Match on Blockchain</h3>
                <p className="text-muted mb-8 max-w-sm mx-auto">
                  We couldn't find a certificate matching this ID on the Polygon network. Please check for typos and try again.
                </p>
                <Button variant="primary" onClick={reset}>Try Again</Button>
              </CardBody>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}
