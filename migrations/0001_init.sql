-- ClassyQBraidsLuxe D1 schema
-- Replaces the 7 Base44 entities (Availability, Booking, CartItem, Hairstyle,
-- Order, Product, Review). There is no `users` table -- auth/roles are owned
-- by Clerk (see migration spec, Auth & MFA section), not stored here.
--
-- Base44 entities carry implicit `id`, `created_date`, `updated_date` fields
-- on every record; those are made explicit below. `extension_products` and
-- `items` stay as JSON text columns per the migration spec's decision
-- (normalize into their own tables later only if reporting needs it).

PRAGMA foreign_keys = ON;

CREATE TABLE hairstyles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  images TEXT,                   -- JSON array of URLs
  starting_price REAL NOT NULL,
  size_prices TEXT,              -- JSON object: { extra_small, small, small_medium, medium, large, extra_large }
  size_contact_us TEXT,          -- JSON array of size keys
  estimated_duration TEXT,
  category TEXT CHECK (category IN (
    'braids','corn_rows','locs','knotless_braids','box_braids','boho_braids',
    'goddess_braids','cornrows','tribal_braids','stitch_braids','fulani_braids',
    'lemonade_braids','custom_styles'
  )),
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  images TEXT,                   -- JSON array of URLs
  product_type TEXT CHECK (product_type IN ('extension','hairstyle','hair_care')),
  category TEXT,
  price REAL NOT NULL,
  sale_price REAL,
  length_prices TEXT,            -- JSON object: { "10\"": 45, "14\"": 60, ... }
  lengths TEXT,                  -- JSON array
  colors TEXT,                   -- JSON array
  inventory_count INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  reference_number TEXT UNIQUE,
  hairstyle_id TEXT REFERENCES hairstyles(id),
  hairstyle_name TEXT NOT NULL,
  hair_type TEXT CHECK (hair_type IN (
    'human_hair','synthetic_hair','curly_extensions','straight_extensions','body_wave_hair'
  )),
  hair_size TEXT CHECK (hair_size IN (
    'extra_small','small','small_medium','medium','large','extra_large'
  )),
  hair_length TEXT CHECK (hair_length IN (
    'shoulder','mid_back','waist','hip','custom'
  )),
  inspiration_link TEXT,
  inspiration_media TEXT,        -- JSON array of URLs
  appointment_date TEXT NOT NULL,       -- ISO date
  appointment_time TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  notes TEXT,
  total_price REAL,
  requires_quote INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','confirmed','in_progress','completed','cancelled'
  )),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid','paid','refunded'
  )),
  payment_id TEXT,
  extension_products TEXT,       -- JSON array: [{ product_id, product_name, length, color, quantity, unit_price }]
  reminder_72h_sent INTEGER NOT NULL DEFAULT 0,
  reminder_24h_sent INTEGER NOT NULL DEFAULT 0,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_appointment ON bookings(appointment_date, appointment_time);
CREATE INDEX idx_bookings_email ON bookings(customer_email);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items TEXT,                    -- JSON array: [{ product_id, product_name, quantity, price, length, color }]
  subtotal REAL,
  total REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','processing','shipped','delivered','cancelled'
  )),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid','paid','refunded'
  )),
  payment_id TEXT,
  payment_proof_image TEXT,      -- Interac e-Transfer screenshot URL
  shipping_address TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);

CREATE TABLE cart_items (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL,
  selected_length TEXT,
  selected_color TEXT,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cart_items_session ON cart_items(session_id);

CREATE TABLE availability (
  id TEXT PRIMARY KEY,
  day_of_week INTEGER,           -- 0=Sunday .. 6=Saturday
  start_time TEXT,
  end_time TEXT,
  is_available INTEGER NOT NULL DEFAULT 1,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
  specific_date TEXT,            -- ISO date, for one-off blocks
  is_blocked INTEGER NOT NULL DEFAULT 0,
  block_reason TEXT,
  booking_reference TEXT REFERENCES bookings(reference_number),
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_availability_date ON availability(specific_date);
CREATE INDEX idx_availability_dow ON availability(day_of_week);

CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating REAL NOT NULL,
  comment TEXT NOT NULL,
  hairstyle_name TEXT,
  is_approved INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_date TEXT NOT NULL DEFAULT (datetime('now')),
  updated_date TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
