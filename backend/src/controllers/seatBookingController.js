const db = require('../config/database');
const { formatResponse } = require('../utils/helpers');

// Get available shifts for booking (scheduled/active shifts)
const getAvailableShifts = async (req, res) => {
    try {
        const [shifts] = await db.query(`
            SELECT s.*, 
                   b.bus_number, b.capacity,
                   r.route_name as route_name,
                   d.full_name as driver_name,
                   (SELECT COUNT(*) FROM seat_allocations sa 
                    WHERE sa.shift_id = s.id AND sa.status != 'cancelled') as booked_seats
            FROM shifts s
            JOIN buses b ON s.bus_id = b.id
            JOIN routes r ON s.route_id = r.id
            LEFT JOIN drivers d ON s.driver_id = d.id
            WHERE s.status IN ('scheduled', 'active')
            AND s.shift_date >= DATE('now', 'localtime')
            ORDER BY s.shift_date, s.start_time
        `);

        res.json(formatResponse(true, 'Available shifts retrieved', shifts));
    } catch (error) {
        console.error('Get available shifts error:', error);
        res.status(500).json(formatResponse(false, 'Failed to get shifts'));
    }
};

// Get seat availability for a specific shift
const getShiftSeats = async (req, res) => {
    try {
        const { shiftId } = req.params;

        // Get shift and bus info
        const [shiftRows] = await db.query(`
            SELECT s.*, b.capacity, b.bus_number
            FROM shifts s
            JOIN buses b ON s.bus_id = b.id
            WHERE s.id = ?
        `, [shiftId]);

        if (shiftRows.length === 0) {
            return res.status(404).json(formatResponse(false, 'Shift not found'));
        }

        const shift = shiftRows[0];

        // Get booked seats
        const [bookedSeats] = await db.query(`
            SELECT seat_number, student_id
            FROM seat_allocations
            WHERE shift_id = ? AND status != 'cancelled'
        `, [shiftId]);

        // Build seat map
        const seats = [];
        for (let i = 1; i <= shift.capacity; i++) {
            const booking = bookedSeats.find(b => b.seat_number === i);
            seats.push({
                seatNumber: i,
                isBooked: !!booking,
                isOwn: booking && booking.student_id === req.user.id
            });
        }

        res.json(formatResponse(true, 'Seats retrieved', {
            shift: {
                id: shift.id,
                busNumber: shift.bus_number,
                capacity: shift.capacity,
                shiftDate: shift.shift_date,
                startTime: shift.start_time,
                endTime: shift.end_time
            },
            seats
        }));
    } catch (error) {
        console.error('Get shift seats error:', error);
        res.status(500).json(formatResponse(false, 'Failed to get seats'));
    }
};

// Book a seat
const bookSeat = async (req, res) => {
    try {
        const { shift_id, seat_number } = req.body;
        const studentId = req.user.id;

        // Check if seat is available
        const [existing] = await db.query(`
            SELECT id FROM seat_allocations
            WHERE shift_id = ? AND seat_number = ? AND status != 'cancelled'
        `, [shift_id, seat_number]);

        if (existing.length > 0) {
            return res.status(400).json(formatResponse(false, 'Seat already booked'));
        }

        // Check if student already has a booking for this shift
        const [studentBooking] = await db.query(`
            SELECT id FROM seat_allocations
            WHERE shift_id = ? AND student_id = ? AND status != 'cancelled'
        `, [shift_id, studentId]);

        if (studentBooking.length > 0) {
            return res.status(400).json(formatResponse(false, 'You already have a seat booked for this shift'));
        }

        // Get shift date
        const [shiftRows] = await db.query('SELECT shift_date FROM shifts WHERE id = ?', [shift_id]);
        if (shiftRows.length === 0) {
            return res.status(404).json(formatResponse(false, 'Shift not found'));
        }

        // Book the seat
        await db.query(`
            INSERT INTO seat_allocations (student_id, shift_id, seat_number, allocation_date, status)
            VALUES (?, ?, ?, ?, 'allocated')
        `, [studentId, shift_id, seat_number, shiftRows[0].shift_date]);

        res.status(201).json(formatResponse(true, 'Seat booked successfully'));
    } catch (error) {
        console.error('Book seat error:', error);
        res.status(500).json(formatResponse(false, 'Failed to book seat'));
    }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id;

        // Verify ownership
        const [booking] = await db.query(
            'SELECT * FROM seat_allocations WHERE id = ? AND student_id = ?',
            [id, studentId]
        );

        if (booking.length === 0) {
            return res.status(404).json(formatResponse(false, 'Booking not found'));
        }

        await db.query(
            "UPDATE seat_allocations SET status = 'cancelled' WHERE id = ?",
            [id]
        );

        res.json(formatResponse(true, 'Booking cancelled successfully'));
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json(formatResponse(false, 'Failed to cancel booking'));
    }
};

// Get student's bookings
const getMyBookings = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [bookings] = await db.query(`
            SELECT sa.*, 
                   s.shift_date, s.start_time, s.end_time, s.shift_type,
                   b.bus_number,
                   r.route_name as route_name
            FROM seat_allocations sa
            JOIN shifts s ON sa.shift_id = s.id
            JOIN buses b ON s.bus_id = b.id
            JOIN routes r ON s.route_id = r.id
            WHERE sa.student_id = ? AND sa.status != 'cancelled'
            ORDER BY s.shift_date DESC, s.start_time DESC
        `, [studentId]);

        res.json(formatResponse(true, 'Bookings retrieved', bookings));
    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json(formatResponse(false, 'Failed to get bookings'));
    }
};

module.exports = {
    getAvailableShifts,
    getShiftSeats,
    bookSeat,
    cancelBooking,
    getMyBookings
};
