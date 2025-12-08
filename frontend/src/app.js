import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './app.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LiveTracking from './pages/LiveTracking';
import BusManagement from './pages/BusManagement';
import DriverManagement from './pages/DriverManagement';
import RouteManagement from './pages/RouteManagement';
import ShiftManagement from './pages/ShiftManagement';
import StudentManagement from './pages/StudentManagement';
import Analytics from './pages/Analytics';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.userType !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Navigate to={localStorage.getItem('userType') === 'admin' ? '/admin' : '/student'} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/student" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tracking" 
              element={
                <ProtectedRoute>
                  <LiveTracking />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/buses" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <BusManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/drivers" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <DriverManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/routes" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <RouteManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/shifts" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ShiftManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/students" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <StudentManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Analytics />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
