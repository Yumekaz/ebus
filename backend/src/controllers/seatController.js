const seatDb = require('../config/database');
const fbService = require('../services/firebaseServices.js');

const allocateSeat = async (req, res) => {
    try {
        const { student_id, shift_id, seat_number, allocation_date } = req.body;
        
        // Check if seat is already allocated
        const existing = await seatDb.query(
            `SELECT * FROM seat_allocations 
             WHERE shift_id = ? AND seat_number = ? AND allocation_date = ? AND status != 'cancelled'`,
            [shift_id, seat_number, allocation_date]
        );
        
        if (existing.length > 0) {
            return res.status(400).json(formatResponse(false, 'Seat already allocated'));
        }
        
        // Check bus capacity
        const shift = await seatDb.query(
            `SELECT b.capacity FROM shifts s JOIN buses b ON s.bus_id = b.id WHERE s.id = ?`,
            [shift_id]
        );
        
        if (shift.length > 0 && seat_number > shift[0].capacity) {
            return res.status(400).json(formatResponse(false, 'Invalid seat number'));
        }
        
        const result = await seatDb.query(
            `INSERT INTO seat_allocations (student_id, shift_id, seat_number, allocation_date)
             VALUES (?, ?, ?, ?)`,
            [student_id, shift_id, seat_number, allocation_date]
        );
        
        // Update occupancy in Firebase
        await updateOccupancyCount(shift_id);
        
        res.status(201).json(formatResponse(true, 'Seat allocated successfully', { id: result.insertId }));
    } catch (error) {
        console.error('Allocate seat error:', error);
        res.status(500).json(formatResponse(false, 'Failed to allocate seat'));
    }
};

const updateOccupancyCount = async (shiftId) => {
    try {
        const [occupancy, shift] = await Promise.all([
            seatDb.query(
                `SELECT COUNT(*) as occupied FROM seat_allocations 
                 WHERE shift_id = ? AND status = 'allocated'`,
                [shiftId]
            ),
            seatDb.query(
                `SELECT b.capacity FROM shifts s JOIN buses b ON s.bus_id = b.id WHERE s.id = ?`,
                [shiftId]
            )
        ]);
        
        if (shift.length > 0) {
            const totalSeats = shift[0].capacity;
            const occupiedSeats = occupancy[0].occupied;
            
            await fbService.updateSeatOccupancy(shiftId, {
                totalSeats,
                occupiedSeats,
                availableSeats: totalSeats - occupiedSeats
            });
        }
    } catch (error) {
        console.error('Update occupancy error:', error);
    }
};

const getSeatAllocations = async (req, res) => {
    try {
        const { shift_id } = req.params;
        
        const results = await seatDb.query(
            `SELECT sa.*, st.full_name as student_name, st.student_id
             FROM seat_allocations sa
             JOIN students st ON sa.student_id = st.id
             WHERE sa.shift_id = ? AND sa.status != 'cancelled'
             ORDER BY sa.seat_number`,
            [shift_id]
        );
        
        res.json(formatResponse(true, 'Seat allocations retrieved', results));
    } catch (error) {
        console.error('Get seat allocations error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve seat allocations'));
    }
};

module.exports = { allocateSeat, getSeatAllocations };
