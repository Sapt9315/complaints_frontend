import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ComplaintForm from './components/ComplaintForm';
import ComplaintStatus from './components/ComplaintStatus';
import AdminDashboard from './components/AdminDashboard';
import BranchManagement from './components/BranchManagement';
import BranchDashboard from './components/BranchDashboard';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<ComplaintForm />} />
              <Route path="/complaint/:branchId" element={<ComplaintForm />} />
              <Route path="/status/:complaintNumber" element={<ComplaintStatus />} />
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/branches" element={
                <ProtectedRoute>
                  <BranchManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/branch-dashboard" element={
                <ProtectedRoute>
                  <BranchDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
