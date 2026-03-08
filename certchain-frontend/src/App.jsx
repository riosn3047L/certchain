import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import VerificationPortal from './pages/VerificationPortal.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import IssueCertificate from './pages/admin/IssueCertificate.jsx';
import BulkUpload from './pages/admin/BulkUpload.jsx';
import ManageCertificates from './pages/admin/ManageCertificates.jsx';
import Institutions from './pages/admin/Institutions.jsx';
import WalletLayout from './pages/wallet/WalletLayout.jsx';
import MyCertificates from './pages/wallet/MyCertificates.jsx';
import SharePage from './pages/wallet/SharePage.jsx';
import ProfilePage from './pages/wallet/ProfilePage.jsx';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/verify" element={<VerificationPortal />} />

      {/* Admin Portal Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="issue" element={<IssueCertificate />} />
        <Route path="bulk" element={<BulkUpload />} />
        <Route path="manage" element={<ManageCertificates />} />
        <Route path="institutions" element={<Institutions />} />
      </Route>

      {/* Graduate Wallet Routes */}
      <Route path="/wallet" element={<WalletLayout />}>
        <Route index element={<MyCertificates />} />
        <Route path="share" element={<SharePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
