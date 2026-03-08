import React, { useState } from 'react';
import axios from 'axios';
import Card, { CardBody, CardFooter } from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../config/api.js';

export default function BulkUpload() {
    const [csvContent, setCsvContent] = useState('');
    const [preview, setPreview] = useState(null);
    const [issueResult, setIssueResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'done'

    const handleUpload = async () => {
        if (!csvContent.trim()) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/v1/bulk/upload-csv`, {
                csvContent,
                institutionAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                institutionName: 'Testing Institution'
            });
            if (res.data.success) {
                setPreview(res.data.data);
                setStep('preview');
            }
        } catch (e) {
            console.error('Upload error:', e);
            alert('Failed to parse CSV. Please check the format.');
        } finally {
            setLoading(false);
        }
    };

    const handleBatchIssue = async () => {
        if (!preview || preview.validCount === 0) return;
        setLoading(true);
        try {
            // Re-parse the CSV to get student data for issuance
            const lines = csvContent.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const students = [];

            for (let i = 1; i < lines.length && students.length < 50; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length !== headers.length) continue;
                const row = {};
                headers.forEach((header, idx) => {
                    if (['fullname', 'full_name', 'name', 'student_name'].includes(header)) row.fullName = values[idx];
                    else if (['studentid', 'student_id', 'roll_number', 'rollno'].includes(header)) row.studentId = values[idx];
                    else if (['degreeprogramme', 'degree_programme', 'degree', 'programme'].includes(header)) row.degreeProgramme = values[idx];
                    else if (['graduationyear', 'graduation_year', 'year'].includes(header)) row.graduationYear = parseInt(values[idx]) || values[idx];
                });
                if (row.fullName && row.studentId && row.degreeProgramme && row.graduationYear) {
                    students.push(row);
                }
            }

            const res = await axios.post(`${API_BASE_URL}/api/v1/bulk/batch-issue`, {
                students,
                institutionAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                institutionName: 'Testing Institution'
            });

            if (res.data.success) {
                setIssueResult(res.data.data);
                setStep('done');
            }
        } catch (e) {
            console.error('Batch issue error:', e);
            alert('Failed to issue certificates in batch.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setCsvContent('');
        setPreview(null);
        setIssueResult(null);
        setStep('upload');
    };

    return (
        <div className="bulk-upload" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="mb-8">
                <h1>Bulk Upload CSV</h1>
                <p className="text-muted mt-1">Upload a CSV file to issue multiple certificates in one transaction (max 50).</p>
            </div>

            {step === 'upload' && (
                <Card className="animate-fade-in">
                    <CardBody className="flex flex-col gap-6">
                        {/* File Upload Zone */}
                        <div>
                            <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                                Upload CSV File
                            </label>
                            <div
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--primary-10)'; }}
                                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'var(--surface)'; }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.backgroundColor = 'var(--surface)';
                                    const file = e.dataTransfer.files[0];
                                    if (file && file.name.endsWith('.csv')) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => setCsvContent(ev.target.result);
                                        reader.readAsText(file);
                                    } else {
                                        alert('Please drop a .csv file');
                                    }
                                }}
                                onClick={() => document.getElementById('csv-file-input').click()}
                                style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '32px 24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: 'var(--surface)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <UploadCloud size={36} style={{ margin: '0 auto 12px', color: 'var(--text-muted)', display: 'block' }} />
                                <p style={{ fontWeight: 500, marginBottom: '4px' }}>
                                    Drag & drop a CSV file here, or click to browse
                                </p>
                                <p className="text-muted" style={{ fontSize: '13px' }}>Accepts .csv files up to 50 rows</p>
                            </div>
                            <input
                                id="csv-file-input"
                                type="file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => setCsvContent(ev.target.result);
                                        reader.readAsText(file);
                                        e.target.value = ''; // Reset so same file can be re-selected
                                    }
                                }}
                            />
                        </div>

                        {/* OR Divider */}
                        <div className="flex items-center gap-3">
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                            <span className="text-muted" style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>or paste CSV content</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                        </div>

                        {/* Textarea */}
                        <div>
                            <textarea
                                className="input"
                                rows={8}
                                placeholder={`fullName,studentId,degreeProgramme,graduationYear\nJohn Doe,CS001,B.Tech,2025\nJane Smith,CS002,M.Tech,2024`}
                                value={csvContent}
                                onChange={(e) => setCsvContent(e.target.value)}
                                style={{
                                    width: '100%',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '13px',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--surface)',
                                    color: 'var(--text)',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                                <FileText size={16} className="text-muted" />
                                <span className="text-muted" style={{ fontSize: '13px', fontWeight: 500 }}>Expected CSV Format</span>
                            </div>
                            <code className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                fullName, studentId, degreeProgramme, graduationYear
                            </code>
                        </div>
                    </CardBody>
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleUpload} disabled={!csvContent.trim() || loading}>
                            {loading ? 'Parsing...' : <><UploadCloud size={18} /> Upload & Validate</>}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 'preview' && preview && (
                <Card className="animate-slide-up">
                    <CardBody>
                        <h3 style={{ marginBottom: '16px' }}>CSV Validation Results</h3>

                        <div className="flex gap-4" style={{ marginBottom: '24px' }}>
                            <div style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg)', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 700 }}>{preview.totalRows}</div>
                                <div className="text-muted" style={{ fontSize: '13px' }}>Total Rows</div>
                            </div>
                            <div style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg)', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{preview.validCount}</div>
                                <div className="text-muted" style={{ fontSize: '13px' }}>Valid</div>
                            </div>
                            <div style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg)', textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: preview.errorCount > 0 ? 'var(--danger)' : 'var(--text)' }}>{preview.errorCount}</div>
                                <div className="text-muted" style={{ fontSize: '13px' }}>Errors</div>
                            </div>
                        </div>

                        {preview.preview && preview.preview.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ marginBottom: '8px' }}>Preview (first 5 rows)</h4>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="dash-table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Student ID</th>
                                                <th>Degree</th>
                                                <th>Year</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.preview.map((row, i) => (
                                                <tr key={i}>
                                                    <td>{row.fullName}</td>
                                                    <td className="mono">{row.studentId}</td>
                                                    <td>{row.degreeProgramme}</td>
                                                    <td>{row.graduationYear}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {preview.errors && preview.errors.length > 0 && (
                            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(229, 62, 62, 0.08)', border: '1px solid rgba(229, 62, 62, 0.2)' }}>
                                <div className="flex items-center gap-2" style={{ marginBottom: '8px', color: 'var(--danger)' }}>
                                    <AlertTriangle size={16} />
                                    <span style={{ fontWeight: 500 }}>Validation Errors</span>
                                </div>
                                {preview.errors.map((err, i) => (
                                    <div key={i} className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>
                                        Row {err.row}: {err.errors.join(', ')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost" onClick={reset}>Back</Button>
                        <Button variant="primary" onClick={handleBatchIssue} disabled={preview.validCount === 0 || loading}>
                            {loading ? 'Issuing...' : `Issue ${preview.validCount} Certificates`}
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {step === 'done' && issueResult && (
                <Card className="animate-spring text-center" style={{ padding: '48px 24px' }}>
                    <CardBody className="flex flex-col items-center">
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13, 171, 118, 0.1)', color: 'var(--success)', marginBottom: '24px' }}>
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 style={{ marginBottom: '8px' }}>Batch Issuance Complete!</h2>
                        <p className="text-muted" style={{ marginBottom: '24px' }}>{issueResult.count} certificates have been recorded on the blockchain.</p>

                        <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '500px', marginBottom: '24px' }}>
                            <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Transaction Hash</div>
                            <div className="mono" style={{ fontSize: '13px', wordBreak: 'break-all' }}>{issueResult.txHash}</div>
                        </div>

                        <Button variant="primary" onClick={reset}>Upload Another Batch</Button>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
