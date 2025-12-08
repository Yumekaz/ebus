import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { 
  FaBus, FaUsers, FaUserTie, FaChartBar, FaMapMarkedAlt, FaSignOutAlt, FaCog, FaClock 
} from 'react-icons/fa';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand"><h2>🚌 E-Bus Admin</h2></div>
        <div className="navbar-menu">
          <span className="user-name">Admin: {user?.name}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your bus fleet and operations</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon"><FaBus /></div>
            <div className="stat-content">
              <h3>{stats?.totalBuses || 0}</h3>
              <p>Total Buses</p>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon"><FaUserTie /></div>
            <div className="stat-content">
              <h3>{stats?.totalDrivers || 0}</h3>
              <p>Active Drivers</p>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-content">
              <h3>{stats?.totalStudents || 0}</h3>
              <p>Registered Students</p>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon"><FaBus /></div>
            <div className="stat-content">
              <h3>{stats?.activeShifts || 0}</h3>
              <p>Active Shifts</p>
            </div>
          </div>
        </div>

        <div className="admin-menu-grid">
          <div className="menu-card" onClick={() => navigate('/tracking')}>
            <FaMapMarkedAlt size={40} />
            <h3>Live Tracking</h3>
            <p>Monitor all buses in real-time</p>
          </div>

          <div className="menu-card" onClick={() => navigate('/admin/buses')}>
            <FaBus size={40} />
            <h3>Bus Management</h3>
            <p>Add, edit, and manage buses</p>
          </div>

          <div className="menu-card" onClick={() => navigate('/admin/drivers')}>
            <FaUserTie size={40} />
            <h3>Driver Management</h3>
            <p>Manage driver information</p>
          </div>

          <div className="menu-card" onClick={() => navigate('/admin/routes')}>
            <FaCog size={40} />
            <h3>Route Management</h3>
            <p>Configure routes and stops</p>
          </div>

          <div className="menu-card" onClick={() => navigate('/admin/shifts')}>
            <FaClock size={40} />
            <h3>Shift Management</h3>
            <p>Schedule and manage shifts</p>
          </div>

          <div className="menu-card" onClick={() => navigate('/admin/students')}>
            <FaUsers size={40} />
            <h3>Student Management</h3>
            <p>Manage student records</p>
          </div>

          <div className="menu-card" onClick={() => navigate('/admin/analytics')}>
            <FaChartBar size={40} />
            <h3>Analytics</h3>
            <p>View reports and insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
