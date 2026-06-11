import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Calendar, Clock, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import BookingStepIndicator from '../components/booking/BookingStepIndicator';
import StyleSelector from '../components/booking/StyleSelector';
import OptionSelector from '../components/booking/OptionSelector';
import DateTimeSelector from '../components/booking/DateTimeSelector';
import BookingSummary from '../components/booking/BookingSummary';

const hairTypes = [
  { value: 'human_hair', label: 'Human Hair', desc: 'Premium quality, natural look and feel' },
  { value: 'synthetic_hair', label: 'Synthetic Hair', desc: 'Affordable, versatile styling options' },
  { value: 'curly_extensions', label: 'Curly Extensions', desc: 'Beautiful natural curl patterns' },
  { value: 'straight_extensions', label: 'Straight Extensions', desc: 'Sleek, smooth finish' },
  { value: 'body_wave_hair', label: 'Body Wave Hair', desc: 'Elegant, flowing waves' },
];

const hairSizes = [
  { value: 'small', label: 'Small', desc: 'Delicate, thin braids' },
  { value: 'medium', label: 'Medium', desc: 'Classic, versatile size' },
  { value: 'large', label: 'Large', desc: 'Bold, statement braids' },
  { value: 'jumbo', label: 'Jumbo', desc: 'Extra large, dramatic look' },
];

const hairLengths = [
  { value: 'shoulder', label: 'Shoulder Length', desc: 'Light and manageable' },
  { value: 'mid_back', label: 'Mid Back', desc: 'Classic elegant length' },
  { value: 'waist', label: 'Waist Length', desc: 'Long and luxurious' },
  { value: 'hip', label: 'Hip Length', desc: 'Ultra-long statement' },
  { value: 'custom', label: 'Custom Length', desc: 'Tell us your preference' },
];

const STEPS = ['Style', 'Hair Type', 'Size', 'Length', 'Date & Time', 'Your Info', 'Review'];

export default function Book() {
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({
    hairstyle_id: '', hairstyle_name: '', hair_type: '', hair_size: '', hair_length: '',
    appointment_date: '', appointment_time: '', customer_name: '', customer_email: '',
    customer_phone: '', notes: '', total_price: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  // Pre-select style from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const styleId = params.get('style');
    if (styleId) {
      setBooking(prev => ({ ...prev, hairstyle_id: styleId }));
    }
  }, []);

  const { data: styles = [] } = useQuery({
    queryKey: ['hairstyles-booking'],
    queryFn: () => base44.entities.Hairstyle.list(),
  });

  const activeStyles = styles.filter(s => s.is_active !== false);

  const canNext = () => {
    switch (step) {
      case 0: return !!booking.hairstyle_name;
      case 1: return !!booking.hair_type;
      case 2: return !!booking.hair_size;
      case 3: return !!booking.hair_length;
      case 4: return !!booking.appointment_date && !!booking.appointment_time;
      case 5: return !!booking.customer_name && !!booking.customer_email && !!booking.customer_phone;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const ref = 'CBL-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    const created = await base44.entities.Booking.create({
      ...booking,
      reference_number: ref,
      status: 'confirmed',
      payment_status: 'unpaid',
    });

    // Send confirmation email
    await base44.integrations.Core.SendEmail({
      to: booking.customer_email,
      subject: `Booking Confirmed — ${ref}`,
      from_name: 'ClassyqBraidsLuxe',
      body: `Hi ${booking.customer_name},\n\nYour appointment has been confirmed!\n\nReference: ${ref}\nStyle: ${booking.hairstyle_name}\nDate: ${booking.appointment_date}\nTime: ${booking.appointment_time}\n\nWe look forward to seeing you!\n\n— ClassyqBraidsLuxe`,
    });

    setRefNumber(ref);
    setConfirmed(true);
    setSubmitting(false);
  };

  if (confirmed) {
    return (
      <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto px-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-gold" />
          </div>
          <h1 className="font-display text-3xl text-onyx mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-6">Your appointment has been scheduled. A confirmation email has been sent.</p>
          <div className="bg-white p-6 shadow-sm mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono font-semibold text-gold">{refNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Style</span>
              <span>{booking.hairstyle_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span>{booking.appointment_date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time</span>
              <span>{booking.appointment_time}</span>
            </div>
          </div>
          <Button onClick={() => window.location.href = '/'} className="bg-onyx text-white hover:bg-gold text-xs uppercase tracking-wider rounded-none h-11 px-8">
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8">
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Book Your Visit</span>
          <h1 className="font-display text-3xl lg:text-4xl font-light text-onyx mt-2">
            Schedule Your <span className="italic">Appointment</span>
          </h1>
        </div>

        <BookingStepIndicator steps={STEPS} currentStep={step} />

        <div className="bg-white p-6 lg:p-8 shadow-sm mt-8 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <StyleSelector
                  styles={activeStyles}
                  selected={booking.hairstyle_id}
                  onSelect={(style) => setBooking({
                    ...booking,
                    hairstyle_id: style.id,
                    hairstyle_name: style.name,
                    total_price: style.starting_price || 0,
                  })}
                />
              )}

              {step === 1 && (
                <OptionSelector
                  title="Select Hair Type"
                  options={hairTypes}
                  selected={booking.hair_type}
                  onSelect={(val) => setBooking({ ...booking, hair_type: val })}
                />
              )}

              {step === 2 && (
                <OptionSelector
                  title="Select Hair Size"
                  options={hairSizes}
                  selected={booking.hair_size}
                  onSelect={(val) => setBooking({ ...booking, hair_size: val })}
                />
              )}

              {step === 3 && (
                <OptionSelector
                  title="Select Hair Length"
                  options={hairLengths}
                  selected={booking.hair_length}
                  onSelect={(val) => setBooking({ ...booking, hair_length: val })}
                />
              )}

              {step === 4 && (
                <DateTimeSelector
                  selectedDate={booking.appointment_date}
                  selectedTime={booking.appointment_time}
                  onDateChange={(d) => setBooking({ ...booking, appointment_date: d })}
                  onTimeChange={(t) => setBooking({ ...booking, appointment_time: t })}
                />
              )}

              {step === 5 && (
                <div>
                  <h3 className="font-display text-xl text-onyx mb-6">Your Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Full Name *</Label>
                      <Input value={booking.customer_name} onChange={e => setBooking({ ...booking, customer_name: e.target.value })} className="mt-1.5 rounded-none h-11" placeholder="Your full name" />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Email Address *</Label>
                      <Input type="email" value={booking.customer_email} onChange={e => setBooking({ ...booking, customer_email: e.target.value })} className="mt-1.5 rounded-none h-11" placeholder="your@email.com" />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Phone Number *</Label>
                      <Input type="tel" value={booking.customer_phone} onChange={e => setBooking({ ...booking, customer_phone: e.target.value })} className="mt-1.5 rounded-none h-11" placeholder="(123) 456-7890" />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Notes (Optional)</Label>
                      <Textarea value={booking.notes} onChange={e => setBooking({ ...booking, notes: e.target.value })} className="mt-1.5 rounded-none min-h-[80px]" placeholder="Any special requests or notes..." />
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <BookingSummary booking={booking} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="rounded-none text-xs uppercase tracking-wider h-11 px-6"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="bg-onyx text-white hover:bg-gold rounded-none text-xs uppercase tracking-wider h-11 px-6 transition-colors"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gold text-white hover:bg-gold/90 rounded-none text-xs uppercase tracking-wider h-11 px-8 transition-colors"
            >
              {submitting ? 'Confirming...' : 'Confirm Booking'}
              <Check className="w-3.5 h-3.5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}