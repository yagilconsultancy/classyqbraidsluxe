import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import HeroSection from '../components/home/HeroSection';
import FeaturedStyles from '../components/home/FeaturedStyles';
import WhyChooseUs from '../components/home/WhyChooseUs';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';
import PromoModal from '../components/home/PromoModal';

export default function Home() {
  const { data: styles = [] } = useQuery({
    queryKey: ['hairstyles-home'],
    queryFn: () => base44.entities.Hairstyle.list(),
  });

  const featured = styles.filter(s => s.is_active !== false).slice(0, 6);

  return (
    <div className="pb-16 lg:pb-0">
      <HeroSection heroImage="https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/61fb169fd_image.png" />
      <FeaturedStyles styles={featured} />
      <WhyChooseUs />
      <TestimonialsSection />
      <CTASection />
      <PromoModal />
    </div>
  );
}