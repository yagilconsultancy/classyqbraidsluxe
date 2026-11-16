-- Booking deposits are paid via Interac e-Transfer (manual bank transfer, not
-- Stripe), so the customer uploads a screenshot as proof of payment when
-- submitting a booking. This column wasn't in the original schema because
-- Base44 handled file storage/metadata separately from the entity record.
ALTER TABLE bookings ADD COLUMN payment_proof_url TEXT;
