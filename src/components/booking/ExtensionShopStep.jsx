import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Scissors, Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExtensionShopStep({ extensionSource, onSourceSelect, selectedProducts, onProductsChange }) {
  // selectedProducts: [{ product, selectedLength, selectedColor, quantity, unitPrice }]

  const { data: products = [] } = useQuery({
    queryKey: ['booking-shop-products'],
    queryFn: () => base44.entities.Product.filter({ product_type: 'extension', is_active: true }),
    enabled: extensionSource === 'buy_from_us',
  });

  const [configuringId, setConfiguringId] = useState(null);
  const [pendingLength, setPendingLength] = useState('');
  const [pendingColor, setPendingColor] = useState('');

  const getUnitPrice = (product, length) => {
    if (product.length_prices && length && product.length_prices[length] != null) {
      return product.length_prices[length];
    }
    return product.sale_price || product.price || 0;
  };

  const hasLengthPrices = (product) =>
    product.length_prices && Object.keys(product.length_prices).length > 0;

  const startConfigure = (product) => {
    setConfiguringId(product.id);
    setPendingLength(hasLengthPrices(product) ? '' : '__none__');
    setPendingColor((product.colors || []).length === 0 ? '__none__' : '');
  };

  const confirmAdd = (product) => {
    const unitPrice = getUnitPrice(product, pendingLength);
    const existing = selectedProducts.find(
      sp => sp.product.id === product.id && sp.selectedLength === pendingLength && sp.selectedColor === pendingColor
    );
    let updated;
    if (existing) {
      updated = selectedProducts.map(sp =>
        sp === existing ? { ...sp, quantity: sp.quantity + 1 } : sp
      );
    } else {
      updated = [...selectedProducts, { product, selectedLength: pendingLength, selectedColor: pendingColor, quantity: 1, unitPrice }];
    }
    onProductsChange(updated);
    setConfiguringId(null);
    setPendingLength('');
    setPendingColor('');
  };

  const changeQty = (idx, delta) => {
    const updated = selectedProducts
      .map((sp, i) => i === idx ? { ...sp, quantity: sp.quantity + delta } : sp)
      .filter(sp => sp.quantity > 0);
    onProductsChange(updated);
  };

  const canConfirm = (product) => {
    const needsLength = hasLengthPrices(product);
    const needsColor = (product.colors || []).length > 0;
    return (!needsLength || pendingLength) && (!needsColor || pendingColor);
  };

  const options = [
    { value: 'buy_from_us', icon: ShoppingBag, title: 'Buy Extensions From Us', desc: 'Browse our premium hair extension collection and add to your booking.' },
    { value: 'own_extensions', icon: Scissors, title: 'Bringing My Own Extensions', desc: 'I already have my hair extensions and will bring them to the appointment.' },
  ];

  return (
    <div>
      <h3 className="font-display text-xl text-onyx mb-2">Hair Extensions</h3>
      <p className="text-sm text-muted-foreground mb-6">Will you be purchasing extensions from us, or bringing your own?</p>

      {/* Source selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {options.map(({ value, icon: Icon, title, desc }) => (
          <button
            key={value}
            onClick={() => onSourceSelect(value)}
            className={`p-5 text-left border-2 transition-all duration-200 ${
              extensionSource === value ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${extensionSource === value ? 'bg-gold text-white' : 'bg-secondary text-muted-foreground'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-medium text-onyx text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
          </button>
        ))}
      </div>

      {/* Product browser */}
      {extensionSource === 'buy_from_us' && (
        <div>
          <p className="text-xs uppercase tracking-wider font-medium mb-3 text-onyx">Select Your Extensions</p>

          {products.length === 0 && (
            <p className="text-sm text-muted-foreground">Loading products...</p>
          )}

          <div className="space-y-3">
            {products.map(product => {
              const isConfiguring = configuringId === product.id;
              const addedItems = selectedProducts.filter(sp => sp.product.id === product.id);

              return (
                <div key={product.id} className="border border-border bg-white">
                  <div className="flex items-center gap-3 p-3">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-14 h-14 object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 bg-secondary shrink-0 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-onyx">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {hasLengthPrices(product)
                          ? `From $${Math.min(...Object.values(product.length_prices)).toFixed(2)}`
                          : `$${(product.sale_price || product.price)?.toFixed(2)}`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => isConfiguring ? setConfiguringId(null) : startConfigure(product)}
                      className="rounded-none text-xs h-8 px-3 shrink-0"
                    >
                      {isConfiguring ? 'Cancel' : '+ Add'}
                    </Button>
                  </div>

                  {/* Inline configurator */}
                  {isConfiguring && (
                    <div className="border-t border-border p-3 bg-secondary/30 space-y-3">
                      {hasLengthPrices(product) && (
                        <div>
                          <p className="text-xs font-medium mb-1.5">Select Length</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(product.length_prices).map(([len, price]) => (
                              <button
                                key={len}
                                type="button"
                                onClick={() => setPendingLength(len)}
                                className={`px-2.5 py-1 border text-xs transition-all ${pendingLength === len ? 'border-onyx bg-onyx text-white' : 'border-border bg-white hover:border-gold'}`}
                              >
                                {len} — ${price}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {(product.colors || []).length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1.5">Select Color</p>
                          <div className="flex flex-wrap gap-1.5">
                            {product.colors.map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setPendingColor(color)}
                                className={`px-2.5 py-1 border text-xs transition-all ${pendingColor === color ? 'border-onyx bg-onyx text-white' : 'border-border bg-white hover:border-gold'}`}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        type="button"
                        disabled={!canConfirm(product)}
                        onClick={() => confirmAdd(product)}
                        className="bg-onyx text-white hover:bg-gold rounded-none text-xs h-8 px-4"
                      >
                        <Check className="w-3 h-3 mr-1" /> Confirm Add
                      </Button>
                    </div>
                  )}

                  {/* Added items with qty controls */}
                  {addedItems.length > 0 && !isConfiguring && (
                    <div className="border-t border-border divide-y divide-border">
                      {addedItems.map((sp, idx) => {
                        const globalIdx = selectedProducts.indexOf(sp);
                        return (
                          <div key={idx} className="flex items-center justify-between px-3 py-1.5 bg-gold/5">
                            <span className="text-xs text-onyx">
                              {[sp.selectedLength !== '__none__' && sp.selectedLength, sp.selectedColor !== '__none__' && sp.selectedColor].filter(Boolean).join(' · ') || 'Standard'} — ${(sp.unitPrice * sp.quantity).toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => changeQty(globalIdx, -1)} className="w-6 h-6 flex items-center justify-center border border-border hover:border-gold rounded-sm">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs w-4 text-center font-medium">{sp.quantity}</span>
                              <button type="button" onClick={() => changeQty(globalIdx, 1)} className="w-6 h-6 flex items-center justify-center border border-border hover:border-gold rounded-sm">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedProducts.length > 0 && (
            <div className="mt-4 p-3 bg-gold/10 border border-gold/30 text-sm">
              <span className="font-medium text-onyx">Extensions total: </span>
              <span className="text-gold font-semibold">
                ${selectedProducts.reduce((sum, sp) => sum + sp.unitPrice * sp.quantity, 0).toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">(added to booking total)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}