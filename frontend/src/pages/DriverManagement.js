import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data.data || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load drivers');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
          <FaArrowLeft /> Back
        </button>
        <h1>Driver Management</h1>
        <button className="btn btn-primary">
          <FaPlus /> Add Driver
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Driver ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>License Number</th>
              <th>License Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.driver_id}</td>
                <td>{driver.full_name}</td>
                <td>{driver.phone}</td>
                <td>{driver.license_number}</td>
                <td>{new Date(driver.license_expiry).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${driver.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {driver.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverManagement;
