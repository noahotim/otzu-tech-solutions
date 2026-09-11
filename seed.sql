-- Seed demo data for OTZU Guest House
-- wrangler d1 execute otzu-db --file=./seed.sql

INSERT OR IGNORE INTO rooms (id, name, slug, type, capacity, price_per_night, status, description, media) VALUES
  ('room_1','Standard Single','standard-single','Standard',1,60000,'available','Cozy single with free WiFi & parking','[{"type":"image","url":"https://tswzb4anegzxdcmk.public.blob.vercel-storage.com/rooms/1786370431624-a0puac.png"}]'),
  ('room_2','Deluxe Double','deluxe-double','Deluxe',2,90000,'available','Spacious double, family-friendly','[]'),
  ('room_3','Executive Suite','executive-suite','Suite',2,150000,'available','Suite with sitting area','[]'),
  ('room_4','Family Room','family-room','Family',4,120000,'available','Family room for 4','[]'),
  ('room_5','Budget Single','budget-single','Budget',1,45000,'available','Budget single','[]'),
  ('room_6','Twin Room','twin-room','Standard',2,70000,'available','Twin beds','[]'),
  ('room_7','Superior Double','superior-double','Superior',2,100000,'available','Superior finish','[]'),
  ('room_8','Presidential Suite','presidential','Suite',4,250000,'available','Top suite','[]');

INSERT OR IGNORE INTO guests (id, name, email, phone) VALUES
  ('guest_demo','Demo Guest','demo@example.com','+256700000000');

INSERT OR IGNORE INTO inventory (id, name, category, quantity, unit, reorder_level) VALUES
  ('inv_1','Toilet Paper','Housekeeping',120,'rolls',30),
  ('inv_2','Towels','Housekeeping',45,'pcs',10),
  ('inv_3','Soap','Housekeeping',80,'pcs',20);

INSERT OR IGNORE INTO staff (id, name, role, phone, payment_phone, salary) VALUES
  ('st_1','Jane Doe','Front Desk','+256782719875','+256782719875',500000);
