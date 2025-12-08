import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { busService } from '../services/busService';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    bus_number: '',
    registration_number: '',
    capacity: '',
    bus_type: 'standard',
    model: '',
    year: '',
    gps_device_id: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      const response = await busService.getAll();
      setBuses(response.data.data.buses || response.data.data || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load buses');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await busService.update(editingBus.id, formData);
        toast.success('Bus updated successfully');
      } else {
        await busService.create(formData);
        toast.success('Bus created successfully');
      }
      setShowModal(false);
      resetForm();
      loadBuses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      bus_number: bus.bus_number,
      registration_number: bus.registration_number,
      capacity: bus.capacity,
      bus_type: bus.bus_type,
      model: bus.model || '',
      year: bus.year || '',
      gps_device_id: bus.gps_device_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this bus?')) {
      try {
        await busService.delete(id);
        toast.success('Bus deactivated successfully');
        loadBuses();
      } catch (error) {
        toast.error('Failed to deactivate bus');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      bus_number: '',
      registration_number: '',
      capacity: '',
      bus_type: 'standard',
      model: '',
      year: '',
      gps_device_id: ''
    });
    setEditingBus(null);
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
        <h1>Bus Management</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaPlus /> Add Bus
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Bus Number</th>
              <th>Registration</th>
              <th>Capacity</th>
              <th>Type</th>
              <th>Model</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id}>
                <td><strong>{bus.bus_number}</strong></td>
                <td>{bus.registration_number}</td>
                <td>{bus.capacity} seats</td>
                <td><span className="badge badge-info">{bus.bus_type}</span></td>
                <td>{bus.model || 'N/A'}</td>
                <td>
                  <span className={`badge ${bus.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {bus.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => handleEdit(bus)} style={{ marginRight: '8px' }}>
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(bus.id)}>
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
              <h2>{editingBus ? 'Edit Bus' : 'Add New Bus'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Bus Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.bus_number}
                  onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Registration Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Bus Type</label>
                <select
                  className="form-control"
                  value={formData.bus_type}
                  onChange={(e) => setFormData({ ...formData, bus_type: e.target.value })}
                >
                  <option value="standard">Standard</option>
                  <option value="luxury">Luxury</option>
                  <option value="mini">Mini</option>
                </select>
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  min="1900"
                  max="2100"
                />
              </div>
              <div className="form-group">
                <label>GPS Device ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.gps_device_id}
                  onChange={(e) => setFormData({ ...formData, gps_device_id: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBus ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;