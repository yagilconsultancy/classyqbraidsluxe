import React from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/750723589_Gemini_Generated_Image_sgit5asgit5asgit1.png';

export default function BrandLogo({ className = "", heightClass = "h-12" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={LOGO_URL}
        alt="Classy Q Braids Luxe"
        className={`${heightClass} w-auto object-contain`}
      />
    </div>
  );
}