const express = require('express');
const router = express.Router();
const seatBookingController = require('../controllers/seatBookingController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get available shifts for booking
router.get('/shifts', seatBookingController.getAvailableShifts);

// Get seats for a specific shift
router.get('/seats/:shiftId', seatBookingController.getShiftSeats);

// Book a seat
router.post('/book', seatBookingController.bookSeat);

// Get my bookings
router.get('/my', seatBookingController.getMyBookings);

// Cancel a booking
router.delete('/:id', seatBookingController.cancelBooking);

module.exports = router;
