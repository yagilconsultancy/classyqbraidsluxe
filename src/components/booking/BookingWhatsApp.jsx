import React from 'react';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_LINK = `https://wa.me/14372996513?text=${encodeURIComponent("Hi ClassyqBraidsLuxe! I have a question about booking my appointment.")}`;

export default function BookingWhatsApp() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white text-xs font-medium uppercase tracking-wider px-5 h-11 shadow-sm hover:opacity-90 transition-opacity"
    >
      <MessageCircle className="w-4 h-4" />
      Questions? Chat on WhatsApp
    </a>
  );
}