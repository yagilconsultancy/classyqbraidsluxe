#!/usr/bin/env python3
"""
Converts the Base44 CSV exports in data-export/ into a single SQL file of
INSERT statements matching migrations/0001_init.sql.

Base44-only columns (created_by_id, is_sample, description-on-Availability)
are dropped. Empty strings are converted to NULL for enum/numeric columns
so they don't trip the CHECK constraints or type coercion. JSON array/object
columns are passed through as-is (already valid JSON text in the export).
"""
import csv
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data-export"
OUT_FILE = Path(__file__).parent.parent / "data-export" / "import.sql"

def esc(v):
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"

def bool_to_int(v, default="NULL"):
    if v in (None, ""):
        return default
    return "1" if v.strip().lower() == "true" else "0"

def bool_not_null(v):
    # For NOT NULL DEFAULT 0/1 boolean columns: blank -> 0
    return bool_to_int(v, default="0")

def num_or_null(v):
    if v in (None, ""):
        return "NULL"
    return v

def str_or_null(v):
    if v in (None, ""):
        return "NULL"
    return esc(v)

def raw_or_null(v):
    # JSON text columns: pass through, NULL if empty
    if v in (None, ""):
        return "NULL"
    return esc(v)

def load(name):
    with open(DATA_DIR / f"{name}_export.csv", newline="") as fh:
        return list(csv.DictReader(fh))

def gen_hairstyles(rows):
    out = []
    for r in rows:
        cols = ["id", "name", "description", "video_url", "images", "starting_price",
                "size_prices", "size_contact_us", "estimated_duration", "category",
                "is_active", "sort_order", "created_date", "updated_date"]
        vals = [
            esc(r["id"]), esc(r["name"]), str_or_null(r["description"]), str_or_null(r["video_url"]),
            raw_or_null(r["images"]), num_or_null(r["starting_price"]) or "0",
            raw_or_null(r["size_prices"]), raw_or_null(r["size_contact_us"]),
            str_or_null(r["estimated_duration"]), str_or_null(r["category"]),
            bool_not_null(r["is_active"]), num_or_null(r["sort_order"]) or "0",
            esc(r["created_date"]), esc(r["updated_date"]),
        ]
        out.append(f"INSERT INTO hairstyles ({','.join(cols)}) VALUES ({','.join(vals)});")
    return out

def gen_products(rows):
    out = []
    for r in rows:
        cols = ["id", "name", "description", "images", "product_type", "category", "price",
                "sale_price", "length_prices", "lengths", "colors", "inventory_count",
                "is_active", "featured", "created_date", "updated_date"]
        vals = [
            esc(r["id"]), esc(r["name"]), str_or_null(r["description"]), raw_or_null(r["images"]),
            str_or_null(r["product_type"]), str_or_null(r["category"]), num_or_null(r["price"]) or "0",
            num_or_null(r["sale_price"]), raw_or_null(r["length_prices"]), raw_or_null(r["lengths"]),
            raw_or_null(r["colors"]), num_or_null(r["inventory_count"]) or "0",
            bool_not_null(r["is_active"]), bool_not_null(r["featured"]),
            esc(r["created_date"]), esc(r["updated_date"]),
        ]
        out.append(f"INSERT INTO products ({','.join(cols)}) VALUES ({','.join(vals)});")
    return out

def gen_bookings(rows):
    out = []
    for r in rows:
        cols = ["id", "reference_number", "hairstyle_id", "hairstyle_name", "hair_type",
                "hair_size", "hair_length", "inspiration_link", "inspiration_media",
                "appointment_date", "appointment_time", "customer_name", "customer_email",
                "customer_phone", "notes", "total_price", "requires_quote", "status",
                "payment_status", "payment_id", "extension_products", "reminder_72h_sent",
                "reminder_24h_sent", "created_date", "updated_date"]
        vals = [
            esc(r["id"]), str_or_null(r["reference_number"]), str_or_null(r["hairstyle_id"]),
            esc(r["hairstyle_name"]), str_or_null(r["hair_type"]), str_or_null(r["hair_size"]),
            str_or_null(r["hair_length"]), str_or_null(r["inspiration_link"]),
            raw_or_null(r["inspiration_media"]), esc(r["appointment_date"]), esc(r["appointment_time"]),
            esc(r["customer_name"]), esc(r["customer_email"]), str_or_null(r["customer_phone"]),
            str_or_null(r["notes"]), num_or_null(r["total_price"]), bool_not_null(r["requires_quote"]),
            esc(r["status"] or "pending"), esc(r["payment_status"] or "unpaid"),
            str_or_null(r["payment_id"]), raw_or_null(r["extension_products"]),
            bool_not_null(r["reminder_72h_sent"]), bool_not_null(r["reminder_24h_sent"]),
            esc(r["created_date"]), esc(r["updated_date"]),
        ]
        out.append(f"INSERT INTO bookings ({','.join(cols)}) VALUES ({','.join(vals)});")
    return out

