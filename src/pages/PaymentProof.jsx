import React, { useState, useEffect } from 'react';
import { dataApi, uploadFile } from '@/api/dataClient';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, Loader2, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Interac e-Transfer email — change this to your actual Interac email
const INTERAC_EMAIL = 'classyqbraidsluxe@gmail.com';

export default function PaymentProof() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  // Passed via sessionStorage by Book.jsx or Cart.jsx
  const [pendingData, setPendingData] = useState(null);
  const [type, setType] = useState('booking'); // 'booking' | 'order'

  useEffect(() => {
    const raw = sessionStorage.getItem('payment_pending');
    const t = sessionStorage.getItem('payment_type');
    if (raw) setPendingData(JSON.parse(raw));
    if (t) setType(t);
  }, []);

  const BOOKING_DEPOSIT = 30;

  const totalAmount = pendingData
    ? type === 'booking'
      ? (pendingData.bookingData?.total_price || 0)
      : (pendingData.items || []).reduce((s, i) => s + i.price * (i.quantity || 1), 0)
    : 0;

  // Bookings: flat $30 deposit, pay balance in cash on appointment day
  // Orders: full payment upfront via Interac
  const depositAmount = type === 'booking' ? BOOKING_DEPOSIT : totalAmount;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please upload your proof of payment screenshot.');
      return;
    }
    if (!pendingData) {
      toast.error('No pending payment data found. Please go back and try again.');
      return;
    }

    setUploading(true);

    try {
      if (type === 'booking') {
        // Upload the proof image to R2, then create the booking in D1.
        const { file_url } = await uploadFile(file, 'proofs');
        const { ref } = await dataApi.bookings.create({
          ...pendingData.bookingData,
          payment_proof_url: file_url,
        });
        if (ref) {
          setRefNumber(ref);
          sessionStorage.removeItem('payment_pending');
          sessionStorage.removeItem('payment_type');
          setSubmitted(true);
        } else {
          toast.error('Something went wrong. Please try again.');
        }
      } else {
        // Upload the proof image to R2, then create the order in D1.
        const { file_url } = await uploadFile(file, 'proofs');
        const { order_number } = await dataApi.orders.create({
          items: pendingData.items,
          customerInfo: pendingData.customerInfo,
          payment_proof_image: file_url,
        });
        if (order_number) {
          setOrderNumber(order_number);
          sessionStorage.removeItem('payment_pending');
          sessionStorage.removeItem('payment_type');
          localStorage.removeItem('cart_session');
          setSubmitted(true);
        } else {
          toast.error('Something went wrong. Please try again.');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Something went wrong. Please try again.');
    }

    setUploading(false);
  };

  if (submitted) {
    return (
      <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto px-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-gold" />
          </div>
          <h1 className="font-display text-3xl text-onyx mb-2">
            {type === 'booking' ? 'Booking Submitted!' : 'Order Submitted!'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {type === 'booking'
              ? 'Your $30 deposit has been received. We\'ll confirm your appointment within 24 hours. Please bring the remaining balance in cash on your appointment day.'
              : 'Your payment proof has been received. We\'ll confirm and process your order within 24 hours.'
            }
          </p>
          {(refNumber || orderNumber) && (
            <div className="bg-white p-4 shadow-sm mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {type === 'booking' ? 'Reference Number' : 'Order Number'}
              </p>
              <p className="font-mono font-semibold text-gold text-lg">{refNumber || orderNumber}</p>
            </div>
          )}
          <Button
            onClick={() => window.location.href = type === 'booking' ? '/' : '/shop'}
            className="bg-onyx text-white hover:bg-gold text-xs uppercase tracking-wider rounded-none h-11 px-8"
          >
            {type === 'booking' ? 'Back to Home' : 'Continue Shopping'}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="text-center mb-8">
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">
            {type === 'booking' ? 'Appointment Deposit' : 'Secure Payment'}
          </span>
          <h1 className="font-display text-3xl font-light text-onyx mt-2">
            {type === 'booking'
              ? <>Pay Your <span className="italic">$30 Deposit</span></>
              : <>Complete <span className="italic">Your Payment</span></>
            }
          </h1>
        </div>

        {/* Interac Instructions */}
        <div className="bg-white p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Interac e-Transfer</p>
              <p className="font-semibold text-onyx">{INTERAC_EMAIL}</p>
            </div>
          </div>

          <div className="hair-line my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-medium">
                {pendingData?.bookingData?.requires_quote
                  ? (totalAmount > 0 ? `$${totalAmount.toFixed(2)} + Service TBD` : 'Contact for Quote')
                  : `$${totalAmount.toFixed(2)}`}
              </span>
            </div>
            {type === 'booking' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Deposit Due Now (Interac)</span>
                  <span className="font-bold text-gold text-base">$30.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {pendingData?.bookingData?.requires_quote ? 'Service Balance' : 'Balance Due (cash on appointment day)'}
                  </span>
                  <span className="font-medium">
                    {pendingData?.bookingData?.requires_quote
                      ? 'Contact for Quote'
                      : `$${(totalAmount - BOOKING_DEPOSIT).toFixed(2)}`}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Amount Due Now (Full Payment)</span>
                <span className="font-bold text-gold text-base">${totalAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 bg-beige p-3 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-onyx">How to pay:</strong> Open your banking app → Send Interac e-Transfer → Use the email above →{' '}
            {type === 'booking'
              ? 'Enter $30.00 as the amount'
              : `Enter $${totalAmount.toFixed(2)} as the amount`
            } → Take a screenshot of the confirmation.
          </div>
        </div>

        {/* Upload Proof */}
        <div className="bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-onyx mb-4 uppercase tracking-wider text-xs">Upload Payment Screenshot</p>

          <label className="block cursor-pointer">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Payment proof" className="w-full max-h-64 object-contain border border-border" />
                <p className="text-xs text-center text-muted-foreground mt-2">Tap to change image</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border hover:border-gold transition-colors p-10 text-center">
                <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Tap to upload screenshot</p>
                <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG, or HEIC</p>
              </div>
            )}
          </label>

          <Button
            onClick={handleSubmit}
            disabled={uploading || !file}
            className="w-full bg-gold text-white hover:bg-gold/90 rounded-none text-xs uppercase tracking-wider h-12 mt-6"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              <>Confirm & Submit <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}