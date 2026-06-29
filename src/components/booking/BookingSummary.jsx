import React from 'react';
import { Calendar, Clock, User, Scissors, Ruler, Layers } from 'lucide-react';

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
        <div className="flex items-center gap-3 p-3 bg-secondary/50">
          <User className="w-4 h-4 text-gold shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact</p>
            <p className="font-medium text-onyx">{booking.customer_name}</p>
            <p className="text-xs text-muted-foreground">{booking.customer_email} · {booking.customer_phone}</p>
          </div>
        </div>
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
        {booking.total_price > 0 && (
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