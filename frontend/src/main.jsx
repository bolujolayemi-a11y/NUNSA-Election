import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import useAuthStore from './store/authStore';
import LoginPage from './pages/LoginPage';
import VotePage from './pages/VotePage';
import SuccessPage from './pages/SuccessPage';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import AdminResults from './pages/AdminResults';
import MasterLogin from './pages/MasterLogin';
import MasterDashboard from './pages/MasterDashboard';
import VerificationPage from './pages/VerificationPage';
import AccreditDetails from './pages/AccreditDetails';
import PublicResults from './pages/PublicResults';

function ProtectedVoter({ children }) {
  const { voterToken } = useAuthStore();
  if (!voterToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function ProtectedAdmin({ children }) {
  const { adminToken } = useAuthStore();
  if (!adminToken) {
    return <Navigate to="/secure-admin" replace />;
  }
  return children;
}

function ProtectedMaster({ children }) {
  const { masterToken } = useAuthStore();
  if (!masterToken) {
    return <Navigate to="/master/login" replace />;
  }
  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route 
      path="/login" 
      element={
      <LoginPage />
      } 
      />
      <Route 
      path="/vote" 
      element={
      <ProtectedVoter>
        <VotePage />
        </ProtectedVoter>
      } 
      />
      <Route 
      path="/success" 
      element={
      <ProtectedVoter>
        <SuccessPage />
        </ProtectedVoter>
      } 
      />
      <Route 
      path="/secure-admin" 
      element={<AdminLogin />
      } 
      />
<Route
  path="/secure-admin/dashboard"
  element={
    <ProtectedAdmin>
      <AdminPanel />
    </ProtectedAdmin>
  }
/>
<Route
  path="/secure-admin/results"
  element={
    <ProtectedAdmin>
      <AdminResults />
    </ProtectedAdmin>
  }
/>
<Route 
  path="/master/login" 
  element={
    <MasterLogin />
    } 
    />
<Route 
  path="/master/dashboard" 
  element={
  <ProtectedMaster>
    <MasterDashboard />
    </ProtectedMaster>
  } 
  />
<Route 
  path="/verification" 
  element={
    <ProtectedAdmin>
      <VerificationPage />
    </ProtectedAdmin>
  } 
/>
<Route
  path="/accredit-details"
  element={
    <ProtectedAdmin>
      <AccreditDetails />
    </ProtectedAdmin>
  }
/>
<Route path="/public-results" element={<PublicResults />} />
<Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);