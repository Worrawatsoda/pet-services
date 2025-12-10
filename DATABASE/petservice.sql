USE petcare_connect;

-- =============================================
-- 0. ล้างข้อมูลเก่า
-- =============================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE reviews;
TRUNCATE TABLE user_favorite_clinics;
TRUNCATE TABLE user_favorite_chaperones;
TRUNCATE TABLE veterinary_services;
TRUNCATE TABLE veterinary_hours;
TRUNCATE TABLE chaperone_services;
TRUNCATE TABLE chaperone_vehicle_types;
TRUNCATE TABLE chaperone_pet_types;
TRUNCATE TABLE veterinary_clinics;
TRUNCATE TABLE pet_chaperones;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 1. สร้าง Users (15 คน)
-- =============================================
INSERT INTO users (id, name, email, password_hash, user_type) VALUES
('u001', 'Somchai Jai-dee', 'somchai@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u002', 'Nida Pat', 'nida@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u003', 'John Doe', 'john@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u004', 'Sarah Lee', 'sarah@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u005', 'Kenji Sato', 'kenji@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u006', 'Malai Choo', 'malai@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u007', 'Peter Parker', 'peter@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u008', 'Tony Stark', 'tony@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u009', 'Steve Rogers', 'steve@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u010', 'Natasha Romanoff', 'nat@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u011', 'Bruce Banner', 'bruce@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u012', 'Wanda Maximoff', 'wanda@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u013', 'Doctor Strange', 'strange@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u014', 'TChalla', 'wakanda@email.com', '$2b$10$EpMq.X/y...', 'pet-owner'),
('u015', 'Carol Danvers', 'captain@email.com', '$2b$10$EpMq.X/y...', 'pet-owner');

-- =============================================
-- 2. สร้าง Veterinary Clinics (10 แห่ง)
-- =============================================
INSERT INTO veterinary_clinics (id, name, description, address, city, state, zip_code, phone, email, website, image_url, emergency_24_7, accepts_walk_ins, latitude, longitude) VALUES
('v001', 'Pattanakarn Vet Hospital', 'โรงพยาบาลสัตว์พัฒนาการ ดูแลด้วยใจ ใส่ใจทุกรายละเอียด', '123 Pattanakarn Rd', 'Bangkok', 'Bangkok', '10250', '02-111-1111', 'contact@patvet.com', 'www.patvet.com', 'v01.jpg', TRUE, TRUE, 13.7368, 100.6148),
('v002', 'Darin Animal Hospital', 'โรงพยาบาลสัตว์ดารินรักษ์ บรรยากาศอบอุ่น เป็นกันเอง', '456 Lat Phrao', 'Bangkok', 'Bangkok', '10900', '02-222-2222', 'info@darinvet.com', 'www.darinvet.com', 'v02.jpg', FALSE, TRUE, 13.8025, 100.5800),
('v003', 'Phaya Thai 7 Animal Hospital', 'โรงพยาบาลสัตว์พญาไท 7 สาขาหลัก เครื่องมือครบครัน', '789 Phet Kasem Rd', 'Bangkok', 'Bangkok', '10160', '02-333-3333', 'service@phyathai7.com', 'www.phyathai7vet.com', 'v03.jpg', TRUE, TRUE, 13.7311, 100.4616),
('v004', 'Small Animal Teaching Hospital', 'โรงพยาบาลสัตว์เล็กเพื่อการเรียนการสอน', '101 Chulalongkorn', 'Bangkok', 'Bangkok', '10330', '02-444-4444', 'admin@vetcu.com', 'www.vet.chula.ac.th', 'v04.jpg', FALSE, FALSE, 13.7462, 100.5305),
('v005', 'Phaya Thai 7 Branch 2', 'สาขาย่อย สะดวกสบายสำหรับชาวฝั่งธน', '222 Charansanitwong', 'Bangkok', 'Bangkok', '10700', '02-555-5555', 'branch2@phyathai7.com', 'www.phyathai7vet.com', 'v05.jpg', TRUE, TRUE, 13.7940, 100.5110),
('v006', 'Nasu Vet Clinic', 'ณสุขสัตวแพทย์ คลินิกเล็กๆ แต่อบอุ่น', '333 Sukhumvit 77', 'Bangkok', 'Bangkok', '10110', '02-666-6666', 'nasu@vet.com', NULL, 'v06.jpg', FALSE, TRUE, 13.7120, 100.6000),
('v007', 'Thonglor Pet Hospital', 'โรงพยาบาลสัตว์ทองหล่อ สาขาใหญ่ บริการระดับพรีเมียม', '444 Thong Lo', 'Bangkok', 'Bangkok', '10110', '02-777-7777', 'info@thonglorpet.com', 'www.thonglorpet.com', 'v07.jpg', TRUE, FALSE, 13.7350, 100.5820),
('v008', 'Pathum Thani Vet', 'รักษาสัตว์ปทุมธานี ราคาย่อมเยา', '555 Rangsit-Pathum', 'Pathum Thani', 'Pathum Thani', '12000', '02-888-8888', 'contact@pathumvet.com', NULL, 'v08.jpg', FALSE, TRUE, 13.9870, 100.5500),
('v009', 'Rattanatibeth Phuket', 'โรงพยาบาลสัตว์รัตนาธิเบศร์ สาขาภูเก็ต', '666 Thepkrasattri', 'Phuket', 'Phuket', '83000', '076-999-999', 'phuket@rattanatibeth.com', 'www.rtbvet.com', 'v09.jpg', TRUE, TRUE, 7.8804, 98.3923),
('v010', 'Vet 4 Animal Hospital', 'โรงพยาบาลสัตว์ สัตวแพทย์ 4', '777 Prachachuen', 'Bangkok', 'Bangkok', '10800', '02-000-0000', 'info@vet4.com', 'www.vet4polyclinic.com', 'v10.jpg', TRUE, FALSE, 13.8250, 100.5400);

