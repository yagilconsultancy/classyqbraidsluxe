import React from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/be7a45d35_CBL.png';

export default function BrandLogo({ className = "", heightClass = "h-12", rounded = true }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={LOGO_URL}
        alt="Classy Q Braids Luxe"
        className={`${heightClass} w-auto object-contain ${rounded ? 'rounded-md' : ''}`}
        loading="eager"
      />
    </div>
  );
}