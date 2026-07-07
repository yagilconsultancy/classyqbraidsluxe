import React from 'react';

export default function WatermarkedImage({ src, alt, className = '', imgClassName = 'w-full h-full object-cover', style, ...rest }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ containerType: 'inline-size', ...style }}>
      <img src={src} alt={alt} className={imgClassName} {...rest} />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span
          className="font-display text-white/30 uppercase tracking-[0.15em] rotate-[-20deg] whitespace-nowrap"
          style={{ fontSize: 'clamp(8px, 7cqw, 18px)' }}
        >
          ClassyqBraidsLuxe
        </span>
      </span>
    </div>
  );
}