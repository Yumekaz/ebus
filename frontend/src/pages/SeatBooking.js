import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaChair, FaCheck } from 'react-icons/fa';
import '../styles/SeatBooking.css';

const SeatBooking = () => {
    const [shifts, setShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadShifts();
    }, []);

    const loadShifts = async () => {
        try {
            const response = await api.get('/bookings/shifts');
            setShifts(response.data.data || []);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load shifts');
            setLoading(false);
        }
    };

    const loadSeats = async (shiftId) => {
        try {
            const response = await api.get(`/bookings/seats/${shiftId}`);
            setSeats(response.data.data.seats || []);
            setSelectedSeat(null);
        } catch (error) {
            toast.error('Failed to load seats');
        }
    };

    const handleShiftSelect = (shift) => {
        setSelectedShift(shift);
        loadSeats(shift.id);
    };

    const handleSeatClick = (seat) => {
        if (seat.isBooked && !seat.isOwn) return; // Can't select booked seats
        setSelectedSeat(seat.seatNumber);
    };

    const handleBookSeat = async () => {
        if (!selectedShift || !selectedSeat) return;

        setBookingLoading(true);
        try {
            await api.post('/bookings/book', {
                shift_id: selectedShift.id,
                seat_number: selectedSeat
            });
            toast.success('Seat booked successfully!');
            loadSeats(selectedShift.id);
            setSelectedSeat(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to book seat');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <button className="btn btn-secondary" onClick={() => navigate('/student')}>
                    <FaArrowLeft /> Back
                </button>
                <h1>Book Your Seat</h1>
            </div>

            <div className="booking-layout">
                {/* Shift Selection */}
                <div className="card shift-list">
                    <h3>Select a Shift</h3>
                    {shifts.length === 0 ? (
                        <p className="no-data">No available shifts</p>
                    ) : (
                        <div className="shift-items">
                            {shifts.map((shift) => (
                                <div
                                    key={shift.id}
                                    className={`shift-item ${selectedShift?.id === shift.id ? 'active' : ''}`}
                                    onClick={() => handleShiftSelect(shift)}
                                >
                                    <div className="shift-header">
                                        <strong>{shift.bus_number}</strong>
                                        <span className="badge badge-info">{shift.shift_type}</span>
                                    </div>
                                    <p><strong>Route:</strong> {shift.route_name}</p>
                                    <p><strong>Date:</strong> {shift.shift_date}</p>
                                    <p><strong>Time:</strong> {shift.start_time} - {shift.end_time}</p>
                                    <p><strong>Available:</strong> {shift.capacity - (shift.booked_seats || 0)} / {shift.capacity}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Seat Selection */}
                <div className="card seat-selection">
                    <h3>Select a Seat</h3>
                    {!selectedShift ? (
                        <p className="no-data">Please select a shift first</p>
                    ) : (
                        <>
                            <div className="seat-legend">
                                <div className="legend-item">
                                    <div className="seat-demo available"></div>
                                    <span>Available</span>
                                </div>
                                <div className="legend-item">
                                    <div className="seat-demo booked"></div>
                                    <span>Booked</span>
                                </div>
                                <div className="legend-item">
                                    <div className="seat-demo selected"></div>
                                    <span>Selected</span>
                                </div>
                                <div className="legend-item">
                                    <div className="seat-demo own"></div>
                                    <span>Your Seat</span>
                                </div>
                            </div>

                            <div className="bus-front">
                                <div className="driver-area">🚌 Driver</div>
                            </div>

                            <div className="seat-grid">
                                {seats.map((seat) => (
                                    <div
                                        key={seat.seatNumber}
                                        className={`seat ${seat.isOwn ? 'own' :
                                                seat.isBooked ? 'booked' :
                                                    selectedSeat === seat.seatNumber ? 'selected' : 'available'
                                            }`}
                                        onClick={() => handleSeatClick(seat)}
                                        title={seat.isBooked ? (seat.isOwn ? 'Your seat' : 'Booked') : `Seat ${seat.seatNumber}`}
                                    >
                                        <FaChair />
                                        <span>{seat.seatNumber}</span>
                                    </div>
                                ))}
                            </div>

                            {selectedSeat && (
                                <div className="booking-action">
                                    <p>You selected: <strong>Seat {selectedSeat}</strong></p>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={handleBookSeat}
                                        disabled={bookingLoading}
                                    >
                                        <FaCheck /> {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeatBooking;
