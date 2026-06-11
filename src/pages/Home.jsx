import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedStyles from '../components/home/FeaturedStyles';
import WhyChooseUs from '../components/home/WhyChooseUs';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';

const featuredStyles = [
  { name: 'Knotless Braids', price: 150, image: 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/31dd746cc_generated_6bc50c45.png' },
  { name: 'Boho Braids', price: 180, image: 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/4429cd02d_generated_eb8dea20.png' },
  { name: 'Goddess Braids', price: 200, image: 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/9f14d7716_generated_62fc128c.png' },
  { name: 'Cornrows', price: 100, image: 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/87cdd2917_generated_09f4a088.png' },
  { name: 'Tribal Braids', price: 175, image: 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/d6240e5db_generated_16200804.png' },
  { name: 'Box Braids', price: 160, image: 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/31dd746cc_generated_6bc50c45.png' },
];

export default function Home() {
  return (
    <div className="pb-16 lg:pb-0">
      <HeroSection heroImage="https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/c2aa314de_generated_c5024e90.png" />
      <FeaturedStyles styles={featuredStyles} />
      <WhyChooseUs />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}