-- =============================================
-- 2.1 ใส่ Services ให้คลินิก
-- =============================================
INSERT INTO veterinary_services (clinic_id, service_name) VALUES
('v001', 'General Care'), ('v001', 'Vaccinations'), ('v001', 'Dental'),
('v002', 'General Care'), ('v002', 'Grooming'), ('v002', 'Surgery'),
('v003', 'Emergency Care'), ('v003', 'X-Ray'), ('v003', 'Surgery'), ('v003', 'General Care'),
('v004', 'Specialist'), ('v004', 'Surgery'), ('v004', 'Dental'),
('v005', 'General Care'), ('v005', 'Vaccinations'),
('v006', 'General Care'), ('v006', 'Grooming'),
('v007', 'Emergency Care'), ('v007', 'Surgery'), ('v007', 'Dental'), ('v007', 'Luxury Boarding'),
('v008', 'General Care'), ('v008', 'Vaccinations'),
('v009', 'General Care'), ('v009', 'Emergency Care'), ('v009', 'Exotic Pets'),
('v010', 'Surgery'), ('v010', 'X-Ray'), ('v010', 'Dental');

-- =============================================
-- 2.2 ใส่เวลาทำการ (ครบ 7 วัน)
-- =============================================
INSERT INTO veterinary_hours (clinic_id, day_of_week, open_time) VALUES
-- v001 (เปิดทุกวัน)
('v001', 'monday', '09:00 - 20:00'), ('v001', 'tuesday', '09:00 - 20:00'), ('v001', 'wednesday', '09:00 - 20:00'),
('v001', 'thursday', '09:00 - 20:00'), ('v001', 'friday', '09:00 - 20:00'), ('v001', 'saturday', '09:00 - 18:00'), ('v001', 'sunday', 'Closed'),

-- v002 (หยุดอาทิตย์)
('v002', 'monday', '10:00 - 19:00'), ('v002', 'tuesday', '10:00 - 19:00'), ('v002', 'wednesday', '10:00 - 19:00'),
('v002', 'thursday', '10:00 - 19:00'), ('v002', 'friday', '10:00 - 19:00'), ('v002', 'saturday', '09:00 - 18:00'), ('v002', 'sunday', 'Closed'),

