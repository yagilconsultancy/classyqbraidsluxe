import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, Loader2, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Interac e-Transfer email — change this to your actual Interac email
const INTERAC_EMAIL = 'classyqbraids@gmail.com';

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

  const depositAmount = pendingData
    ? type === 'booking'
      ? (pendingData.bookingData?.total_price || 0) * 0.15
      : (pendingData.items || []).reduce((s, i) => s + i.price * (i.quantity || 1), 0) * 0.15
    : 0;

  const totalAmount = pendingData
    ? type === 'booking'
      ? (pendingData.bookingData?.total_price || 0)
      : (pendingData.items || []).reduce((s, i) => s + i.price * (i.quantity || 1), 0)
    : 0;

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

    // Upload the proof image
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    if (type === 'booking') {
      const res = await base44.functions.invoke('saveBookingDeposit', {
        bookingData: pendingData.bookingData,
        proofImageUrl: file_url,
      });
      if (res.data?.ref) {
        setRefNumber(res.data.ref);
        sessionStorage.removeItem('payment_pending');
        sessionStorage.removeItem('payment_type');
        setSubmitted(true);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } else {
      const res = await base44.functions.invoke('saveOrderDeposit', {
        items: pendingData.items,
        customerInfo: pendingData.customerInfo,
        proofImageUrl: file_url,
      });
      if (res.data?.order_number) {
        setOrderNumber(res.data.order_number);
        sessionStorage.removeItem('payment_pending');
        sessionStorage.removeItem('payment_type');
        localStorage.removeItem('cart_session');
        setSubmitted(true);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
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
            Your deposit proof has been received. We'll confirm your {type === 'booking' ? 'appointment' : 'order'} within 24 hours.
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
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Secure Deposit</span>
          <h1 className="font-display text-3xl font-light text-onyx mt-2">
            Pay Your <span className="italic">15% Deposit</span>
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
              <span className="font-medium">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Deposit Due (15%)</span>
              <span className="font-bold text-gold text-base">${depositAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining (due at appointment)</span>
              <span className="font-medium">${(totalAmount - depositAmount).toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 bg-beige p-3 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-onyx">How to pay:</strong> Open your banking app → Send Interac e-Transfer → Use the email above → Enter the deposit amount → Take a screenshot of the confirmation.
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