import React, { useState, useEffect, useRef } from 'react';
import { dataApi } from '@/api/dataClient';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BookingStepIndicator from '../components/booking/BookingStepIndicator';
import StyleSelector from '../components/booking/StyleSelector';
import OptionSelector from '../components/booking/OptionSelector';
import DateTimeSelector from '../components/booking/DateTimeSelector';
import BookingSummary from '../components/booking/BookingSummary';
import ExtensionShopStep from '../components/booking/ExtensionShopStep';
import SizePriceSelector from '../components/booking/SizePriceSelector';
import InspirationMediaUploader from '../components/booking/InspirationMediaUploader';
import BookingWhatsApp from '../components/booking/BookingWhatsApp';
import TermsModal, { hasAcceptedTerms } from '../components/TermsModal';

const hairLengths = [
  { value: 'shoulder', label: 'Shoulder Length', desc: 'Light and manageable' },
  { value: 'mid_back', label: 'Mid Back', desc: 'Classic elegant length' },
  { value: 'waist', label: 'Waist Length', desc: 'Long and luxurious' },
  { value: 'hip', label: 'Hip Length', desc: 'Ultra-long statement' },
  { value: 'custom', label: 'Custom Length', desc: 'Tell us your preference' },
];

const STEPS = ['Style', 'Size', 'Length', 'Extensions', 'Date & Time', 'Your Info', 'Review'];

