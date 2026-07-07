import React, { useState, useEffect, useRef } from 'react';
import WatermarkedImage from '@/components/WatermarkedImage';

export default function HairstyleImageHover({ images = [], alt = '' }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % images.length);
    }, 1400);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveIdx(0);
  };

  useEffect(() => () => intervalRef.current && clearInterval(intervalRef.current), []);

  const list = images.length > 0 ? images : [null];

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={start}
      onMouseLeave={stop}
    >
      {list.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-500 ${
            idx === activeIdx ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {img ? (
            <WatermarkedImage
              src={img}
              alt={alt}
              className="w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}