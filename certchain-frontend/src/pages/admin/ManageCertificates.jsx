import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Card, { CardBody } from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Input from '../../components/Input.jsx';
import { Search, XCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';

export default function ManageCertificates() {
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

    // Revoke modal
    const [revokeTarget, setRevokeTarget] = useState(null);
    const [revokeReason, setRevokeReason] = useState('');
    const [revoking, setRevoking] = useState(false);

    const fetchCerts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 15 });
            if (statusFilter) params.set('status', statusFilter);
            const res = await axios.get(`${API_BASE_URL}/api/v1/certificates?${params}`);
            if (res.data.success) {
                setCerts(res.data.data);
                setMeta(res.data.meta || { total: 0, totalPages: 1 });
            }
        } catch (e) {
            console.error('Failed to fetch:', e);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchCerts(); }, [fetchCerts]);

    // Client-side search filter (API doesn't support text search)
    const filtered = search.trim()
        ? certs.filter(c =>
            (c.student?.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.certId || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.student?.studentId || '').toLowerCase().includes(search.toLowerCase())
        )
        : certs;

    const handleRevoke = async () => {
        if (!revokeTarget || !revokeReason.trim()) return;
        setRevoking(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/v1/certificates/${revokeTarget.certId}/revoke`, {
                reason: revokeReason
            });
            if (res.data.success) {
                setRevokeTarget(null);
                setRevokeReason('');
                fetchCerts(); // Refresh
            }
        } catch (e) {
            const msg = e.response?.data?.error?.message || 'Failed to revoke';
            alert(msg);
        } finally {
            setRevoking(false);
        }
    };

    return (
        <div className="manage-certs">
            <div className="mb-6">
                <h1>Manage Certificates</h1>
                <p className="text-muted mt-1">Search, view, and revoke issued certificates.</p>
            </div>

            {/* Search + Filter Bar */}
            <Card className="mb-6">
                <CardBody>
                    <div className="flex gap-4 items-end" style={{ flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <div className="input-group">
                                <label className="input-label">Search</label>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="input"
                                        placeholder="Student name, ID, or cert ID..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        style={{ paddingLeft: '36px' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: '0 0 180px' }}>
                            <div className="input-group">
                                <label className="input-label"><Filter size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> Status</label>
                                <select className="input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="revoked">Revoked</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Certificate Table */}
            <Card>
                <CardBody style={{ padding: 0, overflowX: 'auto' }}>
                    <table className="dash-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Student ID</th>
                                <th>Degree</th>
                                <th>Year</th>
                                <th>Institution</th>
                                <th>Status</th>
                                <th>Verifications</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }} className="text-muted">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }} className="text-muted">No certificates found</td></tr>
                            ) : (
                                filtered.map(cert => (
                                    <tr key={cert.certId}>
                                        <td className="font-medium">{cert.student?.fullName || '—'}</td>
                                        <td className="mono text-sm">{cert.student?.studentId || cert.certId?.slice(0, 10)}</td>
                                        <td>{cert.student?.degreeProgramme || '—'}</td>
                                        <td>{cert.student?.graduationYear || '—'}</td>
                                        <td>{cert.institutionName || '—'}</td>
                                        <td>
                                            <Badge variant={cert.status === 'active' ? 'verified' : 'revoked'}>
                                                {cert.status === 'active' ? 'Active' : 'Revoked'}
                                            </Badge>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{cert.verificationCount || 0}</td>
                                        <td>
                                            {cert.status === 'active' ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setRevokeTarget(cert)}
                                                    style={{ color: 'var(--danger)', fontSize: '13px' }}
                                                >
                                                    <XCircle size={14} /> Revoke
                                                </Button>
                                            ) : (
                                                <span className="text-muted text-sm">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4" style={{ fontSize: '14px' }}>
                    <span className="text-muted">{meta.total} certificates total</span>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft size={16} /> Prev
                        </Button>
                        <span className="flex items-center text-muted">Page {page} of {meta.totalPages}</span>
                        <Button variant="ghost" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Revoke Confirmation Modal */}
            {revokeTarget && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
                }} onClick={() => setRevokeTarget(null)}>
                    <Card style={{ maxWidth: '480px', width: '100%' }} onClick={e => e.stopPropagation()}>
                        <CardBody>
                            <h3 style={{ marginBottom: '16px', color: 'var(--danger)' }}>Revoke Certificate</h3>
                            <p className="text-muted" style={{ marginBottom: '4px', fontSize: '14px' }}>
                                Student: <strong>{revokeTarget.student?.fullName}</strong>
                            </p>
                            <p className="text-muted" style={{ marginBottom: '16px', fontSize: '14px' }}>
                                Cert ID: <span className="mono">{revokeTarget.certId?.slice(0, 20)}...</span>
                            </p>
                            <Input
                                label="Reason for Revocation"
                                value={revokeReason}
                                onChange={e => setRevokeReason(e.target.value)}
                                placeholder="e.g. Fraudulent application, duplicate entry..."
                                required
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="ghost" onClick={() => { setRevokeTarget(null); setRevokeReason(''); }}>Cancel</Button>
                                <Button
                                    variant="primary"
                                    onClick={handleRevoke}
                                    isLoading={revoking}
                                    disabled={!revokeReason.trim()}
                                    style={{ backgroundColor: 'var(--danger)' }}
                                >
                                    Confirm Revocation
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
}
