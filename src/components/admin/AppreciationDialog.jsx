import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AppreciationDialog({ booking, open, onClose }) {
  const [sending, setSending] = useState(false);

  if (!booking) return null;

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await base44.functions.invoke('sendAppreciationNow', { booking_id: booking.id });
      toast.success(`Thank you email sent to ${booking.customer_name}!`);
      onClose();
    } catch (e) {
      toast.error('Failed to send: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-onyx p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7 text-gold" />
          </div>
          <p className="text-gold font-display text-xl">Send a Thank You</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <DialogHeader className="space-y-0">
            <DialogTitle className="sr-only">Send Thank You</DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <span className="block">
                Mark <strong className="text-onyx font-medium">{booking.customer_name}</strong>'s appointment as complete?
              </span>
              <span className="block text-xs">
                Send a personalized thank you email to {booking.customer_email} to show your appreciation and encourage them to book again.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="bg-beige border border-border rounded-sm p-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium text-onyx">{booking.customer_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Style</span>
              <span className="font-medium text-onyx">{booking.hairstyle_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-onyx">{booking.appointment_date}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 pt-0 flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={sending}
            className="flex-1 text-xs"
          >
            Not Now
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 bg-gold hover:bg-gold/90 text-xs gap-2"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
            {sending ? 'Sending…' : 'Send Thank You'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}