-- SQLite Seed Data

INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@ebus.com', '$2b$10$o.JcFsNfZgQwwFE0dTgmsOPzAzuFdOIhS5fLvjlA5eT9HQd6TEeM6', 'System Administrator', 'super_admin'); 
-- Note: Password is 'admin123'

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('max_seats_per_bus', '50', 'Maximum seats per bus'),
('gps_update_interval', '10', 'GPS update interval in seconds'),
('notification_retention_days', '30', 'Days to retain notifications'),
('eta_calculation_buffer', '5', 'Buffer time in minutes for ETA'),
('allow_overbooking', 'false', 'Allow seat overbooking');

INSERT INTO routes (route_code, route_name, start_location, end_location, is_active)
VALUES
('R001', 'Haldwani → GEHU', 'Haldwani Bus Stand', 'GEHU Haldwani Campus', 1);

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
('BUS001', 'UK04B1234', 40, 'standard', 'Tata Starbus', 2019, 'GPS-DEV-001', 1, '2025-01-10', '2025-04-10'),
('BUS002', 'UK04C5678', 50, 'luxury', 'Ashok Leyland Viking', 2021, 'GPS-DEV-002', 1, '2025-01-15', '2025-04-15'),
('BUS003', 'UK04D9101', 32, 'mini', 'Force Traveller', 2020, 'GPS-DEV-003', 1, '2025-01-12', '2025-03-12'),
('BUS004', 'UK04E2345', 45, 'standard', 'Eicher Skyline Pro', 2022, 'GPS-DEV-004', 1, '2025-01-20', '2025-04-20'),
('BUS005', 'UK04F6789', 55, 'luxury', 'Volvo B7R', 2018, 'GPS-DEV-005', 1, '2025-01-05', '2025-04-05');

INSERT INTO drivers (
    driver_id, full_name, phone, email, license_number, license_expiry,
    date_of_birth, address, emergency_contact, is_active
)
VALUES
('D001', 'Ramesh Singh', '9876543210', 'ramesh.singh@example.com',
 'UKDL20215678', '2029-04-15', '1980-06-12',
 'Kathgodam, Nainital, Uttarakhand', '9876543211', 1),
('D002', 'Mahesh Rawat', '9876501234', 'mahesh.rawat@example.com',
 'UKDL20198765', '2030-11-20', '1978-03-05',
 'Haldwani, Nainital, Uttarakhand', '9876501235', 1),
('D003', 'Suresh Bisht', '9876598765', 'suresh.bisht@example.com',
 'UKDL20201234', '2028-07-30', '1985-09-18',
 'Lalkuan, Nainital, Uttarakhand', '9876598766', 1);

INSERT INTO students
(student_id, full_name, email, phone, parent_phone, department, year, address, pickup_stop_id, drop_stop_id, is_active)
VALUES
('STU001', 'Aarav Sharma', 'aarav.sharma@example.com', '9876541111', '9877001122', 'CSE', 2, 'Haldwani', 1, 6, 1),
('STU002', 'Priya Joshi', 'priya.joshi@example.com', '9876542222', '9877001133', 'ECE', 3, 'Tikonia', 2, 6, 1),
('STU003', 'Rahul Mehra', 'rahul.mehra@example.com', '9876543333', '9877001144', 'ME', 1, 'Subhash Nagar', 3, 6, 1),
('STU004', 'Ananya Singh', 'ananya.singh@example.com', '9876544444', '9877001155', 'CSE', 2, 'Bhotia Parao', 4, 6, 1),
('STU005', 'Rohan Verma', 'rohan.verma@example.com', '9876545555', '9877001166', 'ECE', 3, 'Kusumkhera', 5, 6, 1),
('STU006', 'Simran Kaur', 'simran.kaur@example.com', '9876546666', '9877001177', 'ME', 2, 'Haldwani', 1, 6, 1),
('STU007', 'Aditya Rawat', 'aditya.rawat@example.com', '9876547777', '9877001188', 'CSE', 1, 'Tikonia', 2, 6, 1),
('STU008', 'Neha Sharma', 'neha.sharma@example.com', '9876548888', '9877001199', 'ECE', 2, 'Subhash Nagar', 3, 6, 1);

INSERT INTO shifts (shift_code, bus_id, driver_id, route_id, shift_type, start_time, end_time, shift_date, status)
VALUES
('SFT001', 1, 1, 1, 'morning', '08:00:00', '09:00:00', DATE('now'), 'scheduled'),
('SFT002', 2, 2, 1, 'afternoon', '13:00:00', '14:00:00', DATE('now'), 'scheduled'),
('SFT003', 3, 3, 1, 'evening', '17:00:00', '18:00:00', DATE('now'), 'scheduled');

INSERT INTO notifications (title, message, notification_type, target_type, target_ids, sent_by, is_sent, sent_at)
VALUES
('Maintenance Alert', 'Bus BUS001 is due for maintenance tomorrow.', 'alert', 'drivers', '[1,2,3]', 1, 1, DATETIME('now')),
('Holiday Notice', 'No bus service on 25th Dec.', 'announcement', 'all', NULL, 1, 1, DATETIME('now')),
('Route Change', 'Pickup point for route R001 has been updated.', 'info', 'students', '[1,2,3,4,5,6,7,8]', 1, 1, DATETIME('now'));
