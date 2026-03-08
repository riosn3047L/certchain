import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card, { CardBody, CardFooter } from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Badge from '../../components/Badge.jsx';
import { Building, Plus, Globe, ExternalLink, X } from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';

export default function Institutions() {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        walletAddress: '',
        name: '',
        logoUrl: '',
        websiteUrl: ''
    });

    const fetchInstitutions = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/institutions`);
            if (res.data.success) setInstitutions(res.data.data);
        } catch (e) {
            console.error('Failed to fetch institutions:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInstitutions(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async () => {
        if (!form.walletAddress || !form.name) return;
        setSubmitting(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/v1/institutions/register`, form);
            if (res.data.success) {
                setShowForm(false);
                setForm({ walletAddress: '', name: '', logoUrl: '', websiteUrl: '' });
                fetchInstitutions();
            }
        } catch (e) {
            const msg = e.response?.data?.error?.message || 'Failed to register institution';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="institutions">
            <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1>Institutions</h1>
                    <p className="text-muted mt-1">Manage registered institutions on the blockchain.</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus size={18} /> Register Institution
                </Button>
            </div>

            {/* Institution Cards */}
            {loading ? (
                <div className="text-center text-muted" style={{ padding: '48px' }}>Loading institutions...</div>
            ) : institutions.length === 0 ? (
                <Card>
                    <CardBody className="flex flex-col items-center justify-center" style={{ padding: '48px', textAlign: 'center' }}>
                        <Building size={48} className="text-muted" style={{ marginBottom: '16px', opacity: 0.4 }} />
                        <h3 style={{ marginBottom: '8px' }}>No Institutions Registered</h3>
                        <p className="text-muted" style={{ maxWidth: '320px' }}>
                            Click "Register Institution" to add the first institution to the blockchain.
                        </p>
                    </CardBody>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {institutions.map(inst => (
                        <Card key={inst.walletAddress} hoverable>
                            <CardBody>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                            backgroundColor: 'var(--primary-10)', color: 'var(--primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <Building size={20} />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{inst.name}</div>
                                            <div className="mono text-xs text-muted" style={{ wordBreak: 'break-all' }}>
                                                {inst.walletAddress}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="verified">Active</Badge>
                                </div>

                                {inst.websiteUrl && (
                                    <a
                                        href={inst.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-primary"
                                        style={{ textDecoration: 'none', marginTop: '8px' }}
                                    >
                                        <Globe size={14} /> {inst.websiteUrl.replace(/^https?:\/\//, '')} <ExternalLink size={12} />
                                    </a>
                                )}

                                <div className="text-xs text-muted mt-3">
                                    Registered: {new Date(inst.createdAt).toLocaleDateString()}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Registration Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
                }} onClick={() => setShowForm(false)}>
                    <Card style={{ maxWidth: '520px', width: '100%' }} onClick={e => e.stopPropagation()}>
                        <CardBody>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="m-0">Register New Institution</h3>
                                <button className="icon-btn" onClick={() => setShowForm(false)}><X size={20} /></button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Institution Name *"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. IIT Delhi"
                                    required
                                />
                                <Input
                                    label="Wallet Address *"
                                    name="walletAddress"
                                    value={form.walletAddress}
                                    onChange={handleChange}
                                    placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                                    helperText="Use a Hardhat test account, e.g. Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                                    required
                                />
                                <Input
                                    label="Website URL"
                                    name="websiteUrl"
                                    value={form.websiteUrl}
                                    onChange={handleChange}
                                    placeholder="https://www.iitd.ac.in"
                                />
                                <Input
                                    label="Logo URL"
                                    name="logoUrl"
                                    value={form.logoUrl}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>
                        </CardBody>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button
                                variant="primary"
                                onClick={handleRegister}
                                isLoading={submitting}
                                disabled={!form.walletAddress || !form.name}
                            >
                                Register on Blockchain
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