-- v003 (24 ชม.)
('v003', 'monday', '24 Hours'), ('v003', 'tuesday', '24 Hours'), ('v003', 'wednesday', '24 Hours'),
('v003', 'thursday', '24 Hours'), ('v003', 'friday', '24 Hours'), ('v003', 'saturday', '24 Hours'), ('v003', 'sunday', '24 Hours'),

-- v004 (เวลาราชการ)
('v004', 'monday', '08:00 - 16:00'), ('v004', 'tuesday', '08:00 - 16:00'), ('v004', 'wednesday', '08:00 - 16:00'),
('v004', 'thursday', '08:00 - 16:00'), ('v004', 'friday', '08:00 - 16:00'), ('v004', 'saturday', 'Closed'), ('v004', 'sunday', 'Closed'),

-- v005 (24 ชม.)
('v005', 'monday', '24 Hours'), ('v005', 'tuesday', '24 Hours'), ('v005', 'wednesday', '24 Hours'),
('v005', 'thursday', '24 Hours'), ('v005', 'friday', '24 Hours'), ('v005', 'saturday', '24 Hours'), ('v005', 'sunday', '24 Hours'),

-- v006 (เปิดทุกวัน)
('v006', 'monday', '09:00 - 18:00'), ('v006', 'tuesday', '09:00 - 18:00'), ('v006', 'wednesday', '09:00 - 18:00'),
('v006', 'thursday', '09:00 - 18:00'), ('v006', 'friday', '09:00 - 18:00'), ('v006', 'saturday', '09:00 - 18:00'), ('v006', 'sunday', '09:00 - 18:00'),

-- v007 (24 ชม.)
('v007', 'monday', '24 Hours'), ('v007', 'tuesday', '24 Hours'), ('v007', 'wednesday', '24 Hours'),
('v007', 'thursday', '24 Hours'), ('v007', 'friday', '24 Hours'), ('v007', 'saturday', '24 Hours'), ('v007', 'sunday', '24 Hours'),

-- v008 (เปิดยาว)
('v008', 'monday', '08:00 - 20:00'), ('v008', 'tuesday', '08:00 - 20:00'), ('v008', 'wednesday', '08:00 - 20:00'),
('v008', 'thursday', '08:00 - 20:00'), ('v008', 'friday', '08:00 - 20:00'), ('v008', 'saturday', '08:00 - 20:00'), ('v008', 'sunday', '08:00 - 20:00'),

-- v009 (24 ชม.)
('v009', 'monday', '24 Hours'), ('v009', 'tuesday', '24 Hours'), ('v009', 'wednesday', '24 Hours'),
('v009', 'thursday', '24 Hours'), ('v009', 'friday', '24 Hours'), ('v009', 'saturday', '24 Hours'), ('v009', 'sunday', '24 Hours'),

-- v010 (24 ชม.)
('v010', 'monday', '24 Hours'), ('v010', 'tuesday', '24 Hours'), ('v010', 'wednesday', '24 Hours'),
('v010', 'thursday', '24 Hours'), ('v010', 'friday', '24 Hours'), ('v010', 'saturday', '24 Hours'), ('v010', 'sunday', '24 Hours');

