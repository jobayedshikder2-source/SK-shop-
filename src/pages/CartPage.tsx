import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Tag, 
  Sparkles, 
  ArrowLeft,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Minus,
  Heart,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Gift,
  Check,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useStoreData } from '../context/StoreDataContext';
import { useWishlist } from '../context/WishlistContext';
import { BANGLADESH_DISTRICTS } from '../lib/bangladeshLocations';
import { Product, CartItem, Coupon } from '../types';

interface CartPageProps {
  onNavigateToCheckout: () => void;
  onContinueShopping: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onNavigateToCheckout,
  onContinueShopping,
  onSelectProduct
}) => {
  const { 
    cart, 
    updateQuantity, 
    updateItemVariant,
    removeFromCart, 
    clearCart, 
    addToCart,
    subtotal, 
    shippingFee, 
    discountAmount, 
    total, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    selectedDistrict,
    setSelectedDistrict,
    freeShippingThreshold 
  } = useCart();
  const { language, t } = useLanguage();
  const { coupons, products } = useStoreData();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [feedback, setFeedback] = useState<{ error?: string; success?: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [recentlyRemoved, setRecentlyRemoved] = useState<CartItem | null>(null);
  const [showCouponsDrawer, setShowCouponsDrawer] = useState(false);
  const [showNotes, setShowNotes] = useState(() => {
    return !!localStorage.getItem('sk_shop_order_note');
  });
  const [orderNote, setOrderNote] = useState(() => {
    return localStorage.getItem('sk_shop_order_note') || '';
  });

  const handleOrderNoteChange = (text: string) => {
    setOrderNote(text);
    if (text.trim()) {
      localStorage.setItem('sk_shop_order_note', text);
    } else {
      localStorage.removeItem('sk_shop_order_note');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!couponCodeInput.trim()) return;

    const matchedCoupon = coupons.find(
      c => c.code.trim().toUpperCase() === couponCodeInput.trim().toUpperCase()
    );

    if (!matchedCoupon) {
      setFeedback({ error: language === 'bn' ? 'অকার্যকর কুপন কোড।' : 'Invalid coupon code.' });
      return;
    }

    const res = applyCoupon(matchedCoupon);
    if (res.success) {
      setFeedback({ success: res.message });
      setCouponCodeInput('');
    } else {
      setFeedback({ error: res.message });
    }
  };

  const handleDirectApplyCoupon = (coupon: Coupon) => {
    setFeedback(null);
    const res = applyCoupon(coupon);
    if (res.success) {
      setFeedback({ success: res.message });
    } else {
      setFeedback({ error: res.message });
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    setRecentlyRemoved(item);
    removeFromCart(item.id);
    setFeedback({
      success: language === 'bn' 
        ? `"${item.name}" ব্যাগ থেকে সরানো হয়েছে।` 
        : `"${item.name}" removed from your bag.`
    });
    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  };

  const handleUndoRemove = () => {
    if (!recentlyRemoved) return;
    const prod = products.find(p => p.id === recentlyRemoved.productId);
    if (prod) {
      addToCart(prod, recentlyRemoved.size, recentlyRemoved.color, recentlyRemoved.quantity, false);
      setRecentlyRemoved(null);
      setFeedback({
        success: language === 'bn' ? 'পণ্যটি পুনরায় ব্যাগে যোগ করা হয়েছে।' : 'Item restored to your bag.'
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleMoveToWishlist = (item: CartItem) => {
    addToWishlist(item.productId);
    removeFromCart(item.id);
    setFeedback({
      success: language === 'bn' 
        ? `"${item.name}" উইশলিস্টে সংরক্ষণ করা হয়েছে।` 
        : `"${item.name}" moved to your Wishlist!`
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Savings calculation
  const totalRegularPrice = cart.reduce((acc, item) => {
    const reg = typeof item.regularPrice === 'number' && item.regularPrice > item.price 
      ? item.regularPrice 
      : item.price;
    return acc + reg * item.quantity;
  }, 0);
  const totalItemSavings = Math.max(0, totalRegularPrice - subtotal);
  const totalOverallSavings = totalItemSavings + discountAmount;

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Recommended products for the bottom of the cart
  const cartProductIds = new Set(cart.map(c => c.productId));
  const recommendedProducts = products
    .filter(p => !cartProductIds.has(p.id) && p.isAvailable && p.totalStock > 0)
    .slice(0, 4);

  // Active coupons available in store
  const availableCoupons = coupons.filter(c => c.isActive);

  // Empty cart view
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center">
        {/* Undo banner if just cleared */}
        {recentlyRemoved && (
          <div className="max-w-md mx-auto mb-8 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-950 shadow-xs">
            <span className="truncate">Removed "{recentlyRemoved.name}"</span>
            <button
              onClick={handleUndoRemove}
              className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 shrink-0 ml-3 underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </div>
        )}

        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mx-auto mb-6 shadow-inner">
          <ShoppingBag className="w-12 h-12 text-stone-300" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 mb-2">
          {t.yourCartIsEmpty}
        </h2>
        <p className="text-sm text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
          {language === 'bn' 
            ? 'আপনার শপিং ব্যাগে কোনো পণ্য যোগ করা হয়নি। আমাদের নতুন পাঞ্জাবি, শাড়ি ও এক্সক্লুসিভ কালেকশন এক্সপ্লোর করুন।' 
            : 'Your bag is currently empty. Explore our latest handcrafted Panjabis, artisanal Sarees, and contemporary styles.'}
        </p>
        <button
          onClick={onContinueShopping}
          className="px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.continueShopping}</span>
        </button>

        {/* Featured Picks for Empty Cart */}
        {products.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200 text-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                Popular Collections You Might Like
              </h3>
              <button
                onClick={onContinueShopping}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 transition flex items-center gap-1 cursor-pointer"
              >
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {products.slice(0, 4).map(prod => (
                <div 
                  key={prod.id}
                  onClick={() => onSelectProduct && onSelectProduct(prod)}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden p-3 hover:shadow-lg transition cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden mb-2">
                    <img 
                      src={prod.images[0]} 
                      alt={prod.name} 
                      className="w-full h-full object-cover rounded-xl group-hover:scale-103 transition duration-300"
                    />
                    {prod.discountedPrice && prod.discountedPrice < prod.regularPrice && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase bg-rose-600 text-white rounded-md shadow-xs">
                        SAVE {Math.round(((prod.regularPrice - prod.discountedPrice) / prod.regularPrice) * 100)}%
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-stone-900 mt-1 truncate">{prod.name}</h4>
                  <div className="mt-auto pt-1 flex items-baseline gap-1.5">
                    <p className="text-xs font-bold text-stone-900">৳{(prod.discountedPrice || prod.regularPrice).toLocaleString()}</p>
                    {prod.discountedPrice && prod.discountedPrice < prod.regularPrice && (
                      <p className="text-[10px] text-stone-400 line-through">৳{prod.regularPrice.toLocaleString()}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const s = prod.sizes[0] || 'Standard';
                      const c = prod.colors[0]?.name || 'Standard';
                      addToCart(prod, s, c, 1, false);
                    }}
                    className="mt-2.5 w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Quick Add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
      {/* Undo Notification Bar */}
      {recentlyRemoved && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-950 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Item "{recentlyRemoved.name}" removed from your bag.</span>
          </div>
          <button
            onClick={handleUndoRemove}
            className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 shrink-0 ml-3 underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback?.success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback.success}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900 p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <button
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.continueShopping}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 tracking-tight flex items-center gap-3">
            <span>{t.shoppingBag}</span>
            <span className="text-xs sm:text-sm font-sans font-bold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-xs font-semibold text-stone-500 hover:text-rose-600 transition flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear bag</span>
          </button>
        </div>
      </div>

      {/* Free Shipping Meter Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/90 shadow-2xs">
        {amountNeededForFreeShipping === 0 ? (
          <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>🎉 Congratulations! Your order qualifies for 100% FREE nationwide doorstep delivery across Bangladesh!</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-amber-950">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-700" />
                <span>Add ৳{amountNeededForFreeShipping.toLocaleString()} more for FREE Nationwide Shipping!</span>
              </span>
              <span className="font-mono text-amber-800">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-amber-200/80 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden divide-y divide-stone-100 shadow-2xs">
            {cart.map((item) => {
              const itemTotal = (item.price || 0) * (item.quantity || 1);
              const maxStock = typeof item.maxStock === 'number' && item.maxStock > 0 ? item.maxStock : 50;
              const isAtMax = item.quantity >= maxStock;
              const product = products.find(p => p.id === item.productId);
              const hasMultipleSizes = product && product.sizes && product.sizes.length > 1;
              const hasMultipleColors = product && product.colors && product.colors.length > 1;

              return (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-stone-50/50 transition duration-200">
                  {/* Thumbnail */}
                  <div 
                    onClick={() => {
                      if (product && onSelectProduct) onSelectProduct(product);
                    }}
                    className="cursor-pointer shrink-0 group relative self-center sm:self-auto"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-26 sm:w-24 sm:h-30 object-cover object-top rounded-2xl border border-stone-200 bg-stone-50 group-hover:scale-102 transition duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-start justify-between gap-2">
                      <h3 
                        onClick={() => {
                          if (product && onSelectProduct) onSelectProduct(product);
                        }}
                        className="font-bold text-sm sm:text-base text-stone-900 hover:text-amber-700 transition cursor-pointer truncate"
                      >
                        {language === 'bn' && item.nameBn ? item.nameBn : item.name}
                      </h3>
                      {/* Mobile Item Total */}
                      <span className="sm:hidden font-extrabold text-sm text-stone-900 shrink-0">
                        ৳{itemTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Variant Selectors or Display */}
                    <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs">
                      {/* Size Selector */}
                      {hasMultipleSizes ? (
                        <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-500">Size:</span>
                          <select
                            value={item.size}
                            onChange={(e) => updateItemVariant(item.id, e.target.value, item.color)}
                            className="bg-transparent font-bold text-stone-900 cursor-pointer text-xs focus:outline-hidden"
                          >
                            {product.sizes.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-stone-100 rounded-md font-semibold text-stone-800 text-xs">
                          Size: {item.size}
                        </span>
                      )}

                      {/* Color Selector */}
                      {hasMultipleColors ? (
                        <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-500">Color:</span>
                          <select
                            value={item.color}
                            onChange={(e) => updateItemVariant(item.id, item.size, e.target.value)}
                            className="bg-transparent font-bold text-stone-900 cursor-pointer text-xs focus:outline-hidden"
                          >
                            {product.colors.map(c => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-stone-100 rounded-md font-semibold text-stone-800 text-xs">
                          Color: {item.color}
                        </span>
                      )}

                      {item.sku && (
                        <span className="text-[10px] font-mono text-stone-400 hidden sm:inline">
                          SKU: {item.sku}
                        </span>
                      )}
                    </div>

                    {/* Stock Alert Warning */}
                    {maxStock <= 5 && (
                      <p className="text-[11px] text-amber-700 font-semibold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Only {maxStock} left in stock!</span>
                      </p>
                    )}

                    {/* Controls Row */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3.5">
                      {/* Quantity Controls with direct input */}
                      <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white text-xs font-bold shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity === 1) {
                              handleRemoveItem(item);
                            } else {
                              updateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                          className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                          title={item.quantity === 1 ? "Remove from bag" : "Decrease quantity"}
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
                        </button>
                        
                        <input
                          type="number"
                          min="1"
                          max={maxStock}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              updateQuantity(item.id, Math.min(Math.max(1, val), maxStock));
                            }
                          }}
                          className="w-10 text-center font-bold text-stone-900 border-x border-stone-200 py-1 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isAtMax}
                          className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          title={isAtMax ? "Maximum stock limit reached" : "Increase quantity"}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Move to Wishlist */}
                      <button
                        type="button"
                        onClick={() => handleMoveToWishlist(item)}
                        className={`text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                          isInWishlist(item.productId) 
                            ? 'text-red-500' 
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                        title="Move to wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isInWishlist(item.productId) ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">Save for later</span>
                      </button>

                      {/* Remove item button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item)}
                        className="text-xs font-semibold text-stone-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>

                      {isAtMax && (
                        <span className="text-[10px] text-amber-700 font-medium">Max stock limit</span>
                      )}
                    </div>
                  </div>

                  {/* Desktop Price Details */}
                  <div className="hidden sm:block text-right shrink-0 sm:self-center">
                    <span className="text-base sm:text-lg font-bold text-stone-900 block font-mono">
                      ৳{itemTotal.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-stone-400 block font-mono">
                      ৳{(item.price || 0).toLocaleString()} each
                    </span>
                    {item.regularPrice && item.price < item.regularPrice && (
                      <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        Save ৳{((item.regularPrice - item.price) * item.quantity).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Actions Sub-bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-stone-500">
            <button
              onClick={onContinueShopping}
              className="font-semibold text-amber-700 hover:text-amber-800 transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Add more items to this bag</span>
            </button>
            <span className="text-stone-400">All prices include applicable Bangladeshi retail VAT & taxes.</span>
          </div>

          {/* Optional Order Note & Gift Request */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-800 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>Special Instructions or Gift Request (Optional)</span>
              </span>
              <span className="text-amber-700 lowercase font-medium">{showNotes ? 'Hide note' : orderNote ? 'Edit note' : '+ Add note'}</span>
            </button>

            {showNotes && (
              <div className="pt-2 animate-fade-in">
                <textarea
                  value={orderNote}
                  onChange={(e) => handleOrderNoteChange(e.target.value)}
                  placeholder="e.g. Please pack in premium gift box, write 'Happy Birthday', or call before delivery..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-900 bg-stone-50"
                />
                <p className="text-[11px] text-stone-400 mt-1">Our Savar fulfillment team will follow this instruction during packing.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-base font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-stone-500 capitalize">{cart.length} unique products</span>
            </h2>

            {/* Delivery Destination Estimator */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center justify-between">
                <span>Shipping Destination:</span>
                <span className="text-[11px] font-semibold text-amber-700 font-mono">
                  {shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}
                </span>
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl bg-white font-medium focus:outline-hidden focus:ring-1 focus:ring-stone-900 cursor-pointer"
              >
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.isDhakaCity ? 'Dhaka Metro: ৳70' : 'District Delivery: ৳130'})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-stone-400 mt-1.5">
                {selectedDistrict.includes('Dhaka') ? '🚀 24 - 48 hours delivery' : '🚚 48 - 72 hours nationwide delivery'}
              </p>
            </div>

            {/* Promo Code Input & Available Coupons */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Coupon Code:
                </label>
                {availableCoupons.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCouponsDrawer(!showCouponsDrawer)}
                    className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{showCouponsDrawer ? 'Hide Offers' : `View Offers (${availableCoupons.length})`}</span>
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-mono text-sm leading-none">{appliedCoupon.code}</p>
                      <p className="text-[10px] text-emerald-700 font-normal mt-0.5">
                        Saving ৳{discountAmount.toLocaleString()} on this order
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="e.g. SKEID15 or WELCOME10"
                    className="flex-1 px-3.5 py-2.5 text-xs uppercase tracking-wider border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition cursor-pointer shrink-0"
                  >
                    {t.applyCoupon}
                  </button>
                </form>
              )}

              {feedback?.error && <p className="text-[11px] text-rose-600 font-medium">{feedback.error}</p>}

              {/* Collapsible Available Coupons List */}
              {showCouponsDrawer && availableCoupons.length > 0 && (
                <div className="pt-2 space-y-2 animate-fade-in border-t border-stone-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Store Promotions:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {availableCoupons.map((c) => {
                      const isApplied = appliedCoupon?.code === c.code;
                      const isEligible = subtotal >= c.minOrderValue;
                      return (
                        <div 
                          key={c.code}
                          className={`p-2.5 rounded-xl border text-xs transition ${
                            isApplied 
                              ? 'bg-emerald-50/80 border-emerald-300' 
                              : isEligible 
                                ? 'bg-amber-50/50 border-amber-200 hover:border-amber-400' 
                                : 'bg-stone-50 border-stone-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-stone-900">{c.code}</span>
                            {isApplied ? (
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Applied
                              </span>
                            ) : isEligible ? (
                              <button
                                type="button"
                                onClick={() => handleDirectApplyCoupon(c)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Apply
                              </button>
                            ) : (
                              <span className="text-[9px] text-stone-400 font-medium">
                                Min ৳{c.minOrderValue}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 mt-1">
                            {c.discountType === 'percentage' 
                              ? `${c.discountValue}% OFF (Max ৳${c.maxDiscount || 'Unlimited'})` 
                              : `Flat ৳${c.discountValue} OFF`} on min order ৳{c.minOrderValue}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 pt-3 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-semibold text-stone-900 font-mono">৳{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Coupon Savings</span>
                  </span>
                  <span className="font-mono">-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t.shipping} ({selectedDistrict})</span>
                <span className="font-semibold text-stone-900 font-mono">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[11px]">Free</span>
                  ) : (
                    `৳${shippingFee}`
                  )}
                </span>
              </div>

              {/* Total Savings Badge */}
              {totalOverallSavings > 0 && (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/60 text-emerald-800 text-[11px] font-bold flex items-center justify-between">
                  <span>Total Savings on this Bag:</span>
                  <span className="font-mono text-emerald-900 text-xs">৳{totalOverallSavings.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-bold text-stone-900">
                <span>{t.total}</span>
                <span className="text-xl text-amber-700 font-mono">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={onNavigateToCheckout}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>{t.checkout}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Safe & Secure Guarantee Badges */}
            <div className="pt-2 border-t border-stone-100 space-y-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Cash on Delivery (Pay after receiving package)</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Fast Nationwide Delivery to all 64 districts</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-sky-600 shrink-0" />
                <span>7 Days Hassle-Free Size & Quality Replacement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Add-ons Section */}
      {recommendedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold font-serif text-stone-900">Recommended for Your Style</h3>
              <p className="text-xs text-stone-500 mt-0.5">Complement your order with these trending fashion pieces</p>
            </div>
            <button
              onClick={onContinueShopping}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 transition flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recommendedProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onSelectProduct && onSelectProduct(prod)}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden p-3 hover:shadow-xl transition duration-300 cursor-pointer group flex flex-col"
              >
                <div className="relative aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden mb-3">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                  />
                  {prod.discountedPrice && prod.discountedPrice < prod.regularPrice && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-md shadow-xs">
                      SAVE {Math.round(((prod.regularPrice - prod.discountedPrice) / prod.regularPrice) * 100)}%
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{prod.category}</span>
                <h4 className="text-xs font-bold text-stone-900 truncate mt-0.5 group-hover:text-amber-700 transition">
                  {prod.name}
                </h4>
                <div className="mt-auto pt-2 flex items-baseline gap-2">
                  <span className="text-xs font-extrabold text-stone-900 font-mono">
                    ৳{(prod.discountedPrice || prod.regularPrice).toLocaleString()}
                  </span>
                  {prod.discountedPrice && (
                    <span className="text-[10px] text-stone-400 line-through font-mono">
                      ৳{prod.regularPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const s = prod.sizes[0] || 'Standard';
                    const c = prod.colors[0]?.name || 'Standard';
                    addToCart(prod, s, c, 1, false);
                    setFeedback({
                      success: `"${prod.name}" added to your bag!`
                    });
                    setTimeout(() => setFeedback(null), 3500);
                  }}
                  className="mt-3 w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing the Bag */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif">Clear your shopping bag?</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Are you sure you want to remove all {cart.length} items from your shopping bag? This cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 px-4 text-xs font-semibold rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                Keep Items
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="py-2.5 px-4 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm cursor-pointer"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Sticky Checkout Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 z-30 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Total Amount</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-amber-700 font-mono">৳{total.toLocaleString()}</span>
            {shippingFee === 0 && (
              <span className="text-[9px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">Free Delivery</span>
            )}
          </div>
        </div>
        <button
          onClick={onNavigateToCheckout}
          className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{t.checkout}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
