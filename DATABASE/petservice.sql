-- 1. ตารางผู้ใช้งาน (Users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- เก็บ Password ที่เข้ารหัสแล้ว
    user_type VARCHAR(50) DEFAULT 'pet-owner', -- 'pet-owner' หรือ 'admin'
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE veterinary_clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    image_url TEXT,
    emergency_24_7 BOOLEAN DEFAULT FALSE, -- emergency24_7
    accepts_walk_ins BOOLEAN DEFAULT FALSE, -- acceptsWalkIns
    rating DECIMAL(2, 1) DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางเสริมสำหรับ Services ของคลินิก (เพื่อการ Filter)
CREATE TABLE veterinary_services (
    clinic_id INT REFERENCES veterinary_clinics(id) ON DELETE CASCADE,
    service_name VARCHAR(100),
    PRIMARY KEY (clinic_id, service_name)
);

-- 4. ตารางผู้ให้บริการรับส่ง (Pet Chaperones)
CREATE TABLE pet_chaperones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- ชื่อคนขับ
    business_name VARCHAR(255), -- ชื่อธุรกิจ (ถ้ามี)
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    image_url TEXT,
    price_range VARCHAR(10), -- $, $$, $$$
    availability TEXT, -- ข้อความเช่น "Mon-Sun, 7 AM - 9 PM"
    years_experience INT,
    is_licensed BOOLEAN DEFAULT FALSE,
    is_insured BOOLEAN DEFAULT FALSE,
    rating DECIMAL(2, 1) DEFAULT 0,
    review_count INT DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตารางเสริมสำหรับ Services ของ Chaperone
CREATE TABLE chaperone_services (
    chaperone_id INT REFERENCES pet_chaperones(id) ON DELETE CASCADE,
    service_name VARCHAR(100), -- เช่น "Airport Transport", "Emergency"
    PRIMARY KEY (chaperone_id, service_name)
);

-- ตารางเสริมสำหรับประเภทรถ (Vehicle Types)
CREATE TABLE chaperone_vehicles (
    chaperone_id INT REFERENCES pet_chaperones(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(100), -- เช่น "Van", "Sedan"
    PRIMARY KEY (chaperone_id, vehicle_type)
);

-- ตารางเสริมสำหรับประเภทสัตว์ที่รับ (Pet Types)
CREATE TABLE chaperone_accepted_pets (
    chaperone_id INT REFERENCES pet_chaperones(id) ON DELETE CASCADE,
    pet_type VARCHAR(100), -- เช่น "Dogs", "Cats"
    PRIMARY KEY (chaperone_id, pet_type)
);

-- 5. ตารางรีวิว (Reviews)
-- ออกแบบให้รองรับทั้ง Vet และ Chaperone ในตารางเดียว หรือแยกก็ได้
-- อันนี้เป็นแบบรวม (Single Table Inheritance idea)
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    veterinary_clinic_id INT REFERENCES veterinary_clinics(id) ON DELETE CASCADE,
    pet_chaperone_id INT REFERENCES pet_chaperones(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: ต้องรีวิวอย่างใดอย่างหนึ่งเท่านั้น
    CONSTRAINT one_target_only CHECK (
        (veterinary_clinic_id IS NOT NULL AND pet_chaperone_id IS NULL) OR
        (veterinary_clinic_id IS NULL AND pet_chaperone_id IS NOT NULL)
    )
);

-- 6. ตารางรายการโปรด (Favorites)
CREATE TABLE favorite_clinics (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    clinic_id INT REFERENCES veterinary_clinics(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, clinic_id)
);

CREATE TABLE favorite_chaperones (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    chaperone_id INT REFERENCES pet_chaperones(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, chaperone_id) 
);