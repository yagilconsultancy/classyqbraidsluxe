-- Bookings capture whether the client buys extensions from the studio or brings
-- their own ('buy_from_us' | 'bring_own'); Base44 stored it, the original D1
-- schema and the Phase 4 insert missed it. Admin views use it.
ALTER TABLE bookings ADD COLUMN extension_source TEXT;
