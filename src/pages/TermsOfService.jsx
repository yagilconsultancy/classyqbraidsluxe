import React from 'react';
import LegalLayout from '@/components/LegalLayout';

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="July 15, 2026"
      intro="These Terms of Service govern your use of the ClassyqBraidsLuxe website, booking system, and online shop. By using our services, you agree to these terms."
      sections={[
        {
          heading: 'Acceptance of Terms',
          body: 'By accessing our site, booking an appointment, or placing an order, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use our services.',
        },
        {
          heading: 'Booking & Payment',
          list: [
            'A $30 deposit is required to secure your appointment. This deposit is non-refundable.',
            'The remaining balance is due in CASH on the day of your appointment.',
            'Appointments are confirmed once the deposit is received and accepted by our team.',
            'We reserve the right to reschedule or cancel appointments in cases of emergency or unforeseen circumstances, in which case your deposit will be applied to a new date.',
          ],
        },
        {
          heading: 'Hair & Extensions',
          list: [
            'Pre-stretched extensions only will be used.',
            'Extra length or volume incurs an additional fee.',
            'Hair must come washed, detangled, and blow-dried or combed out.',
            'Add $10 for detangling if required.',
            'Add $10 for blow dry if required.',
          ],
        },
        {
          heading: 'Cancellations & Rescheduling',
          list: [
            'Please cancel or reschedule at least 48 hours before your appointment.',
            'Cancellations made less than 36 hours before the appointment result in the deposit being forfeited.',
            'No-shows forfeit the deposit.',
          ],
        },
        {
          heading: 'Lateness',
          list: [
            'Please notify us if you are running late.',
            'A 15-minute grace period is given.',
            'Arriving 30 or more minutes late with no communication may result in your appointment being cancelled.',
          ],
        },
        {
          heading: 'Hair Extensions & Products',
          list: [
            'Product images and length representations are illustrative; actual results may vary based on your natural hair and the style selected.',
            'Some styles or sizes may require a custom quote; the final price will be confirmed before your appointment.',
            'Prices are listed in Canadian dollars and are subject to change without notice.',
          ],
        },
        {
          heading: 'Orders & Payments',
          list: [
            'All orders are subject to availability and confirmation of payment.',
            'Payment is processed securely through our payment provider at checkout.',
            'We reserve the right to refuse or cancel any order at our discretion, with a full refund for any payment already made.',
          ],
        },
        {
          heading: 'Shipping & Returns',
          body: 'Shipping times and return eligibility vary by product. Please review the details provided at checkout or contact us for specific return requests. Hygiene products such as hair extensions may be non-returnable once opened for health and safety reasons.',
        },
        {
          heading: 'Inspiration Media',
          body: 'Any images, videos, or links you share as style references are provided at your own responsibility. You confirm you have the right to share them and grant us permission to view them for the purpose of delivering your requested style.',
        },
        {
          heading: 'Intellectual Property',
          body: 'All content on this site — including the ClassyqBraidsLuxe name, logo, images, and styling — is the property of ClassyqBraidsLuxe and may not be reproduced without prior written permission.',
        },
        {
          heading: 'Limitation of Liability',
          body: 'ClassyqBraidsLuxe is not liable for indirect or incidental damages arising from the use of our services. Our liability is limited to the value of the service or product purchased.',
        },
        {
          heading: 'Changes to These Terms',
          body: 'We may update these Terms at any time. Continued use of our services after changes are posted constitutes acceptance of the revised Terms.',
        },
      ]}
    />
  );
}