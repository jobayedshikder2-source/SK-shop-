import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useStoreData } from '../context/StoreDataContext';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateToCheckout, onNavigateToCart }) => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    shippingFee, 
    discountAmount, 
    total, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    freeShippingThreshold 
  } = useCart();
  const { language, t } = useLanguage();
  const { coupons } = useStoreData();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ error?: string; success?: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFeedback(null);
    if (!couponCodeInput.trim()) return;

    const matchedCoupon = coupons.find(
      c => c.code.trim().toUpperCase() === couponCodeInput.trim().toUpperCase()
    );

    if (!matchedCoupon) {
      setCouponFeedback({ error: language === 'bn' ? 'অকার্যকর কুপন কোড।' : 'Invalid coupon code.' });
      return;
    }

    const res = applyCoupon(matchedCoupon);
    if (res.success) {
      setCouponFeedback({ success: res.message });
      setCouponCodeInput('');
    } else {
      setCouponFeedback({ error: res.message });
    }
  };

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Centered Medium Modal in the Middle */}
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border border-stone-200 z-10 animate-fade-in">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-900 text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold tracking-wide uppercase">
                {t.shoppingBag} ({cart.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 text-xs">
            {amountNeededForFreeShipping === 0 ? (
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'অভিনন্দন! আপনি পাচ্ছেন ফ্রি ডেলিভারি!' : '🎉 Congratulations! You unlocked FREE nationwide delivery!'}</span>
              </div>
            ) : (
              <div>
                <p className="text-amber-900 font-medium mb-1.5">
                  {language === 'bn'
                    ? `ফ্রি হোম ডেলিভারি পেতে আরও ৳${amountNeededForFreeShipping.toLocaleString()} টাকার শপিং করুন!`
                    : `Add ৳${amountNeededForFreeShipping.toLocaleString()} more to qualify for FREE delivery!`}
                </p>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-800 mb-1">{t.yourCartIsEmpty}</h3>
                <p className="text-xs text-stone-500 mb-6 max-w-xs">
                  {language === 'bn'
                    ? 'আপনার পছন্দসই পাঞ্জাবি, শাড়ি কিংবা ক্যাজুয়াল পোশাক এখনই নির্বাচন করুন।'
                    : 'Discover our premium handcrafted Panjabi, Sarees, and contemporary styles.'}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition shadow-sm"
                >
                  {t.continueShopping}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-3.5 flex gap-3.5 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-18 h-22 object-cover object-top rounded-xl border border-stone-100 bg-stone-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-stone-900 truncate">
                      {language === 'bn' && item.nameBn ? item.nameBn : item.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Size: <span className="font-semibold text-stone-800">{item.size}</span> | Color: <span className="font-semibold text-stone-800">{item.color}</span>
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50 text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-200 transition"
                        >
                          -
                        </button>
                        <span className="px-2 font-semibold text-stone-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-200 transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-xs font-bold text-stone-900">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3.5">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appliedCoupon.code} ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% off` : `৳${appliedCoupon.discountValue} off`})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      {t.removeCoupon}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        placeholder="Promo code (e.g. SKEID15)"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-900 uppercase tracking-wider"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition"
                    >
                      {t.applyCoupon}
                    </button>
                  </form>
                )}
                {couponFeedback?.error && (
                  <p className="text-[11px] text-red-600 mt-1">{couponFeedback.error}</p>
                )}
                {couponFeedback?.success && (
                  <p className="text-[11px] text-emerald-600 mt-1">{couponFeedback.success}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-stone-900">৳{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-semibold">-৳{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.shipping}</span>
                  <span className="font-semibold text-stone-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">Free</span>
                    ) : (
                      `৳${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                  <span>{t.total}</span>
                  <span className="text-base text-amber-700">৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateToCart();
                  }}
                  className="w-full py-2.5 text-xs font-semibold rounded-xl border border-stone-300 bg-white text-stone-800 hover:bg-stone-100 transition text-center"
                >
                  View Cart
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateToCheckout();
                  }}
                  className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>{t.checkout}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
