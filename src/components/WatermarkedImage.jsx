import React from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/6a2a0afc90f70c12878fb656/b02e5ce0d_Gemini_Generated_Image_sgit5asgit5asgit.png';

export default function WatermarkedImage({ src, alt, className = '', imgClassName = 'w-full h-full object-cover', style, ...rest }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ containerType: 'inline-size', ...style }}>
      <img src={src} alt={alt} className={imgClassName} loading="lazy" {...rest} />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <img
          src={LOGO_URL}
          alt=""
          className="rotate-[-20deg] opacity-30"
          style={{ width: 'clamp(40px, 35cqw, 120px)', height: 'auto' }}
        />
      </span>
    </div>
  );
}