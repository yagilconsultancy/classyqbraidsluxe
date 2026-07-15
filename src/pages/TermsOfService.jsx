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
          heading: 'Bookings & Appointments',
          list: [
            'All appointments require a non-refundable deposit of $30 to secure your time slot, with the remaining balance due at the time of service.',
            'Appointments are confirmed once the deposit is received and accepted by our team.',
            'Please arrive on time; lateness may shorten your appointment or require rescheduling.',
            'We reserve the right to reschedule or cancel appointments in cases of emergency or unforeseen circumstances, in which case your deposit will be applied to a new date.',
          ],
        },
        {
          heading: 'Cancellations & Rescheduling',
          list: [
            'To reschedule, please contact us at least 48 hours before your appointment.',
            'Deposits are non-refundable but may be transferred to a rescheduled appointment when 48 hours notice is given.',
            'No-shows or cancellations within 48 hours forfeit the deposit.',
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