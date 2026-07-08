import React from 'react';

export default function BrandLogo({ className = "", imgClassName = "", textClassName = "" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className={`font-display tracking-wide leading-none ${imgClassName} ${textClassName}`}>
        <span className="font-semibold">Classyq</span>
        <span className="text-gold italic">Braids</span>
        <span className="font-semibold">Luxe</span>
      </span>
    </div>
  );
}