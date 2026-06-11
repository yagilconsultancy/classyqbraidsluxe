import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Instagram, Facebook, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: 'hello@classyqbraidsluxe.com',
      subject: `Contact Form: ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`,
    });
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', phone: '', message: '' });
    setSending(false);
  };

  return (
    <div className="pt-20 lg:pt-24 pb-24 lg:pb-16 bg-beige min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
        <span className="text-gold text-xs uppercase tracking-[0.3em] font-medium">Get in Touch</span>
        <h1 className="font-display text-4xl lg:text-6xl font-light text-onyx mt-3">
          Contact <span className="italic">Us</span>
        </h1>
        <div className="hair-line w-32 mx-auto mt-6" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-onyx text-white p-8 lg:p-10 h-full">
              <h2 className="font-display text-2xl text-white mb-8">Visit Our <span className="italic text-gold">Studio</span></h2>
              <div className="space-y-6">
                <a href="tel:+1234567890" className="flex items-center gap-4 text-white/80 hover:text-gold transition-colors">
                  <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold/60 mb-0.5">Phone</p>
                    <p>(123) 456-7890</p>
                  </div>
                </a>
                <a href="mailto:hello@classyqbraidsluxe.com" className="flex items-center gap-4 text-white/80 hover:text-gold transition-colors">
                  <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold/60 mb-0.5">Email</p>
                    <p>hello@classyqbraidsluxe.com</p>
                  </div>
                </a>
                <div className="flex items-start gap-4 text-white/80">
                  <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold/60 mb-0.5">Address</p>
                    <p>123 Beauty Lane, Suite 100<br />City, State 12345</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 text-white/80">
                  <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold/60 mb-0.5">Hours</p>
                    <p>Mon - Sat: 9:00 AM - 7:00 PM<br />Sunday: Closed</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <form onSubmit={handleSubmit} className="bg-white p-8 lg:p-10 shadow-sm">
              <h2 className="font-display text-2xl text-onyx mb-6">Send a <span className="italic text-gold">Message</span></h2>
              <div className="space-y-5">
                <div>
                  <Label className="text-xs uppercase tracking-wider">Full Name</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="mt-1.5 rounded-none border-border h-11" placeholder="Your name" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="mt-1.5 rounded-none border-border h-11" placeholder="your@email.com" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">Phone</Label>
                  <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1.5 rounded-none border-border h-11" placeholder="(123) 456-7890" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">Message</Label>
                  <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required className="mt-1.5 rounded-none border-border min-h-[120px]" placeholder="How can we help?" />
                </div>
                <Button type="submit" disabled={sending} className="w-full bg-onyx text-white hover:bg-gold text-xs uppercase tracking-[0.15em] rounded-none h-12 transition-all duration-300">
                  {sending ? 'Sending...' : 'Send Message'}
                  {!sending && <Send className="w-3.5 h-3.5 ml-2" />}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}