export default function Book() {
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({
    hairstyle_id: '', hairstyle_name: '', hair_type: '', hair_size: '', hair_length: '',
    extension_source: '', inspiration_link: '', inspiration_media: [],
    requires_quote: false,
    appointment_date: '', appointment_time: '', customer_name: '', customer_email: '',
    customer_phone: '', notes: '', total_price: 0,
  });
  const [confirmed, setConfirmed] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [selectedExtProducts, setSelectedExtProducts] = useState([]);
  const pendingStyleIdRef = useRef(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [autoSelecting, setAutoSelecting] = useState(false);

  // Prompt terms agreement on first entry, unless already accepted this session
  useEffect(() => {
    if (!hasAcceptedTerms()) setTermsOpen(true);
  }, []);

  // Pre-select style from URL, restore booking progress, or detect post-payment success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const styleId = params.get('style');
    const ref = params.get('ref');
    const returnedFromShop = params.get('booking_return');

    if (returnedFromShop) {
      const saved = sessionStorage.getItem('booking_in_progress');
      if (saved) {
        setBooking(JSON.parse(saved));
        setStep(4); // go to Date & Time after returning from shop
        sessionStorage.removeItem('booking_in_progress');
      }
    } else if (styleId) {
      pendingStyleIdRef.current = styleId;
      setAutoSelecting(true);
    }
    if (ref && window.location.pathname.includes('confirmed')) {
      setRefNumber(ref);
      setConfirmed(true);
    }
  }, []);

  const { data: styles = [] } = useQuery({
    queryKey: ['hairstyles-booking'],
    queryFn: () => dataApi.hairstyles.list(),
  });

  const activeStyles = styles.filter(s => s.is_active !== false);

  // Auto-select style from URL param once styles are loaded, then jump to Size step
  useEffect(() => {
    if (pendingStyleIdRef.current && styles.length > 0) {
      const style = activeStyles.find(s => s.id === pendingStyleIdRef.current);
      if (style) {
        setBooking(prev => ({
          ...prev,
          hairstyle_id: style.id,
          hairstyle_name: style.name,
          total_price: style.starting_price || 0,
        }));
        setStep(1); // Skip straight to Size
      }
      pendingStyleIdRef.current = null;
      setAutoSelecting(false);
    }
  }, [styles]);

  const cardRef = useRef(null);
  const [dir, setDir] = useState(1);
  // While one step swaps for the next (AnimatePresence mode="wait") the card
  // briefly has no content; without holding its height the page shrinks and the
  // browser clamps the scroll position to the footer. Hold the height, then
  // release it and scroll to the card once the new step is mounted.
  const [lockH, setLockH] = useState(null);
  const pendingScroll = useRef(false);
  const goToStep = (s) => {
    setDir(s >= step ? 1 : -1);
    setLockH(cardRef.current ? cardRef.current.offsetHeight : null);
    pendingScroll.current = true;
    setStep(s);
  };
  const scrollToCard = () => {
    const el = cardRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    if (Math.abs(top - window.scrollY) > 4) window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  };
  const settleAfterSwap = () => {
    if (!pendingScroll.current) return;
    pendingScroll.current = false;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setLockH(null);
      scrollToCard();
    }));
  };
  // Picking a style collapses the long style list to one card, which shrinks the
  // page and would drag the viewport down to the footer. Hold the height, bring
  // the card into view, then release.
  const holdAndReveal = () => {
    setLockH(cardRef.current ? cardRef.current.offsetHeight : null);
    setTimeout(() => {
      scrollToCard();
      setTimeout(() => setLockH(null), 500);
    }, 60);
  };

  const canNext = () => {
    switch (step) {
      case 0: return !!booking.hairstyle_name;
      case 1: return !!booking.hair_size;
      case 2: return !!booking.hair_length;
      case 3: return !!booking.extension_source;
      case 4: return !!booking.appointment_date && !!booking.appointment_time;
      case 5: return !!booking.customer_name && !!booking.customer_email && !!booking.customer_phone;
      default: return true;
    }
  };

  const handleExtensionSource = (val) => {
    // If switching away from buy_from_us, clear selected products
    if (val !== 'buy_from_us') setSelectedExtProducts([]);
    setBooking({ ...booking, extension_source: val });
  };

  const handleExtProductsChange = (products) => {
    setSelectedExtProducts(products);
  };

  const extProductsTotal = selectedExtProducts.reduce((sum, sp) => sum + sp.unitPrice * sp.quantity, 0);
  const finalTotal = (booking.total_price || 0) + extProductsTotal;

  const handleSubmit = () => {
    const bookingData = { ...booking, total_price: finalTotal, extension_products: selectedExtProducts.map(sp => ({
      product_id: sp.product.id,
      product_name: sp.product.name,
      length: sp.selectedLength !== '__none__' ? sp.selectedLength : '',
      color: sp.selectedColor !== '__none__' ? sp.selectedColor : '',
      quantity: sp.quantity,
      unit_price: sp.unitPrice,
    }))};
    sessionStorage.setItem('payment_pending', JSON.stringify({ bookingData }));
    sessionStorage.setItem('payment_type', 'booking');
    window.location.href = '/payment-proof';
  };

  if (!hasAcceptedTerms()) {
    return (
      <div className="pt-20 lg:pt-24 bg-beige min-h-screen">
        <TermsModal
          open={termsOpen}
          onAgree={() => setTermsOpen(false)}
          onDecline={() => { window.location.href = '/'; }}
        />
      </div>
    );
  }

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
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Book Your Visit</span>
          <h1 className="font-display text-3xl lg:text-4xl font-light text-onyx mt-2">
            Schedule Your <span className="italic">Appointment</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
            Book your hair braiding appointment in London, Ontario. Choose your style, size, and length — no account required.
          </p>
          <BookingWhatsApp />
        </motion.div>

        <BookingStepIndicator steps={STEPS} currentStep={step} onStepClick={goToStep} />
        {step > 0 && step < 3 && (
          <p className="text-center text-[11px] text-muted-foreground mt-2">Tap a completed step above to change it</p>
        )}

        <div ref={cardRef} className="bg-white p-5 lg:p-8 shadow-sm ring-1 ring-black/5 rounded-2xl mt-6 min-h-[200px] scroll-mt-24 overflow-hidden" style={lockH ? { minHeight: lockH } : undefined}>
          {autoSelecting ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Preparing your booking…</p>
            </div>
          ) : (
          <AnimatePresence mode="wait" initial={false} custom={dir} onExitComplete={settleAfterSwap}>
            <motion.div
              key={step}
              custom={dir}
              variants={{
                enter: (d) => ({ opacity: 0, x: d * 36 }),
                center: { opacity: 1, x: 0 },
                exit: (d) => ({ opacity: 0, x: d * -36 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <StyleSelector
                  styles={activeStyles}
                  selected={booking.hairstyle_id}
                  onSelect={(style) => {
                    holdAndReveal();
                    setBooking({
                      ...booking,
                      hairstyle_id: style.id,
                      hairstyle_name: style.name,
                      total_price: style.starting_price || 0,
                    });
                  }}
                />
              )}

              {step === 1 && (
                <SizePriceSelector
                  selected={booking.hair_size}
                  onSelect={(val, price, requiresQuote) => setBooking({ ...booking, hair_size: val, total_price: price, requires_quote: requiresQuote })}
                  sizePrices={activeStyles.find(s => s.id === booking.hairstyle_id)?.size_prices || {}}
                  sizeContactUs={activeStyles.find(s => s.id === booking.hairstyle_id)?.size_contact_us || []}
                  startingPrice={activeStyles.find(s => s.id === booking.hairstyle_id)?.starting_price || 0}
                />
              )}

              {step === 2 && (
                <OptionSelector
                  title="Select Hair Length"
                  options={hairLengths}
                  selected={booking.hair_length}
                  onSelect={(val) => setBooking({ ...booking, hair_length: val })}
                />
              )}

              {step === 3 && (
                <ExtensionShopStep
                  extensionSource={booking.extension_source}
                  onSourceSelect={handleExtensionSource}
                  selectedProducts={selectedExtProducts}
                  onProductsChange={handleExtProductsChange}
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
                      <Input value={booking.customer_name} onChange={e => setBooking({ ...booking, customer_name: e.target.value })} className="mt-1.5 rounded-xl h-11" placeholder="Your full name" />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Email Address *</Label>
                      <Input type="email" value={booking.customer_email} onChange={e => setBooking({ ...booking, customer_email: e.target.value })} className="mt-1.5 rounded-xl h-11" placeholder="your@email.com" />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Phone Number *</Label>
                      <Input type="tel" value={booking.customer_phone} onChange={e => setBooking({ ...booking, customer_phone: e.target.value })} className="mt-1.5 rounded-xl h-11" placeholder="(123) 456-7890" />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider">Notes (Optional)</Label>
                      <Textarea value={booking.notes} onChange={e => setBooking({ ...booking, notes: e.target.value })} className="mt-1.5 rounded-xl min-h-[80px]" placeholder="Any special requests or notes..." />
                    </div>
                    <div className="pt-2">
                      <InspirationMediaUploader
                        media={booking.inspiration_media}
                        onMediaChange={(urls) => setBooking({ ...booking, inspiration_media: urls })}
                        link={booking.inspiration_link}
                        onLinkChange={(val) => setBooking({ ...booking, inspiration_link: val })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <BookingSummary booking={{ ...booking, total_price: finalTotal }} extProducts={selectedExtProducts} />
              )}
            </motion.div>
          </AnimatePresence>
          )}
        </div>

        {/* Navigation */}
        <div className="sticky bottom-[72px] lg:static z-30 flex justify-between gap-3 mt-4 lg:mt-6 py-3 bg-beige">
          <Button
            variant="outline"
            onClick={() => goToStep(step - 1)}
            disabled={step === 0}
            className="group flex-1 sm:flex-none rounded-full text-xs uppercase tracking-wider h-12 px-6 bg-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => goToStep(step + 1)}
              disabled={!canNext()}
              className="group flex-1 sm:flex-none bg-onyx text-white hover:bg-gold rounded-full text-xs uppercase tracking-wider h-12 px-6 transition-all active:scale-95"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="group flex-1 sm:flex-none bg-gold text-white hover:bg-gold/90 rounded-full text-xs uppercase tracking-wider h-12 px-8 transition-all active:scale-95 hover:shadow-lg hover:shadow-gold/30"
            >
              Confirm Booking
              <Check className="w-3.5 h-3.5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}