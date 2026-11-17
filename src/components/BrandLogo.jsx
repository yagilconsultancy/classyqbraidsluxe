import React from 'react';

const LOGO_URL = '/files/assets/750723589_Gemini_Generated_Image_sgit5asgit5asgit1.png';

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