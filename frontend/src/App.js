import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import IssueBook from './pages/IssueBook';
import ReturnBook from './pages/ReturnBook';
import FinePayment from './pages/FinePayment';
import Maintenance from './pages/Maintenance';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/issue"
            element={
              <ProtectedRoute>
                <IssueBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/return"
            element={
              <ProtectedRoute>
                <ReturnBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/fine-payment"
            element={
              <ProtectedRoute>
                <FinePayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute adminOnly>
                <Maintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