-- =============================================
-- 3. สร้าง Pet Chaperones (10 ราย)
-- =============================================
INSERT INTO pet_chaperones (id, name, business_name, description, address, city, state, zip_code, phone, email, image_url, years_experience, licensed, insured, availability, price_range, latitude, longitude) VALUES
('c001', 'GrabPet Driver', 'GrabPet XL', 'รถใหญ่ นั่งสบาย แอร์เย็น พร้อมผ้าคลุมเบาะ', '88 Asoke', 'Bangkok', 'Bangkok', '10110', '081-111-1111', 'grab@pet.com', 'c01.jpg', 3, TRUE, TRUE, '24/7', '$$', 13.7360, 100.5600),
('c002', 'Best Friend Taxi', 'Pet\'s Best Friend', 'รถตู้สีสันสดใส รับส่งน้องหมาตัวใหญ่ได้', '99 Rama 9', 'Bangkok', 'Bangkok', '10310', '081-222-2222', 'bestfriend@taxi.com', 'c02.jpg', 5, TRUE, FALSE, 'Mon-Sat 8AM-6PM', '$$', 13.7500, 100.6000),
('c003', 'Inter Mover', 'PET Relocation', 'บริการย้ายสัตว์เลี้ยงข้ามจังหวัดและต่างประเทศ', '77 Suvarnabhumi', 'Samut Prakan', 'Samut Prakan', '10540', '081-333-3333', 'inter@move.com', 'c03.jpg', 10, TRUE, TRUE, 'Appointment Only', '$$$', 13.6900, 100.7500),
('c004', 'Limo Petxi', 'Petxi Limo', 'รถแท็กซี่ลีมูซีนสำหรับสัตว์เลี้ยงโดยเฉพาะ', '66 Thong Lo', 'Bangkok', 'Bangkok', '10110', '081-444-4444', 'limo@petxi.com', 'c04.jpg', 4, TRUE, TRUE, 'Everyday 7AM-10PM', '$$$', 13.7300, 100.5800),
('c005', 'Boonma Moving', 'Boonma Moving & Storage', 'รถกระบะทึบ ขนย้ายกรงใหญ่ ปลอดภัย', '55 Bang Na', 'Bangkok', 'Bangkok', '10260', '081-555-5555', 'boonma@move.com', 'c05.jpg', 15, TRUE, TRUE, 'Mon-Fri 9AM-5PM', '$', 13.6600, 100.6200),
('c006', 'Thai Pet Mover', 'Thailand Pet Mover', 'บริการขนส่งสัตว์เลี้ยงทางอากาศและภาคพื้น', '44 Don Mueang', 'Bangkok', 'Bangkok', '10210', '081-666-6666', 'thai@petmover.com', 'c06.jpg', 8, TRUE, TRUE, '24/7', '$$$', 13.9100, 100.6000),
('c007', 'Backer Ride', 'PetBacker', 'เครือข่ายคนรักสัตว์ ขับรถส่วนตัวรับส่ง', '33 Ladprao', 'Bangkok', 'Bangkok', '10900', '081-777-7777', 'backer@ride.com', 'c07.jpg', 2, FALSE, FALSE, 'Flexible', '$', 13.8000, 100.5700),
('c008', 'Glassflower', 'Glassflower Transport', 'รถตู้ VIP สีฟ้าสดใส บริการระดับพรีเมียม', '22 Sathorn', 'Bangkok', 'Bangkok', '10120', '081-888-8888', 'glass@flower.com', 'c08.jpg', 6, TRUE, TRUE, 'Weekends Only', '$$$', 13.7200, 100.5300),
('c009', 'Lovely Transport', 'Pet Transport Service', 'รถกระบะแดงน่ารัก รับส่งทั่วไทย', '11 Rangsit', 'Pathum Thani', 'Pathum Thani', '12130', '081-999-9999', 'lovely@trans.com', 'c09.jpg', 3, TRUE, FALSE, 'Everyday', '$', 13.9900, 100.6100),
('c010', 'Express Paul', 'Pet Express by Paul', 'โลโก้สุนัขและแมว บริการรวดเร็วทันใจ', '101 Vibhavadi', 'Bangkok', 'Bangkok', '10900', '081-000-0000', 'paul@express.com', 'c10.jpg', 7, TRUE, TRUE, 'Mon-Sat 8AM-8PM', '$$', 13.8200, 100.5600);

-- 3.1 Services, Vehicles, Pets
INSERT INTO chaperone_services (chaperone_id, service_name) VALUES
('c001', 'Vet Appointments'), ('c001', 'Airport Transport'),
('c002', 'Vet Appointments'), ('c002', 'Long Distance'),
('c003', 'Long Distance'), ('c003', 'Airport Transport'),
('c004', 'Emergency Transport'), ('c004', 'Vet Appointments'),
('c005', 'Long Distance'),
('c006', 'Airport Transport'), ('c006', 'Long Distance'),
('c007', 'Vet Appointments'),
('c008', 'Long Distance'), ('c008', 'Emergency Transport'),
('c009', 'Long Distance'),
('c010', 'Emergency Transport'), ('c010', 'Vet Appointments');

