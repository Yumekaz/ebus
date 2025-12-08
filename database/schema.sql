-- E-Bus Management System - Complete Database Schema
-- MySQL 8.0+

DROP DATABASE IF EXISTS ebus_system;
CREATE DATABASE ebus_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ebus_system;

-- Admin Users Table
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'manager') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- Drivers Table
CREATE TABLE drivers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    driver_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT,
    emergency_contact VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_driver_id (driver_id),
    INDEX idx_phone (phone),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Buses Table
CREATE TABLE buses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    registration_number VARCHAR(30) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    bus_type ENUM('standard', 'luxury', 'mini') DEFAULT 'standard',
    model VARCHAR(50),
    year INT,
    gps_device_id VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bus_number (bus_number),
    INDEX idx_active (is_active),
    INDEX idx_gps_device (gps_device_id)
) ENGINE=InnoDB;

-- Routes Table
CREATE TABLE routes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_code VARCHAR(20) UNIQUE NOT NULL,
    route_name VARCHAR(100) NOT NULL,
    start_location VARCHAR(200) NOT NULL,
    end_location VARCHAR(200) NOT NULL,
    total_distance_km DECIMAL(8,2),
    estimated_duration_minutes INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_route_code (route_code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Route Stops Table
CREATE TABLE route_stops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    stop_order INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    estimated_arrival_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_route_id (route_id),
    INDEX idx_stop_order (route_id, stop_order),
    INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB;

-- Shifts Table
CREATE TABLE shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shift_code VARCHAR(20) UNIQUE NOT NULL,
    bus_id INT NOT NULL,
    driver_id INT NOT NULL,
    route_id INT NOT NULL,
    shift_type ENUM('morning', 'afternoon', 'evening') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_date DATE NOT NULL,
    status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    INDEX idx_shift_date (shift_date),
    INDEX idx_status (status),
    INDEX idx_bus_date (bus_id, shift_date),
    INDEX idx_driver_date (driver_id, shift_date)
) ENGINE=InnoDB;

-- Students Table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    parent_phone VARCHAR(20) NOT NULL,
    department VARCHAR(50),
    year INT,
    address TEXT,
    pickup_stop_id INT,
    drop_stop_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    fcm_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pickup_stop_id) REFERENCES route_stops(id),
    FOREIGN KEY (drop_stop_id) REFERENCES route_stops(id),
    INDEX idx_student_id (student_id),
    INDEX idx_email (email),
    INDEX idx_active (is_active),
    INDEX idx_pickup_stop (pickup_stop_id),
    INDEX idx_drop_stop (drop_stop_id)
) ENGINE=InnoDB;

