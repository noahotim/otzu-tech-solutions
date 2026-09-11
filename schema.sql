-- Cloudflare D1 schema for OTZU Guest House Management
-- Run: wrangler d1 execute otzu-db --file=./schema.sql
-- This mirrors the Vercel DB inferred from /console (93KB JS)

-- Users / Auth (used by /api/auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  must_change_password INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Roles (dynamic, from /api/catalog?resource=roles)
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  permissions TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Guests (catalog guests)
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Rooms (catalog rooms) - media is JSON array [{type:"image",url:"..."}]
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  type TEXT DEFAULT 'Standard',
  capacity INTEGER DEFAULT 2,
  price_per_night INTEGER NOT NULL,
  status TEXT DEFAULT 'available', -- available|occupied|maintenance
  description TEXT,
  media TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Reservations / Bookings ( /api/booking , /api/reservations )
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  guest_id TEXT REFERENCES guests(id),
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  room_id TEXT REFERENCES rooms(id),
  room_name TEXT,
  check_in TEXT NOT NULL,  -- YYYY-MM-DD
  check_out TEXT NOT NULL,
  nights INTEGER NOT NULL,
  guests_count INTEGER DEFAULT 1,
  total INTEGER NOT NULL, -- in UGX minor (or store as integer)
  payment_method TEXT DEFAULT 'pay_on_arrival', -- pay_on_arrival|mobile_money|card|bank|cash
  payment_status TEXT DEFAULT 'pending', -- pending|paid|failed
  status TEXT DEFAULT 'confirmed', -- confirmed|cancelled|completed|no_show
  momo_reference TEXT,
  stripe_session_id TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Invoices & Payments ( /api/billing )
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  reservation_id TEXT REFERENCES reservations(id),
  invoice_number TEXT UNIQUE NOT NULL,
  guest_name TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'open', -- open|paid|overdue
  issued_at TEXT DEFAULT (datetime('now')),
  due_at TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT REFERENCES invoices(id),
  reservation_id TEXT REFERENCES reservations(id),
  amount INTEGER NOT NULL,
  method TEXT, -- mobile_money|card|bank|cash|other
  reference TEXT,
  received_at TEXT DEFAULT (datetime('now'))
);

-- Inventory (catalog inventory)
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  reorder_level INTEGER DEFAULT 5,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Staff (catalog staff)
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT REFERENCES roles(name),
  phone TEXT,
  payment_phone TEXT,
  salary INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active|inactive|leave
  created_at TEXT DEFAULT (datetime('now'))
);

-- Contact submissions ( /api/contact )
CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reservations_check_in ON reservations(check_in);
CREATE INDEX IF NOT EXISTS idx_reservations_room ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_invoices_reservation ON invoices(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- Seed default roles
INSERT OR IGNORE INTO roles (id, name, permissions) VALUES
  ('r1','Admin','["all"]'),
  ('r2','Front Desk','["reservations","guests","billing"]'),
  ('r3','Housekeeping','["rooms","inventory"]');
