import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import WatermarkedImage from '@/components/WatermarkedImage';

export default function ProductQuickView({ product, onClose }) {
  const isExtension = product?.product_type === 'extension';
  const hasLengthPrices = isExtension && product.length_prices && Object.keys(product.length_prices).length > 0;

  const [selectedLength, setSelectedLength] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [adding, setAdding] = useState(false);

  const displayPrice = hasLengthPrices
    ? (selectedLength ? product.length_prices[selectedLength] : Math.min(...Object.values(product.length_prices)))
    : (product?.sale_price || product?.price || 0);

  const isStartingPrice = hasLengthPrices && !selectedLength;

  const handleAddToCart = async () => {
    if (hasLengthPrices && !selectedLength) {
      toast.error('Please select a length');
      return;
    }
    if ((product.colors || []).length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    setAdding(true);
    const sessionId = localStorage.getItem('cart_session') || (() => {
      const id = 'sess_' + Date.now().toString(36);
      localStorage.setItem('cart_session', id);
      return id;
    })();
    await base44.entities.CartItem.create({
      session_id: sessionId,
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] || '',
      price: displayPrice,
      quantity: 1,
      selected_length: selectedLength || '',
      selected_color: selectedColor || '',
    });
    setAdding(false);
    toast.success(`${product.name} added to cart`);
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        {/* Image */}
        {product.images?.[0] && (
          <div className="w-full aspect-[4/3] overflow-hidden">
            <WatermarkedImage src={product.images[0]} alt={product.name} className="w-full h-full" />
          </div>
        )}
        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.category?.replace(/_/g, ' ')}</p>
            <h2 className="font-display text-2xl text-onyx mt-1">{product.name}</h2>
            {product.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{product.description}</p>}
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-xs text-muted-foreground">{isStartingPrice ? 'Starting from' : 'Price'}</span>
              <span className="text-xl font-medium text-gold">${displayPrice?.toFixed(2)}</span>
            </div>
          </div>

          {/* Length Selection */}
          {hasLengthPrices && (
            <div>
              <p className="text-xs uppercase tracking-wider font-medium mb-2">Select Length</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(product.length_prices).map(([len, price]) => (
                  <button
                    key={len}
                    onClick={() => setSelectedLength(len)}
                    className={`px-3 py-1.5 border text-xs transition-all ${
                      selectedLength === len
                        ? 'border-onyx bg-onyx text-white'
                        : 'border-border hover:border-gold'
                    }`}
                  >
                    {len} — ${price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection — shown after length is picked (or always for non-length products) */}
          {(product.colors || []).length > 0 && (!hasLengthPrices || selectedLength) && (
            <div>
              <p className="text-xs uppercase tracking-wider font-medium mb-2">Select Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 border text-xs transition-all ${
                      selectedColor === color
                        ? 'border-onyx bg-onyx text-white'
                        : 'border-border hover:border-gold'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full bg-onyx text-white hover:bg-gold rounded-none text-xs uppercase tracking-wider h-11 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {adding ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}