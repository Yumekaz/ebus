import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { shiftService } from '../services/shiftService';

const CreateShift = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bus_id: '',
        driver_id: '',
        route_id: '',
        shift_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        shift_type: 'morning'
    });

    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [busesRes, driversRes, routesRes] = await Promise.all([
                axios.get('http://localhost:3001/api/buses?is_active=true', config),
                axios.get('http://localhost:3001/api/drivers?is_active=true', config),
                axios.get('http://localhost:3001/api/routes?is_active=true', config)
            ]);

            // Fix: accessing buses array from inside the paginated object `data.buses`
            setBuses(busesRes.data.data.buses || []);
            // Drivers and routes return array directly in `data`
            setDrivers(driversRes.data.data || []);
            setRoutes(routesRes.data.data || []);

        } catch (error) {
            console.error("Error fetching options:", error);
            toast.error('Failed to load form options');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await shiftService.create(formData);
            toast.success('Shift scheduled successfully');
            navigate('/admin/shifts');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to schedule shift');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <button className="btn btn-secondary" onClick={() => navigate('/admin/shifts')}>
                    <FaArrowLeft /> Back
                </button>
                <h1>Schedule New Shift</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>

                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="shift_date"
                            className="form-control"
                            value={formData.shift_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="row">
                        <div className="col">
                            <div className="form-group">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    name="start_time"
                                    className="form-control"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-group">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    name="end_time"
                                    className="form-control"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Shift Type</label>
                        <select name="shift_type" className="form-control" value={formData.shift_type} onChange={handleChange} required>
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                            <option value="evening">Evening</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Route</label>
                        <select name="route_id" className="form-control" value={formData.route_id} onChange={handleChange} required>
                            <option value="">Select Route</option>
                            {routes.map(r => (
                                <option key={r.id} value={r.id}>{r.route_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Bus</label>
                        <select name="bus_id" className="form-control" value={formData.bus_id} onChange={handleChange} required>
                            <option value="">Select Bus</option>
                            {buses.map(b => (
                                <option key={b.id} value={b.id}>{b.bus_number} ({b.type || 'Standard'})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Driver</label>
                        <select name="driver_id" className="form-control" value={formData.driver_id} onChange={handleChange} required>
                            <option value="">Select Driver</option>
                            {drivers.map(d => (
                                <option key={d.id} value={d.id}>{d.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions" style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <FaSave /> {loading ? 'Scheduling...' : 'Schedule Shift'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateShift;
