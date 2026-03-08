import React from 'react';
import Card, { CardBody } from '../../components/Card.jsx';
import { User } from 'lucide-react';

export default function ProfilePage() {
    return (
        <div className="profile-page">
            <div className="mb-6">
                <h2 className="text-xl">Profile</h2>
                <p className="text-muted text-sm mt-1">Manage your wallet identity and notification preferences.</p>
            </div>

            <Card>
                <CardBody className="flex flex-col items-center justify-center" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <User size={48} className="text-muted" style={{ marginBottom: '16px', opacity: 0.4 }} />
                    <h3 style={{ marginBottom: '8px' }}>Coming Soon</h3>
                    <p className="text-muted" style={{ maxWidth: '320px' }}>
                        Profile settings, notification preferences, and wallet management will appear here.
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
