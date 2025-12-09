import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';
import api from '../services/api';
import { FaBus, FaMapMarkedAlt, FaClock, FaSignOutAlt, FaChair } from 'react-icons/fa';
import '../styles/Dashboard.css';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        dashboardService.getStats(),
        api.get('/bookings/my')
      ]);
      setStats(statsRes.data.data);
      setBookings(bookingsRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const upcomingBooking = bookings.find(b =>
    new Date(b.shift_date) >= new Date(new Date().toDateString())
  );

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
          <p>Track your bus and manage your seat bookings</p>
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
              <FaChair />
            </div>
            <div className="stat-content">
              <h3>{bookings.length}</h3>
              <p>My Bookings</p>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <div className="action-card" onClick={() => navigate('/student/booking')}>
            <FaChair size={48} />
            <h3>Book a Seat</h3>
            <p>Reserve your seat on an upcoming bus</p>
            <button className="btn btn-primary">Book Now</button>
          </div>

          <div className="action-card" onClick={() => navigate('/tracking')}>
            <FaMapMarkedAlt size={48} />
            <h3>Live Bus Tracking</h3>
            <p>See real-time location of your bus</p>
            <button className="btn btn-primary">Track Now</button>
          </div>
        </div>

        <div className="card">
          <h3>Your Bus Information</h3>
          {upcomingBooking ? (
            <div className="info-grid">
              <div className="info-item">
                <label>Route:</label>
                <span>{upcomingBooking.route_name}</span>
              </div>
              <div className="info-item">
                <label>Bus Number:</label>
                <span>{upcomingBooking.bus_number}</span>
              </div>
              <div className="info-item">
                <label>Date:</label>
                <span>{upcomingBooking.shift_date}</span>
              </div>
              <div className="info-item">
                <label>Time:</label>
                <span>{upcomingBooking.start_time} - {upcomingBooking.end_time}</span>
              </div>
              <div className="info-item">
                <label>Seat Number:</label>
                <span style={{ fontWeight: 'bold', color: '#2196f3' }}>
                  Seat {upcomingBooking.seat_number}
                </span>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>No upcoming bookings. Book a seat to see your bus information!</p>
              <button className="btn btn-primary" onClick={() => navigate('/student/booking')}>
                Book a Seat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;