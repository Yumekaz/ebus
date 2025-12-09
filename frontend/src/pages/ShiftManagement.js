import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shiftService } from '../services/shiftService';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    loadShifts();
  }, [filterDate]);

  const loadShifts = async () => {
    try {
      const response = await shiftService.getAll({ date: filterDate });
      setShifts(response.data.data || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load shifts');
      setLoading(false);
    }
  };

  const handleSimulate = async (shiftId) => {
    try {
      const api = require('../services/api').default;
      await api.post('/simulation/start', { shift_id: shiftId, speed_multiplier: 2 }); // 2x speed (Medium)
      toast.info('Simulation started. Check Live Tracking!');
      loadShifts();
    } catch (error) {
      toast.error('Failed to start simulation');
    }
  };

  const handleStatusUpdate = async (shiftId, newStatus) => {
    try {
      await shiftService.updateStatus(shiftId, newStatus);
      toast.success('Shift status updated');
      loadShifts();
    } catch (error) {
      toast.error('Failed to update shift status');
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
        <h1>Shift Management</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/shifts/new')}>
          <FaPlus /> Schedule Shift
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <label>Date:</label>
          <input
            type="date"
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Shift Type</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No shifts scheduled for this date</td>
              </tr>
            ) : (
              shifts.map((shift) => (
                <tr key={shift.id}>
                  <td><strong>{shift.bus_number}</strong></td>
                  <td>{shift.driver_name}</td>
                  <td>{shift.route_name}</td>
                  <td><span className="badge badge-info">{shift.shift_type}</span></td>
                  <td>{shift.start_time} - {shift.end_time}</td>
                  <td>
                    <span className={`badge badge-${shift.status === 'active' ? 'success' :
                      shift.status === 'completed' ? 'info' :
                        shift.status === 'cancelled' ? 'danger' : 'warning'
                      }`}>
                      {shift.status}
                    </span>
                  </td>
                  <td>
                    {shift.status === 'scheduled' && (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleStatusUpdate(shift.id, 'active')}
                          style={{ marginRight: '5px' }}
                        >
                          Start
                        </button>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleSimulate(shift.id)}
                        >
                          Simulate
                        </button>
                      </>
                    )}
                    {shift.status === 'active' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleStatusUpdate(shift.id, 'completed')}
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftManagement;