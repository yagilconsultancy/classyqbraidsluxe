import React from 'react';

const LOGO_URL = '/files/assets/496138f0e_classy-logo-extracted.png';

export default function WatermarkedImage({ src, alt, className = '', imgClassName = 'w-full h-full object-cover', style, ...rest }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ containerType: 'inline-size', ...style }}>
      <img src={src} alt={alt} className={imgClassName} loading="lazy" {...rest} />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <img
          src={LOGO_URL}
          alt=""
          className="rotate-[-20deg] opacity-90"
          style={{ width: 'clamp(40px, 35cqw, 120px)', height: 'auto' }}
        />
      </span>
    </div>
  );
}