import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { FaBus, FaMapMarkedAlt, FaClock, FaSignOutAlt } from 'react-icons/fa';
import '../styles/Dashboard.css';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardService.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>🚌 E-Bus System</h2>
        </div>
        <div className="navbar-menu">
          <span className="user-name">Welcome, {user?.name}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1>Student Dashboard</h1>
          <p>Track your bus in real-time</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaBus />
            </div>
            <div className="stat-content">
              <h3>{stats?.activeShifts || 0}</h3>
              <p>Active Buses</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>On Time</h3>
              <p>Bus Status</p>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <div className="action-card" onClick={() => navigate('/tracking')}>
            <FaMapMarkedAlt size={48} />
            <h3>Live Bus Tracking</h3>
            <p>See real-time location of your bus</p>
            <button className="btn btn-primary">Track Now</button>
          </div>
        </div>

        <div className="card">
          <h3>Your Bus Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Route:</label>
              <span>Campus - Main Gate</span>
            </div>
            <div className="info-item">
              <label>Bus Number:</label>
              <span>BUS-001</span>
            </div>
            <div className="info-item">
              <label>Shift Time:</label>
              <span>8:00 AM - 9:00 AM</span>
            </div>
            <div className="info-item">
              <label>Seat Number:</label>
              <span>A-12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;