-- Seat Allocations Table
CREATE TABLE seat_allocations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    shift_id INT NOT NULL,
    seat_number INT NOT NULL,
    allocation_date DATE NOT NULL,
    status ENUM('allocated', 'occupied', 'cancelled') DEFAULT 'allocated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat_shift (shift_id, seat_number, allocation_date),
    INDEX idx_student_date (student_id, allocation_date),
    INDEX idx_shift_date (shift_id, allocation_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Occupancy Logs Table
CREATE TABLE occupancy_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shift_id INT NOT NULL,
    student_id INT NOT NULL,
    boarding_stop_id INT,
    alighting_stop_id INT,
    boarded_at TIMESTAMP NULL,
    alighted_at TIMESTAMP NULL,
    status ENUM('boarded', 'in_transit', 'alighted', 'absent') DEFAULT 'boarded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (boarding_stop_id) REFERENCES route_stops(id),
    FOREIGN KEY (alighting_stop_id) REFERENCES route_stops(id),
    INDEX idx_shift_id (shift_id),
    INDEX idx_student_id (student_id),
    INDEX idx_boarded_at (boarded_at),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- GPS Logs Table
CREATE TABLE gps_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bus_id INT NOT NULL,
    shift_id INT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    speed DECIMAL(5,2),
    heading DECIMAL(5,2),
    accuracy DECIMAL(6,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    INDEX idx_bus_timestamp (bus_id, timestamp),
    INDEX idx_shift_id (shift_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB;

-- Notifications Table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('info', 'warning', 'alert', 'announcement') DEFAULT 'info',
    target_type ENUM('all', 'students', 'drivers', 'specific') DEFAULT 'all',
    target_ids JSON,
    sent_by INT,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sent_by) REFERENCES admin_users(id),
    INDEX idx_type (notification_type),
    INDEX idx_target (target_type),
    INDEX idx_sent (is_sent),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Driver Logs Table
CREATE TABLE driver_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    driver_id INT NOT NULL,
    shift_id INT NOT NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    pre_trip_inspection BOOLEAN DEFAULT FALSE,
    post_trip_inspection BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_shift_id (shift_id),
    INDEX idx_check_in (check_in_time)
) ENGINE=InnoDB;

-- System Settings Table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB;

-- Insert Default Admin User (password: admin123)
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@ebus.com', '$2b$10$YourHashedPasswordHere', 'System Administrator', 'super_admin');

-- Insert Default System Settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('max_seats_per_bus', '50', 'Maximum seats per bus'),
('gps_update_interval', '10', 'GPS update interval in seconds'),
('notification_retention_days', '30', 'Days to retain notifications'),
('eta_calculation_buffer', '5', 'Buffer time in minutes for ETA'),
('allow_overbooking', 'false', 'Allow seat overbooking');

-- Create Views for Analytics

-- Active Buses View
CREATE VIEW view_active_buses AS
SELECT 
    b.id, b.bus_number, b.registration_number, b.capacity,
    d.full_name as driver_name, r.route_name,
    s.shift_type, s.status as shift_status,
    gl.latitude, gl.longitude, gl.timestamp as last_update
FROM buses b
LEFT JOIN shifts s ON b.id = s.bus_id AND s.shift_date = CURDATE() AND s.status = 'active'
LEFT JOIN drivers d ON s.driver_id = d.id
LEFT JOIN routes r ON s.route_id = r.id
LEFT JOIN (
    SELECT bus_id, latitude, longitude, timestamp,
    ROW_NUMBER() OVER (PARTITION BY bus_id ORDER BY timestamp DESC) as rn
    FROM gps_logs
    WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 HOUR)
) gl ON b.id = gl.bus_id AND gl.rn = 1
WHERE b.is_active = TRUE;

-- Daily Occupancy Summary
CREATE VIEW view_daily_occupancy AS
SELECT 
    DATE(ol.created_at) as date,
    s.shift_type,
    b.bus_number,
    COUNT(DISTINCT ol.student_id) as total_passengers,
    b.capacity,
    ROUND((COUNT(DISTINCT ol.student_id) / b.capacity) * 100, 2) as occupancy_percentage
FROM occupancy_logs ol
JOIN shifts s ON ol.shift_id = s.id
JOIN buses b ON s.bus_id = b.id
WHERE ol.status IN ('boarded', 'in_transit', 'alighted')
GROUP BY DATE(ol.created_at), s.shift_type, b.bus_number, b.capacity;

-- Student Attendance Summary
CREATE VIEW view_student_attendance AS
SELECT 
    st.student_id,
    st.full_name,
    COUNT(CASE WHEN ol.status IN ('boarded', 'in_transit', 'alighted') THEN 1 END) as days_present,
    COUNT(CASE WHEN ol.status = 'absent' THEN 1 END) as days_absent,
    DATE_FORMAT(MIN(ol.created_at), '%Y-%m') as month_year
FROM students st
LEFT JOIN occupancy_logs ol ON st.id = ol.student_id
WHERE ol.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
GROUP BY st.student_id, st.full_name, DATE_FORMAT(ol.created_at, '%Y-%m');

-- DATA INSERTION
UPDATE admin_users
SET password_hash = '$2b$10$o.JcFsNfZgQwwFE0dTgmsOPzAzuFdOIhS5fLvjlA5eT9HQd6TEeM6'
WHERE id = 1;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE driver_logs;
TRUNCATE TABLE occupancy_logs;
TRUNCATE TABLE seat_allocations;
TRUNCATE TABLE shifts;
TRUNCATE TABLE students;
TRUNCATE TABLE route_stops;
TRUNCATE TABLE routes;
TRUNCATE TABLE drivers;
TRUNCATE TABLE buses;
TRUNCATE TABLE admin_users;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES 
('manager1', 'manager1@ebus.com',
 '$2b$10$XhYz9C1rI6PQuW4t2kOExuZ1Ue/U6oEN8HpjK7s0dSx1F4O7Hw3my',
 'Route Manager', 'manager');