def gen_orders(rows):
    out = []
    for r in rows:
        cols = ["id", "order_number", "customer_name", "customer_email", "customer_phone",
                "items", "subtotal", "total", "status", "payment_status", "payment_id",
                "payment_proof_image", "shipping_address", "created_date", "updated_date"]
        vals = [
            esc(r["id"]), str_or_null(r["order_number"]), esc(r["customer_name"]),
            esc(r["customer_email"]), str_or_null(r["customer_phone"]), raw_or_null(r["items"]),
            num_or_null(r["subtotal"]), num_or_null(r["total"]), esc(r["status"] or "pending"),
            esc(r["payment_status"] or "unpaid"), str_or_null(r["payment_id"]),
            str_or_null(r["payment_proof_image"]), str_or_null(r["shipping_address"]),
            esc(r["created_date"]), esc(r["updated_date"]),
        ]
        out.append(f"INSERT INTO orders ({','.join(cols)}) VALUES ({','.join(vals)});")
    return out

def gen_cart_items(rows):
    out = []
    for r in rows:
        cols = ["id", "session_id", "product_id", "product_name", "product_image", "quantity",
                "price", "selected_length", "selected_color", "created_date", "updated_date"]
        vals = [
            esc(r["id"]), esc(r["session_id"]), esc(r["product_id"]), esc(r["product_name"]),
            str_or_null(r["product_image"]), num_or_null(r["quantity"]) or "1",
            num_or_null(r["price"]) or "0", str_or_null(r["selected_length"]),
            str_or_null(r["selected_color"]), esc(r["created_date"]), esc(r["updated_date"]),
        ]
        out.append(f"INSERT INTO cart_items ({','.join(cols)}) VALUES ({','.join(vals)});")
    return out

def gen_availability(rows):
    out = []
    for r in rows:
        cols = ["id", "day_of_week", "start_time", "end_time", "is_available",
                "slot_duration_minutes", "specific_date", "is_blocked", "block_reason",
                "booking_reference", "created_date", "updated_date"]
        vals = [
            esc(r["id"]), num_or_null(r["day_of_week"]), str_or_null(r["start_time"]),
            str_or_null(r["end_time"]), bool_not_null(r["is_available"]),
            num_or_null(r["slot_duration_minutes"]) or "60", str_or_null(r["specific_date"]),
            bool_not_null(r["is_blocked"]), str_or_null(r["block_reason"]),
            str_or_null(r["booking_reference"]), esc(r["created_date"]), esc(r["updated_date"]),
        ]
        out.append(f"INSERT INTO availability ({','.join(cols)}) VALUES ({','.join(vals)});")
    return out

def gen_reviews(rows):
    out = []
    for r in rows:
        cols = ["id", "customer_name", "rating", "comment", "hairstyle_name", "is_approved",
                "is_featured", "created_date", "updated_date"]
        vals = [
            esc(r["id"]), esc(r["customer_name"]), num_or_null(r["rating"]) or "0",
            esc(r["comment"]), str_or_null(r["hairstyle_name"]), bool_not_null(r["is_approved"]),
            bool_not_null(r["is_featured"]), esc(r["created_date"]), esc(r["updated_date"]),
        ]
        out.append(f"INSERT INTO reviews ({','.join(cols)}) VALUES ({','.join(vals)});")
    return out

def main():
    lines = ["PRAGMA foreign_keys = ON;", "BEGIN TRANSACTION;"]
    # Order matters for FK: hairstyles before bookings; bookings before availability
    lines += gen_hairstyles(load("Hairstyle"))
    lines += gen_products(load("Product"))
    lines += gen_bookings(load("Booking"))
    lines += gen_orders(load("Order"))
    lines += gen_cart_items(load("CartItem"))
    lines += gen_availability(load("Availability"))
    lines += gen_reviews(load("Review"))
    lines.append("COMMIT;")
    OUT_FILE.write_text("\n".join(lines) + "\n")
    print(f"Wrote {OUT_FILE} ({len(lines)} lines)")

if __name__ == "__main__":
    main()
