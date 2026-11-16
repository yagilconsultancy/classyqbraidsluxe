import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, ChevronLeft, ChevronRight, Check, Loader2, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { dataApi } from '@/api/dataClient';
import WatermarkedImage from '@/components/WatermarkedImage';
import ImageGalleryModal from '@/components/styles/ImageGalleryModal';

const EASE = [0.22, 1, 0.36, 1];

function Chip({ active, onClick, children, layoutId }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -1 }}
      className={`relative px-2.5 py-1.5 rounded-full border text-[11px] leading-none transition-colors ${
        active ? 'border-transparent text-white' : 'border-border text-onyx/80 hover:border-gold hover:text-onyx'
      }`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-full bg-onyx"
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        />
      )}
      <span className="relative flex items-center gap-1">
        {active && <Check className="w-2.5 h-2.5" />}
        {children}
      </span>
    </motion.button>
  );
}

export default function ProductCard({ product, index = 0 }) {
  const reduce = useReducedMotion();
  const qc = useQueryClient();
  const isExtension = product.product_type === 'extension';
  const hasLengthPrices = isExtension && product.length_prices && Object.keys(product.length_prices).length > 0;
  const colors = product.colors || [];
  const images = product.images || [];

  const [activeImage, setActiveImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedLength, setSelectedLength] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | adding | added
  const [missing, setMissing] = useState(null); // 'length' | 'color'
  const [shakeKey, setShakeKey] = useState(0);

  const displayPrice = hasLengthPrices
    ? (selectedLength ? product.length_prices[selectedLength] : Math.min(...Object.values(product.length_prices)))
    : (product.sale_price || product.price || 0);

  const isStartingPrice = hasLengthPrices && !selectedLength;
  const onSale = !hasLengthPrices && product.sale_price && product.sale_price < product.price;
  const lowStock = typeof product.inventory_count === 'number' && product.inventory_count > 0 && product.inventory_count <= 5;
  const outOfStock = typeof product.inventory_count === 'number' && product.inventory_count === 0;

  const cycleImage = (dir, e) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setActiveImage((prev) => (prev + dir + images.length) % images.length);
  };

  const flagMissing = (what, message) => {
    setMissing(what);
    setShakeKey((k) => k + 1);
    toast.error(message);
  };

  const handleAddToCart = async () => {
    if (outOfStock || status !== 'idle') return;
    if (hasLengthPrices && !selectedLength) return flagMissing('length', 'Please select a length');
    if (colors.length > 0 && !selectedColor) return flagMissing('color', 'Please select a color');
    setMissing(null);
    setStatus('adding');
    try {
      const sessionId = localStorage.getItem('cart_session') || (() => {
        const id = 'sess_' + Date.now().toString(36);
        localStorage.setItem('cart_session', id);
        return id;
      })();
      await dataApi.cartItems.create({
        session_id: sessionId,
        product_id: product.id,
        product_name: product.name,
        product_image: images[0] || '',
        price: displayPrice,
        quantity: 1,
        selected_length: selectedLength || '',
        selected_color: selectedColor || '',
      });
      window.dispatchEvent(new Event('cart-updated'));
      qc.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.name} added to cart`);
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1800);
    } catch (e) {
      toast.error('Could not add to cart');
      setStatus('idle');
    }
  };

  const shake = missing && !reduce ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.6, ease: EASE }}
      whileHover={{ y: -6 }}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-2xl hover:shadow-black/10 transition-shadow duration-500"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {images.length > 0 ? (
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="block h-full w-full cursor-zoom-in"
            aria-label={`View ${product.name} images`}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="h-full w-full"
              >
                <WatermarkedImage
                  src={images[activeImage]}
                  alt={`${product.name} - image ${activeImage + 1}`}
                  className="h-full w-full transition-transform duration-1000 ease-out group-hover:scale-[1.07]"
                />
              </motion.div>
            </AnimatePresence>
          </button>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}

        {/* subtle bottom gradient so dots/controls stay readable */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {[
            onSale && ['SALE', 'bg-gold'],
            product.featured && ['FEATURED', 'bg-onyx'],
            outOfStock && ['SOLD OUT', 'bg-red-600'],
            lowStock && !outOfStock && ['LOW STOCK', 'bg-amber-500'],
          ].filter(Boolean).map(([label, bg], i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.08, ease: EASE }}
              className={`${bg} rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide text-white shadow-sm ${label === 'LOW STOCK' ? 'animate-pulse' : ''}`}
            >
              {label}
            </motion.span>
          ))}
        </div>

        {/* Expand hint */}
        {images.length > 0 && (
          <span className="pointer-events-none absolute right-3 top-3 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Maximize2 className="h-3.5 w-3.5 text-onyx" />
          </span>
        )}

        {/* Image controls */}
        {images.length > 1 && (
          <>
            {[[-1, ChevronLeft, 'left-2.5', 'Previous image'], [1, ChevronRight, 'right-2.5', 'Next image']].map(([dir, Icon, pos, label]) => (
              <motion.button
                key={label}
                type="button"
                onClick={(e) => cycleImage(dir, e)}
                whileTap={{ scale: 0.88 }}
                className={`absolute ${pos} top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-onyx shadow opacity-0 transition-opacity duration-300 hover:bg-white group-hover:opacity-100`}
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </motion.button>
            ))}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImage ? 'w-5 bg-gold' : 'w-1.5 bg-white/80 hover:bg-white'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {product.category?.replace(/_/g, ' ')}
          {isExtension && ' · Extension'}
        </p>
        <h3 className="line-clamp-1 font-display text-lg leading-snug text-onyx transition-colors group-hover:text-gold">{product.name}</h3>

        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.description}</p>
        )}

        {/* Price (re-animates when an option changes it) */}
        <div className="mt-3 flex items-baseline gap-2">
          {isStartingPrice && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">From</span>}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={displayPrice}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="font-display text-xl font-semibold text-gold tabular-nums"
            >
              ${displayPrice?.toFixed(2)}
            </motion.span>
          </AnimatePresence>
          {onSale && <span className="text-xs text-muted-foreground line-through">${product.price?.toFixed(2)}</span>}
        </div>

        {/* Lengths */}
        {hasLengthPrices && (
          <motion.div key={`l-${shakeKey}`} animate={missing === 'length' ? shake : { x: 0 }} transition={{ duration: 0.4 }} className="mt-3.5">
            <p className={`mb-2 text-[10px] font-medium uppercase tracking-wider transition-colors ${missing === 'length' ? 'text-red-600' : 'text-muted-foreground'}`}>
              {missing === 'length' ? 'Choose a length' : 'Length'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(product.length_prices).map(([len, price]) => (
                <Chip
                  key={len}
                  layoutId={`len-${product.id}`}
                  active={selectedLength === len}
                  onClick={() => { setSelectedLength(len); if (missing === 'length') setMissing(null); }}
                >
                  {len} · ${price}
                </Chip>
              ))}
            </div>
          </motion.div>
        )}

        {/* Colors */}
        <AnimatePresence initial={false}>
          {colors.length > 0 && (!hasLengthPrices || selectedLength) && (
            <motion.div
              key={`c-${shakeKey}`}
              initial={{ opacity: 0, height: 0 }}
              animate={missing === 'color' ? { opacity: 1, height: 'auto', ...shake } : { opacity: 1, height: 'auto', x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mt-3.5 overflow-hidden"
            >
              <p className={`mb-2 text-[10px] font-medium uppercase tracking-wider transition-colors ${missing === 'color' ? 'text-red-600' : 'text-muted-foreground'}`}>
                {missing === 'color' ? 'Choose a color' : 'Color'}
                {selectedColor && <span className="ml-1 normal-case tracking-normal text-onyx">· {selectedColor}</span>}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {colors.map((color) => (
                  <Chip
                    key={color}
                    layoutId={`col-${product.id}`}
                    active={selectedColor === color}
                    onClick={() => { setSelectedColor(color); if (missing === 'color') setMissing(null); }}
                  >
                    {color}
                  </Chip>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stock */}
        {typeof product.inventory_count === 'number' && product.inventory_count > 0 && (
          <p className={`mt-3 flex items-center gap-1.5 text-[11px] ${lowStock ? 'font-medium text-amber-600' : 'text-muted-foreground'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${lowStock ? 'animate-pulse bg-amber-500' : 'bg-green-500'}`} />
            {lowStock ? `Only ${product.inventory_count} left` : 'In stock'}
          </p>
        )}

        {/* Add to cart */}
        <div className="mt-auto pt-4">
        <motion.button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock || status === 'adding'}
          whileHover={outOfStock ? undefined : { scale: 1.02 }}
          whileTap={outOfStock ? undefined : { scale: 0.96 }}
          className={`relative h-11 w-full overflow-hidden rounded-full text-[11px] font-medium uppercase tracking-[0.14em] text-white transition-colors duration-300 disabled:cursor-not-allowed ${
            outOfStock ? 'bg-muted-foreground/50' : status === 'added' ? 'bg-green-600' : 'bg-onyx hover:bg-gold'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={outOfStock ? 'sold' : status}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-2"
            >
              {outOfStock ? 'Sold out' : status === 'adding' ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Adding…</>
              ) : status === 'added' ? (
                <><Check className="h-4 w-4" /> Added</>
              ) : (
                <><ShoppingBag className="h-3.5 w-3.5" /> Add to cart</>
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        </div>
      </div>

      {galleryOpen && images.length > 0 && (
        <ImageGalleryModal images={images} initialIndex={activeImage} onClose={() => setGalleryOpen(false)} />
      )}
    </motion.article>
  );
}
