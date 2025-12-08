-- E-Bus Management System - SQLite Schema

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK(role IN ('super_admin', 'admin', 'manager')),
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    license_number TEXT UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT,
    emergency_contact TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Buses Table
CREATE TABLE IF NOT EXISTS buses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_number TEXT UNIQUE NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    bus_type TEXT DEFAULT 'standard' CHECK(bus_type IN ('standard', 'luxury', 'mini')),
    model TEXT,
    year INTEGER,
    gps_device_id TEXT UNIQUE,
    is_active INTEGER DEFAULT 1,
    last_maintenance DATE,
    next_maintenance DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_code TEXT UNIQUE NOT NULL,
    route_name TEXT NOT NULL,
    start_location TEXT NOT NULL,
    end_location TEXT NOT NULL,
    total_distance_km REAL,
    estimated_duration_minutes INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Route Stops Table
CREATE TABLE IF NOT EXISTS route_stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER NOT NULL,
    stop_name TEXT NOT NULL,
    stop_order INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    estimated_arrival_time TIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- Shifts Table
CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shift_code TEXT UNIQUE NOT NULL,
    bus_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    shift_type TEXT NOT NULL CHECK(shift_type IN ('morning', 'afternoon', 'evening')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_date DATE NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'active', 'completed', 'cancelled')),
    actual_start_time DATETIME,
    actual_end_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (route_id) REFERENCES routes(id)
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    parent_phone TEXT NOT NULL,
    department TEXT,
    year INTEGER,
    address TEXT,
    pickup_stop_id INTEGER,
    drop_stop_id INTEGER,
    is_active INTEGER DEFAULT 1,
    fcm_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pickup_stop_id) REFERENCES route_stops(id),
    FOREIGN KEY (drop_stop_id) REFERENCES route_stops(id)
);

-- Seat Allocations Table
CREATE TABLE IF NOT EXISTS seat_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    shift_id INTEGER NOT NULL,
    seat_number INTEGER NOT NULL,
    allocation_date DATE NOT NULL,
    status TEXT DEFAULT 'allocated' CHECK(status IN ('allocated', 'occupied', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
    UNIQUE (shift_id, seat_number, allocation_date)
);

-- Occupancy Logs Table
CREATE TABLE IF NOT EXISTS occupancy_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shift_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    boarding_stop_id INTEGER,
    alighting_stop_id INTEGER,
    boarded_at DATETIME,
    alighted_at DATETIME,
    status TEXT DEFAULT 'boarded' CHECK(status IN ('boarded', 'in_transit', 'alighted', 'absent')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (boarding_stop_id) REFERENCES route_stops(id),
    FOREIGN KEY (alighting_stop_id) REFERENCES route_stops(id)
);

-- GPS Logs Table
CREATE TABLE IF NOT EXISTS gps_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_id INTEGER NOT NULL,
    shift_id INTEGER,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    speed REAL,
    heading REAL,
    accuracy REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info' CHECK(notification_type IN ('info', 'warning', 'alert', 'announcement')),
    target_type TEXT DEFAULT 'all' CHECK(target_type IN ('all', 'students', 'drivers', 'specific')),
    target_ids TEXT, -- JSON stored as TEXT
    sent_by INTEGER,
    is_sent INTEGER DEFAULT 0,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sent_by) REFERENCES admin_users(id)
);

-- Driver Logs Table
CREATE TABLE IF NOT EXISTS driver_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER NOT NULL,
    shift_id INTEGER NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    pre_trip_inspection INTEGER DEFAULT 0,
    post_trip_inspection INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
