const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

const busValidation = {
    create: [
        body('bus_number').trim().notEmpty().withMessage('Bus number is required'),
        body('registration_number').trim().notEmpty().withMessage('Registration number is required'),
        body('capacity').isInt({ min: 1 }).withMessage('Valid capacity required'),
        body('bus_type').optional().isIn(['standard', 'luxury', 'mini']),
        validate
    ],
    update: [
        param('id').isInt().withMessage('Valid bus ID required'),
        body('capacity').optional().isInt({ min: 1 }),
        validate
    ]
};

const driverValidation = {
    create: [
        body('driver_id').trim().notEmpty().withMessage('Driver ID is required'),
        body('full_name').trim().notEmpty().withMessage('Full name is required'),
        body('phone').trim().notEmpty().withMessage('Phone is required'),
        body('license_number').trim().notEmpty().withMessage('License number is required'),
        body('license_expiry').isISO8601().withMessage('Valid expiry date required'),
        body('date_of_birth').isISO8601().withMessage('Valid date of birth required'),
        validate
    ]
};

const routeValidation = {
    create: [
        body('route_code').trim().notEmpty().withMessage('Route code is required'),
        body('route_name').trim().notEmpty().withMessage('Route name is required'),
        body('start_location').trim().notEmpty().withMessage('Start location is required'),
        body('end_location').trim().notEmpty().withMessage('End location is required'),
        validate
    ]
};

const studentValidation = {
    create: [
        body('student_id').trim().notEmpty().withMessage('Student ID is required'),
        body('full_name').trim().notEmpty().withMessage('Full name is required'),
        body('email').isEmail().withMessage('Valid email required'),
        body('parent_phone').trim().notEmpty().withMessage('Parent phone is required'),
        validate
    ]
};

const shiftValidation = {
    create: [
        body('bus_id').isInt().withMessage('Valid bus ID required'),
        body('driver_id').isInt().withMessage('Valid driver ID required'),
        body('route_id').isInt().withMessage('Valid route ID required'),
        body('shift_type').isIn(['morning', 'afternoon', 'evening']).withMessage('Valid shift type required'),
        body('start_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid start time required'),
        body('end_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid end time required'),
        body('shift_date').isISO8601().withMessage('Valid shift date required'),
        validate
    ]
};

const gpsValidation = {
    log: [
        body('bus_id').isInt().withMessage('Valid bus ID required'),
        body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
        body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
        body('speed').optional().isFloat({ min: 0 }),
        body('heading').optional().isFloat({ min: 0, max: 360 }),
        validate
    ]
};

module.exports = {
    validate,
    busValidation,
    driverValidation,
    routeValidation,
    studentValidation,
    shiftValidation,
    gpsValidation
};
