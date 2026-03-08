import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card, { CardBody, CardHeader } from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import { Award, Users, ShieldAlert, Activity, ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api.js';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalIssued: 0,
    totalActive: 0,
    totalRevoked: 0,
    totalVerifications: 0
  });

  const [recentCerts, setRecentCerts] = useState([]);
  const [verificationLog, setVerificationLog] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    // Fetch analytics overview
    axios.get(`${API_BASE_URL}/api/v1/analytics/overview`)
      .then(res => {
        if (res.data.success) setStats(res.data.data);
      })
      .catch(err => console.error('Analytics fetch error:', err));

    // Fetch recent certificates
    axios.get(`${API_BASE_URL}/api/v1/certificates?limit=5`)
      .then(res => {
        if (res.data.success) setRecentCerts(res.data.data);
      })
      .catch(err => console.error('Certs fetch error:', err));

    // Fetch verification activity log
    axios.get(`${API_BASE_URL}/api/v1/analytics/live-log?limit=10`)
      .then(res => {
        if (res.data.success) setVerificationLog(res.data.data);
      })
      .catch(err => console.error('Log fetch error:', err));

    // Fetch verification trends (last 30 days)
    axios.get(`${API_BASE_URL}/api/v1/analytics/verifications`)
      .then(res => {
        if (res.data.success) setTrendData(res.data.data);
      })
      .catch(err => console.error('Trends fetch error:', err));
  }, []);

  // Compute chart dimensions
  const maxCount = Math.max(...trendData.map(d => d.count), 1);
  const chartHeight = 120;

  return (
    <div className="admin-dashboard">
      <div className="dash-header mb-8 flex justify-between items-center">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="text-muted mt-1">Monitor your institution's issuance and verification activity on-chain.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => navigate('/admin/bulk')}>Bulk Upload</Button>
          <Button variant="primary" onClick={() => navigate('/admin/issue')}>Issue New Certificate</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats-grid mb-8">
        <Card>
          <CardBody className="stat-card-body">
            <div className="stat-icon-wrapper bg-success-10 text-success">
              <Award size={24} />
            </div>
            <div className="stat-details">
              <h3 className="stat-value">{stats.totalIssued.toLocaleString()}</h3>
              <p className="stat-label">Total Issued</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="stat-card-body">
            <div className="stat-icon-wrapper bg-primary-10 text-primary">
              <Users size={24} />
            </div>
            <div className="stat-details">
              <h3 className="stat-value">{stats.totalActive.toLocaleString()}</h3>
              <p className="stat-label">Active (Valid)</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="stat-card-body">
            <div className="stat-icon-wrapper bg-danger-10 text-danger">
              <ShieldAlert size={24} />
            </div>
            <div className="stat-details">
              <h3 className="stat-value">{stats.totalRevoked}</h3>
              <p className="stat-label">Revoked</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="stat-card-body">
            <div className="stat-icon-wrapper bg-warning-10 text-warning">
              <Activity size={24} />
            </div>
            <div className="stat-details">
              <h3 className="stat-value flex items-center gap-2">
                {stats.totalVerifications} <span className="stat-trend text-success"><ArrowUpRight size={16} /> Live</span>
              </h3>
              <p className="stat-label">Total Verifications</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Two-column layout: Trends + Activity Log */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Verification Trends Chart */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2"><Activity size={18} /> Verification Trends</h3>
          </CardHeader>
          <CardBody>
            {trendData.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: '32px 0' }}>
                No verification data yet. Trends will appear as certificates are verified.
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: `${chartHeight}px` }}>
                {trendData.slice(-14).map((d, i) => {
                  const barHeight = Math.max((d.count / maxCount) * chartHeight, 4);
                  return (
                    <div
                      key={i}
                      title={`${d.date}: ${d.count} verifications`}
                      style={{
                        flex: 1,
                        height: `${barHeight}px`,
                        backgroundColor: 'var(--primary)',
                        borderRadius: '3px 3px 0 0',
                        opacity: 0.7 + (0.3 * i / Math.max(trendData.slice(-14).length - 1, 1)),
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={e => e.target.style.opacity = '1'}
                      onMouseLeave={e => e.target.style.opacity = `${0.7 + (0.3 * i / Math.max(trendData.slice(-14).length - 1, 1))}`}
                    />
                  );
                })}
              </div>
            )}
            {trendData.length > 0 && (
              <div className="flex justify-between text-xs text-muted mt-2">
                <span>{trendData.slice(-14)[0]?.date}</span>
                <span>{trendData.slice(-14).at(-1)?.date}</span>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Live Verification Log */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2"><Clock size={18} /> Verification Activity</h3>
          </CardHeader>
          <CardBody style={{ padding: 0, maxHeight: `${chartHeight + 60}px`, overflowY: 'auto' }}>
            {verificationLog.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: '32px 16px' }}>
                No verification activity yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {verificationLog.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '13px'
                    }}
                  >
                    {log.resultStatus === 'verified' ? (
                      <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    ) : (
                      <XCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mono" style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.certId}
                      </div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        {log.source || 'web'} • {log.verifierType || 'public'}
                      </div>
                    </div>
                    <span className="text-muted" style={{ fontSize: '11px', flexShrink: 0 }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Issuances Table */}
      <Card>
        <CardHeader>
          <h3 className="flex items-center gap-2"><Activity size={18} /> Recent Issuances</h3>
        </CardHeader>
        <div className="table-responsive">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Degree</th>
                <th>Year</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentCerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted" style={{ padding: '2rem' }}>
                    No certificates issued yet. Issue your first certificate above!
                  </td>
                </tr>
              ) : (
                recentCerts.map((cert, i) => (
                  <tr key={i}>
                    <td className="mono">{cert.student?.studentId || 'N/A'}</td>
                    <td className="font-medium">{cert.student?.fullName || 'N/A'}</td>
                    <td className="text-muted">{cert.student?.degreeProgramme || 'N/A'}</td>
                    <td>{cert.student?.graduationYear || 'N/A'}</td>
                    <td>
                      <Badge variant={cert.status === 'active' ? 'verified' : 'revoked'}>
                        {cert.status === 'active' ? 'Active' : 'Revoked'}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(cert.certId)}>
                        Copy ID
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
