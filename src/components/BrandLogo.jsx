import React from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/be7a45d35_CBL.png';
const MASK_URL = `url(${LOGO_URL})`;

export default function BrandLogo({ className = "", heightClass = "h-12" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={heightClass}
        style={{
          aspectRatio: '768 / 1024',
          backgroundImage: `url(${LOGO_URL})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          maskImage: MASK_URL,
          maskMode: 'luminance',
          WebkitMaskImage: MASK_URL,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
        role="img"
        aria-label="Classy Q Braids Luxe"
      />
    </div>
  );
}