INSERT INTO routes (route_code, route_name, start_location, end_location, is_active)
VALUES
('R001', 'Haldwani → GEHU', 'Haldwani Bus Stand', 'GEHU Haldwani Campus', TRUE);


INSERT INTO route_stops (route_id, stop_name, stop_order, latitude, longitude)
VALUES
(1, 'Haldwani Bus Stand', 1, 29.2186, 79.5286),
(1, 'Tikonia Chouraha', 2, 29.2129, 79.5224),
(1, 'Subhash Nagar Mini Bypass', 3, 29.2161, 79.5095),
(1, 'Bhotia Parao - Karna Hospital', 4, 29.2178, 79.4979),
(1, 'Kusumkhera – Devalaya Road', 5, 29.2229, 79.4898),
(1, 'GEHU Haldwani Campus', 6, 29.2284, 79.4804);

INSERT INTO buses 
(bus_number, registration_number, capacity, bus_type, model, year, gps_device_id, 
 is_active, last_maintenance, next_maintenance)
VALUES
('BUS001', 'UK04B1234', 40, 'standard', 'Tata Starbus', 2019, 'GPS-DEV-001', TRUE, '2025-01-10', '2025-04-10'),
('BUS002', 'UK04C5678', 50, 'luxury', 'Ashok Leyland Viking', 2021, 'GPS-DEV-002', TRUE, '2025-01-15', '2025-04-15'),
('BUS003', 'UK04D9101', 32, 'mini', 'Force Traveller', 2020, 'GPS-DEV-003', TRUE, '2025-01-12', '2025-03-12'),
('BUS004', 'UK04E2345', 45, 'standard', 'Eicher Skyline Pro', 2022, 'GPS-DEV-004', TRUE, '2025-01-20', '2025-04-20'),
('BUS005', 'UK04F6789', 55, 'luxury', 'Volvo B7R', 2018, 'GPS-DEV-005', TRUE, '2025-01-05', '2025-04-05');

INSERT INTO drivers (
    driver_id, full_name, phone, email, license_number, license_expiry,
    date_of_birth, address, emergency_contact, is_active
)
VALUES
('D001', 'Ramesh Singh', '9876543210', 'ramesh.singh@example.com',
 'UKDL20215678', '2029-04-15', '1980-06-12',
 'Kathgodam, Nainital, Uttarakhand', '9876543211', TRUE),

('D002', 'Mahesh Rawat', '9876501234', 'mahesh.rawat@example.com',
 'UKDL20198765', '2030-11-20', '1978-03-05',
 'Haldwani, Nainital, Uttarakhand', '9876501235', TRUE),

('D003', 'Suresh Bisht', '9876598765', 'suresh.bisht@example.com',
 'UKDL20201234', '2028-07-30', '1985-09-18',
 'Lalkuan, Nainital, Uttarakhand', '9876598766', TRUE);


INSERT INTO students
(student_id, full_name, email, phone, parent_phone, department, year, address, pickup_stop_id, drop_stop_id, is_active)
VALUES
('STU001', 'Aarav Sharma', 'aarav.sharma@example.com', '9876541111', '9877001122', 'CSE', 2, 'Haldwani', 1, 6, TRUE),
('STU002', 'Priya Joshi', 'priya.joshi@example.com', '9876542222', '9877001133', 'ECE', 3, 'Tikonia', 2, 6, TRUE),
('STU003', 'Rahul Mehra', 'rahul.mehra@example.com', '9876543333', '9877001144', 'ME', 1, 'Subhash Nagar', 3, 6, TRUE),
('STU004', 'Ananya Singh', 'ananya.singh@example.com', '9876544444', '9877001155', 'CSE', 2, 'Bhotia Parao', 4, 6, TRUE),
('STU005', 'Rohan Verma', 'rohan.verma@example.com', '9876545555', '9877001166', 'ECE', 3, 'Kusumkhera', 5, 6, TRUE),
('STU006', 'Simran Kaur', 'simran.kaur@example.com', '9876546666', '9877001177', 'ME', 2, 'Haldwani', 1, 6, TRUE),
('STU007', 'Aditya Rawat', 'aditya.rawat@example.com', '9876547777', '9877001188', 'CSE', 1, 'Tikonia', 2, 6, TRUE),
('STU008', 'Neha Sharma', 'neha.sharma@example.com', '9876548888', '9877001199', 'ECE', 2, 'Subhash Nagar', 3, 6, TRUE);

