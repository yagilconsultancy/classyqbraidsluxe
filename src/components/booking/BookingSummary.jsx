import React from 'react';
import { Calendar, Clock, User, Scissors, Ruler, Layers, MessageCircle, Link2, Info } from 'lucide-react';

const WHATSAPP_NUMBER = '14372996513';

const labels = {
  human_hair: 'Human Hair', synthetic_hair: 'Synthetic Hair', curly_extensions: 'Curly Extensions',
  straight_extensions: 'Straight Extensions', body_wave_hair: 'Body Wave Hair',
  small: 'Small', medium: 'Medium', large: 'Large', jumbo: 'Jumbo',
  shoulder: 'Shoulder Length', mid_back: 'Mid Back', waist: 'Waist Length',
  hip: 'Hip Length', custom: 'Custom Length',
};

export default function BookingSummary({ booking, extProducts = [] }) {
  const extTotal = extProducts.reduce((sum, sp) => sum + sp.unitPrice * sp.quantity, 0);
  const hairstylePrice = booking.total_price - extTotal;

  return (
    <div>
      <h3 className="font-display text-xl text-onyx mb-6">Review Your Booking</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-secondary/50">
          <Scissors className="w-4 h-4 text-gold shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Style</p>
            <p className="font-medium text-onyx">{booking.hairstyle_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-secondary/50">
          <Layers className="w-4 h-4 text-gold shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Hair Type</p>
            <p className="font-medium text-onyx">{labels[booking.hair_type] || booking.hair_type}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/50">
            <Ruler className="w-4 h-4 text-gold shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Size</p>
              <p className="font-medium text-onyx">{labels[booking.hair_size] || booking.hair_size}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50">
            <Ruler className="w-4 h-4 text-gold shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Length</p>
              <p className="font-medium text-onyx">{labels[booking.hair_length] || booking.hair_length}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/50">
            <Calendar className="w-4 h-4 text-gold shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
              <p className="font-medium text-onyx">{booking.appointment_date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50">
            <Clock className="w-4 h-4 text-gold shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Time</p>
              <p className="font-medium text-onyx">{booking.appointment_time}</p>
            </div>
          </div>
        </div>
        {['waist', 'hip', 'custom'].includes(booking.hair_length) && (
          <div className="flex items-start gap-3 p-3 bg-gold/5 border border-gold/20">
            <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <p className="text-xs text-onyx leading-relaxed">
              Please note: any length beyond Mid Back attracts an additional fee. The final price will be confirmed at your appointment.
            </p>
          </div>
        )}
        <div className="flex items-center gap-3 p-3 bg-secondary/50">
          <User className="w-4 h-4 text-gold shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact</p>
            <p className="font-medium text-onyx">{booking.customer_name}</p>
            <p className="text-xs text-muted-foreground">{booking.customer_email} · {booking.customer_phone}</p>
          </div>
        </div>
        {(booking.inspiration_media?.length > 0 || booking.inspiration_link) && (
          <div className="p-3 bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Inspiration Media</p>
            {booking.inspiration_media?.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {booking.inspiration_media.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square border border-border rounded-sm overflow-hidden">
                    {/\.(mp4|webm|mov|ogg|avi)(\?|$)/i.test(url) ? (
                      <video src={url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={url} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover" />
                    )}
                  </a>
                ))}
              </div>
            )}
            {booking.inspiration_link && (
              <a href={booking.inspiration_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gold hover:underline">
                <Link2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{booking.inspiration_link}</span>
              </a>
            )}
          </div>
        )}
        {booking.notes && (
          <div className="p-3 bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-onyx">{booking.notes}</p>
          </div>
        )}
        {extProducts.length > 0 && (
          <div className="p-3 bg-secondary/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Extensions Ordered</p>
            <div className="space-y-1">
              {extProducts.map((sp, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-onyx">
                    {sp.product.name}
                    {sp.selectedLength && sp.selectedLength !== '__none__' && ` · ${sp.selectedLength}`}
                    {sp.selectedColor && sp.selectedColor !== '__none__' && ` · ${sp.selectedColor}`}
                    {sp.quantity > 1 && ` × ${sp.quantity}`}
                  </span>
                  <span className="text-gold font-medium">${(sp.unitPrice * sp.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {booking.requires_quote ? (
          <div className="border-t pt-4 mt-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Price Breakdown</p>
            <div className="bg-gold/10 border border-gold/30 p-4 mb-3 flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-onyx">Custom Quote Required</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  This service size requires a custom price quote. Please contact us via WhatsApp to confirm your final pricing before the appointment. The $30 due now is to confirm your booking and reserve your spot. This will be deducted from final price.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'd like a price quote for: ${booking.hairstyle_name} (${labels[booking.hair_size] || booking.hair_size})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#25D366] text-white text-xs font-medium hover:bg-[#1da851] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>
            {extTotal > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Extensions ({extProducts.length} item{extProducts.length !== 1 ? 's' : ''})</span>
                <span className="text-onyx">${extTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="bg-gold/10 border border-gold/30 p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-onyx">Deposit Due Now</span>
                <span className="font-semibold text-gold">$30.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Balance</span>
                <span className="text-onyx italic text-xs">Contact for Quote</span>
              </div>
            </div>
          </div>
        ) : booking.total_price > 0 && (
          <div className="border-t pt-4 mt-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Price Breakdown</p>
            <div className="space-y-2">
              {hairstylePrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hairstyle Service</span>
                  <span className="text-onyx">${hairstylePrice.toFixed(2)}</span>
                </div>
              )}
              {extTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Extensions ({extProducts.length} item{extProducts.length !== 1 ? 's' : ''})</span>
                  <span className="text-onyx">${extTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-dashed">
                <span className="font-display text-lg text-onyx">Estimated Total</span>
                <span className="font-display text-2xl text-gold">${booking.total_price?.toFixed(2)}</span>
              </div>
              <div className="bg-gold/10 border border-gold/30 p-3 mt-1 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-onyx">Deposit Due Now</span>
                  <span className="font-semibold text-gold">$30.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance Due at Appointment</span>
                  <span className="text-onyx">${Math.max(0, booking.total_price - 30).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}