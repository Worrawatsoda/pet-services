-- 1. สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS pet_service;
USE pet_service;

-- 2. ตาราง User
CREATE TABLE IF NOT EXISTS User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตาราง Services (เก็บทั้ง Vet และ Chaperone)
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('veterinary', 'chaperone') NOT NULL,
    name VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    experience_years INT DEFAULT 0,
    price_range ENUM('$', '$$', '$$$', '$$$$') DEFAULT '$$',
    is_licensed BOOLEAN DEFAULT FALSE,
    is_insured BOOLEAN DEFAULT FALSE,
    availability_text VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ตารางเวลาทำการ
CREATE TABLE IF NOT EXISTS service_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 5. ตารางรีวิว
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    user_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE SET NULL
);

-- 6. ตาราง Favorites
CREATE TABLE IF NOT EXISTS favorites (
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, service_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 7. ระบบ Tags: Veterinary
CREATE TABLE IF NOT EXISTS veterinary_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS service_veterinary_tags (
    service_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (service_id, tag_id),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES veterinary_tags(id) ON DELETE CASCADE
);

-- 8. ระบบ Tags: Chaperone
CREATE TABLE IF NOT EXISTS chaperone_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS service_chaperone_tags (
    service_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (service_id, tag_id),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES chaperone_tags(id) ON DELETE CASCADE
);

-- =============================================
-- INSERT ข้อมูลตัวอย่าง (Sample Data)
-- =============================================

-- 1. Insert Tags
INSERT INTO veterinary_tags (name) VALUES 
('General Care'), ('Emergency 24hr'), ('Surgery'), ('Vaccination'), ('Dental'), ('Exotic Pets'), ('X-Ray'), ('Ultrasound');

INSERT INTO chaperone_tags (name) VALUES 
('Air Conditioned'), ('CCTV'), ('GPS Tracking'), ('Vet Appointment'), ('Cage Free'), ('Oxygen Tank'), ('First Aid Certified'), ('Long Distance');

-- 2. Insert Services: Veterinary (10 รายการ)
INSERT INTO services (type, name, subtitle, description, address, phone, rating, reviews_count, image_url) VALUES 
('veterinary', 'Thonglor Pet Hospital', 'Full Service Hospital', 'Leading animal hospital in Bangkok offering 24/7 care.', 'Thonglor, Bangkok', '02-712-6301', 4.8, 1500, 'vet1.jpg'),
('veterinary', 'Chula Small Animal Hospital', 'University Hospital', 'High-quality medical care by specialists from Chulalongkorn University.', 'Pathum Wan, Bangkok', '02-218-9715', 4.7, 980, 'vet2.jpg'),
('veterinary', 'iVet Animal Hospital', 'Specialist Center', 'Focusing on surgery and rehabilitation.', 'Rama 9, Bangkok', '02-641-5525', 4.6, 320, 'vet3.jpg'),
('veterinary', 'Kaset Animal Hospital', 'Affordable Care', 'Comprehensive care at affordable prices.', 'Chatuchak, Bangkok', '02-942-8756', 4.5, 2100, 'vet4.jpg'),
('veterinary', 'Bangkok Emergency Vet', 'Critical Care Center', 'Specialized in emergency and critical care cases.', 'Sukhumvit, Bangkok', '02-555-9999', 4.9, 120, 'vet5.jpg'),
('veterinary', 'Cat Wellness Clinic', 'Feline Only', 'Stress-free environment exclusively for cats.', 'Ekkamai, Bangkok', '02-111-2222', 4.9, 450, 'vet6.jpg'),
('veterinary', 'Exotic Pet Care', 'Birds & Reptiles', 'Expert care for rabbits, birds, and reptiles.', 'Ladprao, Bangkok', '099-888-7777', 4.8, 230, 'vet7.jpg'),
('veterinary', 'Happy Pet Clinic', 'Neighborhood Vet', 'Friendly local clinic for vaccinations and checkups.', 'Bang Na, Bangkok', '02-333-4444', 4.4, 85, 'vet8.jpg'),
('veterinary', 'Smile Dog Vet', 'Canine Specialist', 'Everything your dog needs from puppy to senior.', 'Sathorn, Bangkok', '02-666-7777', 4.7, 310, 'vet9.jpg'),
('veterinary', 'Pet A Porter Vet', 'Luxury Clinic', 'Premium service with spa and hotel.', 'Phrom Phong, Bangkok', '02-888-9999', 4.9, 50, 'vet10.jpg');

-- 3. Insert Services: Chaperone (10 รายการ)
INSERT INTO services (type, name, subtitle, description, address, phone, rating, reviews_count, experience_years, is_licensed, is_insured, price_range, image_url) VALUES 
('chaperone', 'Safe Paws Transport', 'Premium Van Service', 'Spacious van with climate control.', 'Bangkok Area', '081-234-5678', 4.9, 156, 8, TRUE, TRUE, '$$$', 'chap1.jpg'),
('chaperone', 'Pet Ride Pro', 'Sedan & SUV', 'Reliable transfer for vet visits.', 'Bangkok & Vicinity', '089-987-6543', 4.8, 203, 5, TRUE, TRUE, '$$', 'chap2.jpg'),
('chaperone', 'Quick Pet Taxi', 'Motorcycle & Eco Car', 'Fast service for rush hours.', 'Inner Bangkok', '02-111-2222', 4.5, 89, 2, TRUE, FALSE, '$', 'chap3.jpg'),
('chaperone', 'VIP Pet Limo', 'Luxury Transfer', 'Travel in style with personal attendant.', 'Bangkok', '090-555-9999', 5.0, 42, 10, TRUE, TRUE, '$$$$', 'chap4.jpg'),
('chaperone', 'Happy Tails Express', 'Cross-Country', 'Long distance transport across Thailand.', 'Thailand Wide', '087-654-3210', 4.7, 312, 12, TRUE, TRUE, '$$$', 'chap5.jpg'),
('chaperone', 'Buddy\'s Journey', 'Personal Car', 'Friendly driver who loves pets.', 'Thonburi Side', '061-234-9876', 4.6, 67, 3, FALSE, TRUE, '$$', 'chap6.jpg'),
('chaperone', 'Care & Cure Ambulance', 'Medical Transport', 'Equipped with oxygen and first aid.', 'Emergency Only', '02-999-8888', 4.9, 180, 15, TRUE, TRUE, '$$$$', 'chap7.jpg'),
('chaperone', 'Paws on Wheels', 'Budget Friendly', 'Economical choice for routine trips.', 'Nonthaburi', '088-777-6666', 4.3, 150, 4, TRUE, FALSE, '$', 'chap8.jpg'),
('chaperone', 'Inter-Province Pet Move', 'Relocation Service', 'Helping you move pets to new homes.', 'All Regions', '086-555-4444', 4.8, 95, 7, TRUE, TRUE, '$$$', 'chap9.jpg'),
('chaperone', 'Airport Pet Shuttle', 'Airport Transfer', 'Specialized in Suvarnabhumi & Don Mueang.', 'Airports', '081-999-0000', 4.7, 220, 6, TRUE, TRUE, '$$$', 'chap10.jpg');

-- 4. Mapping Tags (จับคู่ Service กับ Tag)
-- Vet Mapping (Service ID 1-10)
INSERT INTO service_veterinary_tags (service_id, tag_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 5), -- Thonglor: General, Emergency, Surgery, Dental
(2, 1), (2, 3), (2, 7), (2, 8), -- Chula: General, Surgery, X-Ray, Ultra
(3, 3), (3, 8), -- iVet: Surgery, Ultra
(4, 1), (4, 4), -- Kaset: General, Vaccine
(5, 2), (5, 3), -- Emergency Vet: Emergency, Surgery
(6, 1), (6, 4), -- Cat Wellness
(7, 6), -- Exotic
(8, 1), (8, 4), -- Happy Pet
(9, 1), (9, 5), -- Smile Dog
(10, 1); -- Pet A Porter

-- Chaperone Mapping (Service ID 11-20)
INSERT INTO service_chaperone_tags (service_id, tag_id) VALUES 
(11, 1), (11, 2), (11, 3), -- Safe Paws: Air, CCTV, GPS
(12, 1), (12, 4), -- Pet Ride: Air, Vet Appt
(13, 3), -- Quick Taxi: GPS
(14, 1), (14, 2), (14, 3), (14, 5), -- VIP: Air, CCTV, GPS, Cage Free
(15, 3), (15, 8), -- Happy Tails: GPS, Long Distance
(16, 1), (16, 5), -- Buddy: Air, Cage Free
(17, 1), (17, 3), (17, 6), (17, 7), -- Ambulance: Air, GPS, Oxygen, First Aid
(18, 1), -- Paws on Wheels
(19, 3), (19, 8), -- Inter-Province
(20, 1), (20, 3); -- Airport