INSERT INTO shifts (shift_code, bus_id, driver_id, route_id, shift_type, start_time, end_time, shift_date, status)
VALUES
('SFT001', 1, 1, 1, 'morning', '08:00:00', '09:00:00', CURDATE(), 'scheduled'),
('SFT002', 2, 2, 1, 'afternoon', '13:00:00', '14:00:00', CURDATE(), 'scheduled'),
('SFT003', 3, 3, 1, 'evening', '17:00:00', '18:00:00', CURDATE(), 'scheduled');

INSERT INTO seat_allocations (student_id, shift_id, seat_number, allocation_date, status)
VALUES
(1, 1, 1, CURDATE(), 'allocated'),
(2, 1, 2, CURDATE(), 'allocated'),
(3, 1, 3, CURDATE(), 'allocated'),
(4, 2, 1, CURDATE(), 'allocated'),
(5, 2, 2, CURDATE(), 'allocated'),
(6, 3, 1, CURDATE(), 'allocated'),
(7, 3, 2, CURDATE(), 'allocated'),
(8, 3, 3, CURDATE(), 'allocated');

INSERT INTO occupancy_logs (shift_id, student_id, boarding_stop_id, alighting_stop_id, boarded_at, alighted_at, status)
VALUES
(1, 1, 1, 6, NOW(), NULL, 'boarded'),
(1, 2, 2, 6, NOW(), NULL, 'boarded'),
(1, 3, 3, 6, NOW(), NULL, 'boarded'),
(2, 4, 4, 6, NOW(), NULL, 'boarded'),
(2, 5, 5, 6, NOW(), NULL, 'boarded'),
(3, 6, 1, 6, NOW(), NULL, 'boarded'),
(3, 7, 2, 6, NOW(), NULL, 'boarded'),
(3, 8, 3, 6, NOW(), NULL, 'boarded');

INSERT INTO notifications (title, message, notification_type, target_type, target_ids, sent_by, is_sent, sent_at)
VALUES
('Maintenance Alert', 'Bus BUS001 is due for maintenance tomorrow.', 'alert', 'drivers', JSON_ARRAY(1,2,3), 1, TRUE, NOW()),
('Holiday Notice', 'No bus service on 25th Dec.', 'announcement', 'all', NULL, 1, TRUE, NOW()),
('Route Change', 'Pickup point for route R001 has been updated.', 'info', 'students', JSON_ARRAY(1,2,3,4,5,6,7,8), 1, TRUE, NOW());

INSERT INTO gps_logs (bus_id, shift_id, latitude, longitude, speed, heading, accuracy)
VALUES
(1, 1, 29.2186, 79.5286, 30.5, 90, 5),
(2, 2, 29.2129, 79.5224, 25.0, 180, 4),
(3, 3, 29.2161, 79.5095, 20.0, 270, 3),
(4, NULL, 29.2178, 79.4979, 0, 0, 5),
(5, NULL, 29.2229, 79.4898, 0, 0, 5);

INSERT INTO driver_logs (driver_id, shift_id, check_in_time, check_out_time, pre_trip_inspection, post_trip_inspection, notes)
VALUES
(1, 1, '2025-12-08 07:45:00', NULL, TRUE, FALSE, 'Checked bus engine.'),
(2, 2, '2025-12-08 12:45:00', NULL, TRUE, FALSE, 'Checked fuel and tires.'),
(3, 3, '2025-12-08 16:45:00', NULL, TRUE, FALSE, 'Vehicle inspection completed.');