INSERT INTO chaperone_vehicle_types (chaperone_id, vehicle_type) VALUES
('c001', 'SUV'), ('c001', 'Sedan'),
('c002', 'Minivan'),
('c003', 'Climate-Controlled Van'),
('c004', 'Sedan'), ('c004', 'SUV'),
('c005', 'Minivan'),
('c006', 'Climate-Controlled Van'),
('c007', 'Sedan'),
('c008', 'Minivan'), ('c008', 'SUV'),
('c009', 'Minivan'),
('c010', 'SUV');

INSERT INTO chaperone_pet_types (chaperone_id, pet_type) VALUES
('c001', 'Dogs'), ('c001', 'Cats'),
('c002', 'Dogs'), ('c002', 'Cats'), ('c002', 'Small Animals'),
('c003', 'Dogs'), ('c003', 'Cats'),
('c004', 'Dogs'), ('c004', 'Cats'),
('c005', 'Dogs'),
('c006', 'Dogs'), ('c006', 'Cats'), ('c006', 'Birds'),
('c007', 'Cats'), ('c007', 'Small Animals'),
('c008', 'Dogs'), ('c008', 'Cats'),
('c009', 'Dogs'), ('c009', 'Cats'),
('c010', 'Dogs'), ('c010', 'Cats');

-- =============================================
-- 4. Insert Reviews (สุ่ม 3-7 รีวิวต่อแห่ง)
-- =============================================

-- v001
INSERT INTO reviews (id, user_id, veterinary_clinic_id, rating, title, comment, date) VALUES
(UUID(), 'u001', 'v001', 5, 'Great Service', 'หมอเก่งมากครับ', '2023-10-01'),
(UUID(), 'u002', 'v001', 4, 'Clean', 'สะอาดดี', '2023-10-05'),
(UUID(), 'u003', 'v001', 5, 'Recommended', 'แนะนำเลยครับ', '2023-10-10');

-- v002
INSERT INTO reviews (id, user_id, veterinary_clinic_id, rating, title, comment, date) VALUES
(UUID(), 'u004', 'v002', 5, 'Friendly Staff', 'พนักงานน่ารัก', '2023-10-02'),
(UUID(), 'u005', 'v002', 3, 'Average', 'เฉยๆ รอนานนิดนึง', '2023-10-06'),
(UUID(), 'u006', 'v002', 4, 'Good', 'รักษาหายไว', '2023-10-11'),
(UUID(), 'u007', 'v002', 5, 'Excellent', 'ดีมาก', '2023-10-15');

-- v003
INSERT INTO reviews (id, user_id, veterinary_clinic_id, rating, title, comment, date) VALUES
(UUID(), 'u008', 'v003', 5, '24 Hours', 'เปิด 24 ชม. สะดวกมาก', '2023-10-03'),
(UUID(), 'u009', 'v003', 5, 'Life saver', 'ช่วยน้องหมาเราไว้ทัน', '2023-10-07'),
(UUID(), 'u010', 'v003', 4, 'Pricey', 'แพงหน่อยแต่ดี', '2023-10-12');

-- v004
INSERT INTO reviews (id, user_id, veterinary_clinic_id, rating, title, comment, date) VALUES
(UUID(), 'u011', 'v004', 5, 'Expert', 'อาจารย์หมอเก่งมาก', '2023-10-04'),
(UUID(), 'u012', 'v004', 4, 'Academic', 'เครื่องมือทันสมัย', '2023-10-08'),
(UUID(), 'u013', 'v004', 3, 'Wait time', 'รอนานมาก', '2023-10-13'),
(UUID(), 'u014', 'v004', 5, 'Trustworthy', 'เชื่อถือได้', '2023-10-18'),
(UUID(), 'u015', 'v004', 4, 'Good care', 'ดูแลดี', '2023-10-22');

-- v005
INSERT INTO reviews (id, user_id, veterinary_clinic_id, rating, title, comment, date) VALUES
(UUID(), 'u001', 'v005', 4, 'Branch 2', 'สาขานี้คนน้อยกว่า', '2023-10-05'),
(UUID(), 'u002', 'v005', 5, 'Convenient', 'ใกล้บ้าน', '2023-10-09'),
(UUID(), 'u003', 'v005', 4, 'Good', 'โอเคครับ', '2023-10-14');

