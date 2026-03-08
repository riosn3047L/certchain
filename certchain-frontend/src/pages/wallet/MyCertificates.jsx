import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card, { CardBody } from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import { ExternalLink, QrCode, Search, CheckCircle2, X } from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';
import './MyCertificates.css';
import { QRCodeSVG } from 'qrcode.react';

export default function MyCertificates() {
  const [selectedCert, setSelectedCert] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real certificates from API
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/v1/certificates?limit=50`)
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          const mapped = res.data.data.map(cert => ({
            id: cert.certId,
            degree: cert.student?.degreeProgramme || 'N/A',
            institution: cert.institutionName || 'N/A',
            year: cert.student?.graduationYear?.toString() || 'N/A',
            name: cert.student?.fullName || 'N/A',
            status: cert.status === 'active' ? 'verified' : 'revoked',
            txHash: cert.txHash || 'N/A'
          }));
          setCertificates(mapped);
        }
      })
      .catch(err => console.error('Failed to fetch certificates:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyLink = (certId) => {
    const url = `${window.location.origin}/verify?id=${certId}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('Verification link copied to clipboard!'))
      .catch(() => alert('Failed to copy link.'));
  };

  const handleViewExplorer = (txHash) => {
    if (txHash && txHash !== 'N/A') {
      window.open(`https://amoy.polygonscan.com/tx/${txHash}`, '_blank');
    }
  };

  return (
    <div className="my-certificates">
      <div className="mb-6">
        <h2 className="text-xl">My Certificates</h2>
        <p className="text-muted text-sm mt-1">Tap a certificate to view details or share.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardBody className="p-4">
                <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '8px' }}></div>
                <div className="skeleton" style={{ height: '14px', width: '40%' }}></div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center justify-center" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Search size={48} className="text-muted" style={{ marginBottom: '16px', opacity: 0.4 }} />
            <h3 style={{ marginBottom: '8px' }}>No Certificates Found</h3>
            <p className="text-muted" style={{ maxWidth: '320px' }}>
              No certificates are available yet. Once certificates are issued through the admin portal, they will appear here.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {certificates.map((cert) => (
            <Card
              key={cert.id}
              hoverable
              className="cursor-pointer border-l-4 border-l-primary"
              onClick={() => setSelectedCert(cert)}
            >
              <CardBody className="p-4 flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-text">{cert.degree}</span>
                  <span className="text-sm text-muted">{cert.institution} • {cert.year}</span>
                  {cert.name !== 'N/A' && (
                    <span className="text-sm text-muted">{cert.name}</span>
                  )}
                </div>
                <Badge variant={cert.status}>{cert.status === 'verified' ? 'Verified' : 'Revoked'}</Badge>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom Sheet Modal for Certificate Detail */}
      <div className={`bottom-sheet-overlay ${selectedCert ? 'open' : ''}`} onClick={() => setSelectedCert(null)}>
        <div className={`bottom-sheet ${selectedCert ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="sheet-handle"></div>

          {selectedCert && (
            <div className="sheet-content">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg m-0">Certificate Detail</h3>
                <button className="icon-btn" onClick={() => setSelectedCert(null)}><X size={20} /></button>
              </div>

              <div className="cert-detail-grid mb-6">
                <div className="detail-row">
                  <span className="text-muted text-sm">Student</span>
                  <span className="font-medium">{selectedCert.name}</span>
                </div>
                <div className="detail-row">
                  <span className="text-muted text-sm">Degree</span>
                  <span className="font-medium">{selectedCert.degree}</span>
                </div>
                <div className="detail-row">
                  <span className="text-muted text-sm">Institution</span>
                  <span className="font-medium">{selectedCert.institution}</span>
                </div>
                <div className="detail-row">
                  <span className="text-muted text-sm">Year</span>
                  <span className="font-medium">{selectedCert.year}</span>
                </div>
                <div className="detail-row">
                  <span className="text-muted text-sm">Cert ID</span>
                  <span className="mono text-sm">{selectedCert.id}</span>
                </div>
                <div className="detail-row">
                  <span className="text-muted text-sm">Status</span>
                  <Badge variant={selectedCert.status}>{selectedCert.status === 'verified' ? 'Verified ✓' : 'Revoked ✗'}</Badge>
                </div>
              </div>

              <Card className="qr-card bg-surface mb-6">
                <CardBody className="flex flex-col items-center justify-center p-6 gap-4">
                  <div className="qr-container bg-white p-2 rounded-md">
                    <QRCodeSVG value={`${window.location.origin}/verify?id=${selectedCert.id}`} size={160} />
                  </div>
                  <p className="text-sm text-muted text-center">Scan to verify instantly</p>
                </CardBody>
              </Card>

              <div className="flex flex-col gap-3">
                <Button variant="primary" className="w-full flex justify-center gap-2" onClick={() => handleCopyLink(selectedCert.id)}>
                  <ExternalLink size={18} /> Share verification link
                </Button>
                <Button variant="secondary" className="w-full flex justify-center gap-2" onClick={() => handleViewExplorer(selectedCert.txHash)}>
                  <Search size={18} /> View transaction on Explorer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
