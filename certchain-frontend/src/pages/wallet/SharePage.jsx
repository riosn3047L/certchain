import React from 'react';
import Card, { CardBody } from '../../components/Card.jsx';
import { Share2 } from 'lucide-react';

export default function SharePage() {
    return (
        <div className="share-page">
            <div className="mb-6">
                <h2 className="text-xl">Share Certificates</h2>
                <p className="text-muted text-sm mt-1">Generate selective-disclosure links to share your credentials with employers.</p>
            </div>

            <Card>
                <CardBody className="flex flex-col items-center justify-center" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <Share2 size={48} className="text-muted" style={{ marginBottom: '16px', opacity: 0.4 }} />
                    <h3 style={{ marginBottom: '8px' }}>Coming Soon</h3>
                    <p className="text-muted" style={{ maxWidth: '320px' }}>
                        You'll be able to create time-limited verification links that only reveal the fields you choose.
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