-- v006
INSERT INTO reviews (id, user_id, veterinary_clinic_id, rating, title, comment, date) VALUES
(UUID(), 'u004', 'v006', 5, 'Cozy', 'ร้านเล็กๆ แต่อบอุ่น', '2023-10-01'),
(UUID(), 'u005', 'v006', 5, 'Kind doctor', 'หมอใจดีสุดๆ', '2023-10-06'),
(UUID(), 'u006', 'v006', 4, 'Nice', 'บริการดี', '2023-10-11'),
(UUID(), 'u007', 'v006', 5, 'Love it', 'น้องแมวชอบ', '2023-10-16');

-- v007
INSERT INTO reviews (id, user_id, veterinary_clinic_id, rating, title, comment, date) VALUES
(UUID(), 'u008', 'v007', 5, 'Luxury', 'หรูหรามาก', '2023-10-02'),
(UUID(), 'u009', 'v007', 5, 'Premium', 'บริการระดับพรีเมียม', '2023-10-07'),
(UUID(), 'u010', 'v007', 4, 'Expensive', 'ราคาแรง', '2023-10-12'),
(UUID(), 'u011', 'v007', 5, 'Best', 'ดีที่สุด', '2023-10-17'),
(UUID(), 'u012', 'v007', 5, 'Great', 'ยอดเยี่ยม', '2023-10-22');

-- v008
INSERT INTO reviews (id, user_id, veterinary_clinic_id, rating, title, comment, date) VALUES
(UUID(), 'u013', 'v008', 4, 'Affordable', 'ราคาไม่แพง', '2023-10-03'),
(UUID(), 'u014', 'v008', 3, 'Okay', 'พอใช้ได้', '2023-10-08'),
(UUID(), 'u015', 'v008', 4, 'Good', 'ดีครับ', '2023-10-13');

-- v009
INSERT INTO reviews (id, user_id, veterinary_clinic_id, rating, title, comment, date) VALUES
(UUID(), 'u001', 'v009', 5, 'Phuket Best', 'ดีที่สุดในภูเก็ต', '2023-10-04'),
(UUID(), 'u002', 'v009', 5, 'Modern', 'ทันสมัย', '2023-10-09'),
(UUID(), 'u003', 'v009', 4, 'Nice view', 'บรรยากาศดี', '2023-10-14');

-- v010
INSERT INTO reviews (id, user_id, veterinary_clinic_id, rating, title, comment, date) VALUES
(UUID(), 'u004', 'v010', 5, 'Professional', 'เป็นมืออาชีพ', '2023-10-05'),
(UUID(), 'u005', 'v010', 4, 'Good location', 'เดินทางสะดวก', '2023-10-10'),
(UUID(), 'u006', 'v010', 5, 'Experienced', 'หมอประสบการณ์สูง', '2023-10-15'),
(UUID(), 'u007', 'v010', 4, 'Clean', 'สะอาด', '2023-10-20');

-- Chaperones Reviews
-- c001
INSERT INTO reviews (id, user_id, pet_chaperone_id, rating, title, comment, date) VALUES
(UUID(), 'u008', 'c001', 5, 'Fast', 'ขับรถเร็วทันใจ', '2023-10-01'),
(UUID(), 'u009', 'c001', 5, 'Safe', 'ปลอดภัยหายห่วง', '2023-10-06'),
(UUID(), 'u010', 'c001', 4, 'Good', 'ดีครับ', '2023-10-11');

-- c002
INSERT INTO reviews (id, user_id, pet_chaperone_id, rating, title, comment, date) VALUES
(UUID(), 'u011', 'c002', 5, 'Cute Van', 'รถน่ารักมาก', '2023-10-02'),
(UUID(), 'u012', 'c002', 4, 'Fun', 'น้องหมาชอบ', '2023-10-07'),
(UUID(), 'u013', 'c002', 5, 'Friendly', 'คนขับใจดี', '2023-10-12');

