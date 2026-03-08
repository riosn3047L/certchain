import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import Button from '../components/Button.jsx';
import Card, { CardBody } from '../components/Card.jsx';
import { ShieldCheck, UploadCloud, Link as LinkIcon, Award, Building, Activity } from 'lucide-react';
import { API_BASE_URL } from '../config/api.js';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  // Target values — fetched from API with fallbacks
  const [targets, setTargets] = useState({
    issued: 0,
    institutions: 0,
    verifications: 0
  });

  // Animated display values
  const [displayIssued, setDisplayIssued] = useState(0);
  const [displayInstitutions, setDisplayInstitutions] = useState(0);
  const [displayVerifications, setDisplayVerifications] = useState(0);

  // Fetch real stats from API
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/v1/analytics/overview`)
      .then(res => {
        if (res.data.success) {
          setTargets({
            issued: res.data.data.totalIssued || 0,
            institutions: 0, // Not tracked in analytics yet
            verifications: res.data.data.totalVerifications || 0
          });
        }
      })
      .catch(() => {
        // API unavailable — leave at 0, will show "—" for zero values
      });

    // Try to get institution count separately
    axios.get(`${API_BASE_URL}/api/v1/institutions`)
      .then(res => {
        if (res.data.success) {
          setTargets(prev => ({ ...prev, institutions: res.data.data.length || 0 }));
        }
      })
      .catch(() => { });
  }, []);

  // Animate counters up to target
  useEffect(() => {
    if (targets.issued === 0 && targets.institutions === 0 && targets.verifications === 0) return;

    const duration = 1500; // ms
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayIssued(Math.floor(eased * targets.issued));
      setDisplayInstitutions(Math.floor(eased * targets.institutions));
      setDisplayVerifications(Math.floor(eased * targets.verifications));

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [targets]);

  const formatStat = (value) => {
    if (value === 0) return '—';
    return value.toLocaleString();
  };

  return (
    <div className="landing-page">
      <Navbar />

      <main className="container landing-main">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content animate-slide-up">
            <div className="hero-badge">✨ Deployed on Polygon Amoy</div>
            <h1 className="hero-title">India's certificates, <br /><span className="text-primary">verified in seconds.</span></h1>
            <p className="hero-subtitle">
              Eliminating the ₹3,000 crore fake certificate economy with an open-source, fast, and secure on-chain protocol.
            </p>
            <div className="hero-actions">
              <Button size="lg" onClick={() => navigate('/admin')}>Issue Certificates</Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/verify')}>Verify a Certificate</Button>
            </div>
          </div>
          <div className="hero-visual animate-fade-in">
            <div className="abstract-shape shape-1 animate-float"></div>
            <div className="abstract-shape shape-2 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="abstract-card primary glass-panel relative z-10">
              <ShieldCheck size={72} className="text-white mb-4" color="white" />
              <h3 style={{ color: 'white' }}>Verified Hash</h3>
              <p className="mono mt-2" style={{ color: 'rgba(255,255,255,0.8)' }}>0x28f...a34</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section mt-12 animate-fade-in">
          <div className="stat-card">
            <Award size={32} className="stat-icon" />
            <div className="stat-number">{formatStat(displayIssued)}</div>
            <div className="stat-label">Certificates Issued</div>
          </div>
          <div className="stat-card">
            <Building size={32} className="stat-icon" />
            <div className="stat-number">{formatStat(displayInstitutions)}</div>
            <div className="stat-label">Institutions Onboarded</div>
          </div>
          <div className="stat-card">
            <Activity size={32} className="stat-icon" />
            <div className="stat-number">{formatStat(displayVerifications)}</div>
            <div className="stat-label">Verifications Performed</div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works mt-16 pb-16">
          <h2 className="text-center mb-8">How It Works</h2>
          <div className="how-grid">
            <Card hoverable className="how-card">
              <CardBody className="flex flex-col items-center text-center gap-4">
                <div className="icon-circle"><UploadCloud size={32} /></div>
                <h3>1. Institution Uploads</h3>
                <p className="text-muted">Batch issue thousands of certificates in one transaction. Only hashes are stored.</p>
              </CardBody>
            </Card>
            <Card hoverable className="how-card">
              <CardBody className="flex flex-col items-center text-center gap-4">
                <div className="icon-circle"><LinkIcon size={32} /></div>
                <h3>2. Graduates Share</h3>
                <p className="text-muted">Graduates generate a verification link right from their mobile wallet securely.</p>
              </CardBody>
            </Card>
            <Card hoverable className="how-card">
              <CardBody className="flex flex-col items-center text-center gap-4">
                <div className="icon-circle"><ShieldCheck size={32} /></div>
                <h3>3. Employers Verify</h3>
                <p className="text-muted">Scan a QR code or enter an ID to instantly check authenticity, with zero friction.</p>
              </CardBody>
            </Card>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck size={20} className="text-primary" /> CertChain
          </div>
          <div className="text-muted text-sm">
            Built for India 🇮🇳 | Open Source | WCAG AA
          </div>
        </div>
      </footer>
    </div>
  );
}
