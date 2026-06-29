import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGalleryModal({ images, initialIndex = 0, onClose }) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-10">
        <X className="w-7 h-7" />
      </button>

      <div className="relative flex items-center justify-center w-full h-full px-12" onClick={e => e.stopPropagation()}>
        {images.length > 1 && (
          <button onClick={prev} className="absolute left-4 text-white/80 hover:text-white p-2">
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        <img
          src={images[current]}
          alt={`Image ${current + 1}`}
          className="max-h-[85vh] max-w-[85vw] object-contain"
        />

        {images.length > 1 && (
          <button onClick={next} className="absolute right-4 text-white/80 hover:text-white p-2">
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}