-- c003
INSERT INTO reviews (id, user_id, pet_chaperone_id, rating, title, comment, date) VALUES
(UUID(), 'u014', 'c003', 5, 'International', 'ย้ายไปต่างประเทศราบรื่น', '2023-10-03'),
(UUID(), 'u015', 'c003', 5, 'Professional', 'มืออาชีพมาก', '2023-10-08'),
(UUID(), 'u001', 'c003', 4, 'Good', 'ดี', '2023-10-13'),
(UUID(), 'u002', 'c003', 5, 'Recommended', 'แนะนำ', '2023-10-18');

-- c004
INSERT INTO reviews (id, user_id, pet_chaperone_id, rating, title, comment, date) VALUES
(UUID(), 'u003', 'c004', 5, 'Limo', 'หรูหรา', '2023-10-04'),
(UUID(), 'u004', 'c004', 4, 'Comfy', 'นั่งสบาย', '2023-10-09'),
(UUID(), 'u005', 'c004', 5, 'VIP', 'บริการแบบ VIP', '2023-10-14');

-- c005
INSERT INTO reviews (id, user_id, pet_chaperone_id, rating, title, comment, date) VALUES
(UUID(), 'u006', 'c005', 4, 'Big truck', 'รถใหญ่ดี', '2023-10-05'),
(UUID(), 'u007', 'c005', 3, 'Okay', 'ก็โอเค', '2023-10-10'),
(UUID(), 'u008', 'c005', 4, 'Cheap', 'ราคาถูก', '2023-10-15'),
(UUID(), 'u009', 'c005', 5, 'Strong', 'ยกของเก่ง', '2023-10-20');

-- c006
INSERT INTO reviews (id, user_id, pet_chaperone_id, rating, title, comment, date) VALUES
(UUID(), 'u010', 'c006', 5, 'Flying', 'ส่งทางเครื่องบินดีมาก', '2023-10-01'),
(UUID(), 'u011', 'c006', 5, 'Fast', 'รวดเร็ว', '2023-10-06'),
(UUID(), 'u012', 'c006', 4, 'Good', 'ดี', '2023-10-11');

-- c007
INSERT INTO reviews (id, user_id, pet_chaperone_id, rating, title, comment, date) VALUES
(UUID(), 'u013', 'c007', 4, 'Personal', 'เหมือนเพื่อนมารับ', '2023-10-02'),
(UUID(), 'u014', 'c007', 3, 'Small car', 'รถเล็กไปหน่อย', '2023-10-07'),
(UUID(), 'u015', 'c007', 4, 'Friendly', 'เป็นกันเอง', '2023-10-12');

-- c008
INSERT INTO reviews (id, user_id, pet_chaperone_id, rating, title, comment, date) VALUES
(UUID(), 'u001', 'c008', 5, 'Beautiful car', 'รถสวยมาก', '2023-10-03'),
(UUID(), 'u002', 'c008', 5, 'Great', 'ยอดเยี่ยม', '2023-10-08'),
(UUID(), 'u003', 'c008', 5, 'Perfect', 'สมบูรณ์แบบ', '2023-10-13');

-- c009
INSERT INTO reviews (id, user_id, pet_chaperone_id, rating, title, comment, date) VALUES
(UUID(), 'u004', 'c009', 4, 'Cute', 'น่ารักดี', '2023-10-04'),
(UUID(), 'u005', 'c009', 4, 'Good service', 'บริการดี', '2023-10-09'),
(UUID(), 'u006', 'c009', 5, 'Nice driver', 'คนขับนิสัยดี', '2023-10-14');

-- c010
INSERT INTO reviews (id, user_id, pet_chaperone_id, rating, title, comment, date) VALUES
(UUID(), 'u007', 'c010', 5, 'Express', 'ด่วนทันใจ', '2023-10-05'),
(UUID(), 'u008', 'c010', 5, 'Safe', 'ปลอดภัย', '2023-10-10'),
(UUID(), 'u009', 'c010', 4, 'Good', 'ดีครับ', '2023-10-15'),
(UUID(), 'u010', 'c010', 5, 'Reliable', 'ไว้ใจได้', '2023-10-20');

