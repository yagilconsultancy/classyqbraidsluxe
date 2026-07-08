import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import WatermarkedImage from '@/components/WatermarkedImage';
import ImageGalleryModal from '@/components/styles/ImageGalleryModal';

export default function ProductCard({ product, index = 0 }) {
  const isExtension = product.product_type === 'extension';
  const hasLengthPrices = isExtension && product.length_prices && Object.keys(product.length_prices).length > 0;
  const colors = product.colors || [];
  const images = product.images || [];
  const hasOptions = hasLengthPrices || colors.length > 0;

  const [activeImage, setActiveImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedLength, setSelectedLength] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [adding, setAdding] = useState(false);

  const displayPrice = hasLengthPrices
    ? (selectedLength ? product.length_prices[selectedLength] : Math.min(...Object.values(product.length_prices)))
    : (product.sale_price || product.price || 0);

  const isStartingPrice = hasLengthPrices && !selectedLength;
  const onSale = !hasLengthPrices && product.sale_price && product.sale_price < product.price;
  const lowStock = typeof product.inventory_count === 'number' && product.inventory_count > 0 && product.inventory_count <= 5;
  const outOfStock = typeof product.inventory_count === 'number' && product.inventory_count === 0;

  const cycleImage = (dir) => {
    if (images.length <= 1) return;
    setActiveImage(prev => (prev + dir + images.length) % images.length);
  };

  const handleAddToCart = async () => {
    if (outOfStock) {
      toast.error('Out of stock');
      return;
    }
    if (hasLengthPrices && !selectedLength) {
      toast.error('Please select a length');
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    setAdding(true);
    try {
      const sessionId = localStorage.getItem('cart_session') || (() => {
        const id = 'sess_' + Date.now().toString(36);
        localStorage.setItem('cart_session', id);
        return id;
      })();
      await base44.entities.CartItem.create({
        session_id: sessionId,
        product_id: product.id,
        product_name: product.name,
        product_image: images[0] || '',
        price: displayPrice,
        quantity: 1,
        selected_length: selectedLength || '',
        selected_color: selectedColor || '',
      });
      toast.success(`${product.name} added to cart`);
    } catch (e) {
      toast.error('Could not add to cart');
    }
    setAdding(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      className="group bg-white shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col"
    >
      {/* Image Gallery */}
      <div className="relative aspect-square overflow-hidden">
        {images.length > 0 ? (
          <div
            className="w-full h-full cursor-pointer transition-transform duration-700 group-hover:scale-105"
            onClick={() => setGalleryOpen(true)}
          >
            <WatermarkedImage
              src={images[activeImage]}
              alt={`${product.name} - image ${activeImage + 1}`}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {onSale && (
            <Badge className="bg-gold text-white rounded-none text-[10px]">SALE</Badge>
          )}
          {product.featured && (
            <Badge className="bg-onyx text-white rounded-none text-[10px]">FEATURED</Badge>
          )}
          {outOfStock && (
            <Badge className="bg-red-600 text-white rounded-none text-[10px]">SOLD OUT</Badge>
          )}
          {lowStock && !outOfStock && (
            <Badge className="bg-amber-500 text-white rounded-none text-[10px]">LOW STOCK</Badge>
          )}
        </div>

        {/* Image Nav Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => cycleImage(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => cycleImage(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImage ? 'bg-gold' : 'bg-white/70'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          {product.category?.replace(/_/g, ' ')}
          {isExtension && ' · Extension'}
        </p>
        <h3 className="font-display text-base text-onyx line-clamp-1">{product.name}</h3>

        {product.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2.5">
          <span className="text-[10px] text-muted-foreground">{isStartingPrice ? 'From' : ''}</span>
          <span className="font-medium text-gold">${displayPrice?.toFixed(2)}</span>
          {onSale && (
            <span className="text-xs text-muted-foreground line-through">${product.price?.toFixed(2)}</span>
          )}
        </div>

        {/* Lengths */}
        {hasLengthPrices && (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5 text-muted-foreground">Length</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(product.length_prices).map(([len, price]) => (
                <button
                  key={len}
                  onClick={() => setSelectedLength(len)}
                  className={`px-2 py-1 border text-[10px] transition-all ${
                    selectedLength === len
                      ? 'border-onyx bg-onyx text-white'
                      : 'border-border hover:border-gold'
                  }`}
                >
                  {len} · ${price}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colors */}
        {colors.length > 0 && (!hasLengthPrices || selectedLength) && (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5 text-muted-foreground">
              Color {selectedColor && <span className="text-onyx normal-case">· {selectedColor}</span>}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-2 py-1 border text-[10px] transition-all flex items-center gap-1 ${
                    selectedColor === color
                      ? 'border-onyx bg-onyx text-white'
                      : 'border-border hover:border-gold'
                  }`}
                >
                  {selectedColor === color && <Check className="w-2.5 h-2.5" />}
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inventory */}
        {typeof product.inventory_count === 'number' && product.inventory_count > 0 && !outOfStock && (
          <p className="text-[10px] text-muted-foreground mt-3">
            {lowStock ? `Only ${product.inventory_count} left` : 'In stock'}
          </p>
        )}

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          disabled={adding || outOfStock}
          className="w-full bg-onyx text-white hover:bg-gold rounded-none text-[10px] uppercase tracking-wider h-9 transition-colors mt-3"
        >
          <ShoppingBag className="w-3 h-3 mr-1.5" />
          {adding ? 'Adding...' : outOfStock ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </div>

      {galleryOpen && images.length > 0 && (
        <ImageGalleryModal
          images={images}
          initialIndex={activeImage}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </motion.div>
  );
}