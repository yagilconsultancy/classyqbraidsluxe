import React from 'react';
import { Instagram } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/classyqbraids.ca';
const TIKTOK_URL = 'https://www.tiktok.com/@classyqbraids';

const TikTokIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.88-2.89c.3 0 .59.05.86.13V9.4a6.34 6.34 0 1 0 5.47 6.27V8.73a8.16 8.16 0 0 0 4.77 1.52V6.8a4.85 4.85 0 0 1-1-.11z" />
  </svg>
);

const cls = "w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors";

export default function SocialLinks({ className = 'flex gap-4' }) {
  return (
    <div className={className}>
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={cls}>
        <Instagram className="w-4 h-4" />
      </a>
      {TIKTOK_URL && (
        <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={cls}>
          <TikTokIcon className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}