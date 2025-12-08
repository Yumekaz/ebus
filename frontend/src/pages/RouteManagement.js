import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';


const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    route_code: '',
    route_name: '',
    start_location: '',
    end_location: '',
    total_distance_km: '',
    estimated_duration_minutes: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const response = await api.get('/routes');
      setRoutes(response.data.data || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load routes');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      route_code: '',
      route_name: '',
      start_location: '',
      end_location: '',
      total_distance_km: '',
      estimated_duration_minutes: ''
    });
    setEditingRoute(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await api.put(`/routes/${editingRoute.id}`, formData);
        toast.success('Route updated successfully');
      } else {
        await api.post('/routes', formData);
        toast.success('Route created successfully');
      }
      setShowModal(false);
      resetForm();
      loadRoutes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      route_code: route.route_code,
      route_name: route.route_name,
      start_location: route.start_location,
      end_location: route.end_location,
      total_distance_km: route.total_distance_km || '',
      estimated_duration_minutes: route.estimated_duration_minutes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this route?')) {
      try {
        await api.delete(`/routes/${id}`);
        toast.success('Route deactivated successfully');
        loadRoutes();
      } catch (error) {
        toast.error('Failed to deactivate route');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
          <FaArrowLeft /> Back
        </button>
        <h1>Route Management</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaPlus /> Add Route
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Route Code</th>
              <th>Route Name</th>
              <th>Start Location</th>
              <th>End Location</th>
              <th>Distance (km)</th>
              <th>Duration (min)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id}>
                <td><strong>{route.route_code}</strong></td>
                <td>{route.route_name}</td>
                <td>{route.start_location}</td>
                <td>{route.end_location}</td>
                <td>{route.total_distance_km || 'N/A'}</td>
                <td>{route.estimated_duration_minutes || 'N/A'}</td>
                <td>
                  <span className={`badge ${route.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {route.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => handleEdit(route)} style={{ marginRight: '8px' }}>
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(route.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Route Code *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.route_code}
                  onChange={(e) => setFormData({ ...formData, route_code: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Route Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Location *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.start_location}
                  onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Location *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.end_location}
                  onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Distance (km)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.total_distance_km}
                  onChange={(e) => setFormData({ ...formData, total_distance_km: e.target.value })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Estimated Duration (min)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.estimated_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: e.target.value })}
                  min="0"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoute ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;
