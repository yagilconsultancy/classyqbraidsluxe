// Column whitelists for admin CRUD (see crud.js). Mirrors migrations/0001.
export const HAIRSTYLE_COLS = {
  name: { type: "text", required: true },
  description: { type: "text" },
  video_url: { type: "text" },
  images: { type: "json" },
  starting_price: { type: "num", required: true },
  size_prices: { type: "json", obj: true },
  size_contact_us: { type: "json" },
  estimated_duration: { type: "text" },
  category: { type: "text" },
  is_active: { type: "bool" },
  sort_order: { type: "num" },
};
export const HAIRSTYLE_ENUMS = {
  category: ["braids","corn_rows","locs","knotless_braids","box_braids","boho_braids","goddess_braids","cornrows","tribal_braids","stitch_braids","fulani_braids","lemonade_braids","custom_styles"],
};

export const PRODUCT_COLS = {
  name: { type: "text", required: true },
  description: { type: "text" },
  images: { type: "json" },
  product_type: { type: "text" },
  category: { type: "text" },
  price: { type: "num", required: true },
  sale_price: { type: "num" },
  length_prices: { type: "json", obj: true },
  lengths: { type: "json" },
  colors: { type: "json" },
  inventory_count: { type: "num" },
  is_active: { type: "bool" },
  featured: { type: "bool" },
};
export const PRODUCT_ENUMS = { product_type: ["extension", "hairstyle", "hair_care"] };

export const AVAILABILITY_COLS = {
  day_of_week: { type: "num" },
  start_time: { type: "text" },
  end_time: { type: "text" },
  is_available: { type: "bool" },
  slot_duration_minutes: { type: "num" },
  specific_date: { type: "text" },
  is_blocked: { type: "bool" },
  block_reason: { type: "text" },
};
