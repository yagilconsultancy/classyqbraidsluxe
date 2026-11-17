import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataApi } from '@/api/dataClient';
import HeroSection from '../components/home/HeroSection';
import FeaturedStyles from '../components/home/FeaturedStyles';
import WhyChooseUs from '../components/home/WhyChooseUs';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTASection from '../components/home/CTASection';

export default function Home() {
  const { data: styles = [] } = useQuery({
    queryKey: ['hairstyles-home'],
    queryFn: () => dataApi.hairstyles.list(),
  });

  const featured = styles.filter(s => s.is_active !== false).slice(0, 6);

  return (
    <div className="pb-16 lg:pb-0">
      <HeroSection heroImage="/files/assets/61fb169fd_image.png" />
      <FeaturedStyles styles={featured} />
      <WhyChooseUs />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}