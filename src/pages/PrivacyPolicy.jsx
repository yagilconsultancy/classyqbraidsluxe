import React from 'react';
import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="July 15, 2026"
      intro="ClassyqBraidsLuxe is committed to protecting your privacy. This policy explains what information we collect, how we use it, and the choices you have regarding your data."
      sections={[
        {
          heading: 'Information We Collect',
          body: 'We collect information you provide directly to us when you book an appointment, place an order, or contact us. This may include:',
          list: [
            'Contact details such as your name, email address, and phone number.',
            'Appointment details including selected hairstyle, size, length, preferred date and time, and any notes or inspiration references you share.',
            'Order details such as product selections, length, color, quantity, and shipping address.',
            'Payment information, which is processed securely through our payment provider and is not stored on our servers.',
          ],
        },
        {
          heading: 'How We Use Your Information',
          list: [
            'To confirm and manage your braiding appointments and send related notifications.',
            'To process and fulfill your extension and product orders.',
            'To respond to your inquiries and provide customer support.',
            'To improve our services, website, and customer experience.',
          ],
        },
        {
          heading: 'Booking & Inspiration Media',
          body: 'Any photos, videos, or links you upload as style references are used solely to understand and deliver your requested look. We do not share your inspiration media publicly without your consent.',
        },
        {
          heading: 'Cookies & Analytics',
          body: 'We may use cookies and similar technologies to operate the site, remember your cart, and understand how visitors use our pages. You can disable cookies in your browser settings, though some features may not function as intended.',
        },
        {
          heading: 'Sharing Your Information',
          body: 'We do not sell your personal information. We may share data with trusted service providers who help us run our business — such as payment processors, email delivery, and calendar sync — only as needed to provide our services.',
        },
        {
          heading: 'Data Retention',
          body: 'We retain your information only as long as necessary to provide our services and comply with legal obligations. You may request deletion of your data at any time.',
        },
        {
          heading: 'Your Rights',
          list: [
            'Request access to or a copy of the personal information we hold about you.',
            'Ask us to correct inaccurate or incomplete information.',
            'Request that we delete your personal information, subject to legal exceptions.',
            'Opt out of promotional communications at any time.',
          ],
        },
        {
          heading: 'Security',
          body: 'We take reasonable measures to protect your information using industry-standard practices. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.',
        },
        {
          heading: 'Changes to This Policy',
          body: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "last updated" date.',
        },
      ]}
    />
  );
}