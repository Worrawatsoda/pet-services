-- 1. สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS pet_service;
USE pet_service;

-- 2. สร้างตาราง User
-- โค้ด server.js ของคุณใช้ฟิลด์: user_id, name, email, password, role
CREATE TABLE IF NOT EXISTS User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('veterinary', 'chaperone') NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    rating DECIMAL(2,1) DEFAULT 0.0,
    reviews_count INT DEFAULT 0,
    image_url VARCHAR(255)
);
INSERT INTO services (type, name, description, address, phone, rating, reviews_count, image_url) VALUES 
('veterinary', 'คลินิกสัตวแพทย์ทองหล่อ', 'บริการรักษาสัตว์ครบวงจร 24 ชม.', 'ถนนทองหล่อ กรุงเทพฯ', '02-712-6301', 4.8, 120, NULL),
('veterinary', 'โรงพยาบาลสัตว์เล็กจุฬาฯ', 'ศูนย์การแพทย์สัตว์เลี้ยง', 'ปทุมวัน กรุงเทพฯ', '02-218-9715', 4.7, 98, NULL),
('veterinary', 'iVet Animal Hospital', 'โรงพยาบาลสัตว์ไอเว็ท', 'พระราม 9 กรุงเทพฯ', '02-641-5525', 4.5, 75, NULL),
('chaperone', 'Safe Paws Transport', 'Climate-Controlled Van, SUV | 8 years experience', 'San Francisco, CA', '081-234-5678', 4.9, 156, 'pet-transport-van-with-logo.jpg'),
('chaperone', 'Pet Ride Pro', 'Sedan, SUV | 5 years experience', 'San Francisco, CA', '089-987-6543', 4.8, 203, 'pet-taxi-service-vehicle.jpg'),
('chaperone', 'Quick Pet Taxi', 'Motorcycle, Sedan | 2 years experience', 'Bangkok, TH', '02-111-2222', 4.5, 89, NULL),
('chaperone', 'Safe Paws Transport', 'รถตู้ปรับอากาศ SUV ขนาดใหญ่ | ประสบการณ์ 8 ปี | มีกรงเดินทางมาตรฐาน', 'เขตจตุจักร, กรุงเทพฯ', '081-234-5678', 4.9, 156, 'pet-transport-van-with-logo.jpg'),
('chaperone', 'Pet Ride Pro', 'รถเก๋ง Sedan และ SUV | ประสบการณ์ 5 ปี | รับส่ง 24 ชม.', 'เขตห้วยขวาง, กรุงเทพฯ', '089-987-6543', 4.8, 203, 'pet-taxi-service-vehicle.jpg'),
('chaperone', 'Quick Pet Taxi', 'มอเตอร์ไซค์ และ Eco Car | ประสบการณ์ 2 ปี | ราคาประหยัด', 'เขตบางรัก, กรุงเทพฯ', '02-111-2222', 4.5, 89, NULL),
('chaperone', 'VIP Pet Limo', 'รถลีมูซีนสำหรับสัตว์เลี้ยง | ความปลอดภัยสูง | มีผู้ช่วยดูแลระหว่างทาง', 'เขตปทุมวัน, กรุงเทพฯ', '090-555-9999', 5.0, 42, 'caring-pet-transport-driver.jpg'),
('chaperone', 'Happy Tails Express', 'รับส่งทั่วไทย | รถกระบะติดแอร์ | ประสบการณ์ 10 ปี', 'อ.บางพลี, สมุทรปราการ', '087-654-3210', 4.7, 312, 'professional-pet-transport-van.jpg'),
('chaperone', 'Buddy\'s Journey', 'รถบ้านส่วนตัว | รักสัตว์เหมือนลูก | แวะพักจอดฉี่ได้', 'เขตตลิ่งชัน, กรุงเทพฯ', '061-234-9876', 4.6, 67, 'professional-pet-transport-driver-with-van.jpg'),
('chaperone', 'Care & Cure Ambulance', 'รถพยาบาลสัตว์ฉุกเฉิน | มีถังออกซิเจน | พนักงานผ่านการอบรมปฐมพยาบาล', 'เขตดอนเมือง, กรุงเทพฯ', '02-999-8888', 4.9, 180, 'pet-taxi-service.jpg'),
('veterinary', 'โรงพยาบาลสัตว์ทองหล่อ', 'บริการรักษาสัตว์ครบวงจร 24 ชม. | ศูนย์โรคหัวใจ | ผ่าตัดส่องกล้อง', 'ถนนเพชรบุรีตัดใหม่, ห้วยขวาง, กรุงเทพฯ', '02-712-6301', 4.8, 1540, 'modern-animal-hospital.jpg'),
('veterinary', 'Bangkok Emergency Vet', 'แผนกฉุกเฉินและวิกฤตสัตว์เลี้ยง 24 ชั่วโมง | มีธนาคารเลือด', 'เขตจตุจักร, กรุงเทพฯ', '02-555-9999', 4.9, 850, 'emergency-veterinary-hospital.jpg'),
('veterinary', 'iVet Animal Hospital', 'ศูนย์ศัลยกรรมและกายภาพบำบัด | รักษาโดยแพทย์เฉพาะทาง', 'ถนนพระราม 9, กรุงเทพฯ', '02-641-5525', 4.6, 320, 'modern-veterinary-clinic-exterior.jpg'),
('veterinary', 'คลินิกบ้านรักสัตว์เลี้ยง', 'บรรยากาศเป็นกันเอง | เน้นฉีดวัคซีนและตรวจสุขภาพทั่วไป', 'พุทธมณฑลสาย 2, ทวีวัฒนา', '081-234-5678', 4.7, 125, 'cozy-pet-clinic.jpg'),
('veterinary', 'โรงพยาบาลสัตว์เล็ก จุฬาลงกรณ์', 'ศูนย์การแพทย์สัตว์เลี้ยงครบวงจร | เครื่องมือทันสมัยระดับสากล', 'ถนนอังรีดูนังต์, ปทุมวัน', '02-218-9715', 4.8, 2100, NULL),
('veterinary', 'Cat Wellness Clinic', 'คลินิกรักษามะเร็งและอายุรกรรมแมวโดยเฉพาะ | แยกโซนสุนัข-แมว', 'สุขุมวิท 39, วัฒนา', '02-000-1111', 4.9, 450, NULL),
('veterinary', 'Exotic Pet Care', 'รักษา กระต่าย หนู นก สัตว์เลื้อยคลาน | โดยหมอเฉพาะทาง', 'ลาดพร้าว 71, วังทองหลาง', '099-888-7777', 4.5, 98, NULL);
