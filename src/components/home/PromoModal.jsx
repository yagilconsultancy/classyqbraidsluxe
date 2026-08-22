import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PROMO_IMAGE = 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/a17bfcf86_photo_2026-08-22_11-34-39.jpg';
const STORAGE_KEY = 'cql_promo_dismissed_v1';

export default function PromoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Back to School promotion"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-onyx/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md sm:max-w-lg max-h-[92vh] animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close promotion"
          className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-onyx shadow-lg ring-1 ring-black/10 transition hover:scale-110 hover:bg-gold hover:text-white focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <X className="h-5 w-5" />
        </button>

        <Link
          to="/book"
          onClick={close}
          className="block overflow-hidden rounded-2xl bg-beige shadow-2xl ring-1 ring-black/5 transition hover:shadow-3xl"
        >
          <img
            src={PROMO_IMAGE}
            alt="Back to School Braids and Beads special — starting at $85 when booked online. Ages 4-11."
            className="w-full h-auto object-contain max-h-[88vh]"
            loading="eager"
          />
        </Link>
      </div>
    </div>
  );
}