import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  Lock,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { BANGLADESH_DIVISIONS, BANGLADESH_DISTRICTS } from '../lib/bangladeshLocations';
import { Order, PaymentMethod, OrderItem } from '../types';

interface CheckoutPageProps {
  onBackToCart: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToCart,
  onOrderPlaced
}) => {
  const { 
    cart, 
    subtotal, 
    shippingFee, 
    discountAmount, 
    total, 
    appliedCoupon, 
    clearCart,
    selectedDistrict,
    setSelectedDistrict 
  } = useCart();
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { createOrder, settings } = useStoreData();

  // Form Fields
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('Dhaka');
  const [upazila, setUpazila] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState(() => {
    return localStorage.getItem('sk_shop_order_note') || '';
  });

  // Payment Selection - Cash on Delivery Only
  const paymentMethod: PaymentMethod = 'cod';

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter districts based on division
  const filteredDistricts = BANGLADESH_DISTRICTS.filter(d => d.division === selectedDivision);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!customerName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11 || !cleanPhone.startsWith('01')) {
      setValidationError('Please enter a valid 11-digit Bangladeshi mobile number starting with 01 (e.g. 01712345678).');
      return;
    }

    setIsSubmitting(true);

    // Create unique Order ID
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `SK-${randomCode}`;

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.productId,
      name: item.name,
      nameBn: item.nameBn,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price,
      regularPrice: item.regularPrice,
      image: item.image,
      sku: item.sku,
    }));

    const orderPayload = {
      orderNumber,
      customerId: currentUser?.uid || 'guest',
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: customerEmail.trim() || undefined,
      deliveryAddress: deliveryAddress.trim(),
      district: selectedDistrict,
      upazila: upazila.trim() || undefined,
      deliveryInstructions: deliveryInstructions.trim() || undefined,
      paymentMethod,
      paymentStatus: 'pending' as const,
      orderStatus: 'pending' as const,
      items: orderItems,
      subtotal,
      shippingFee,
      discount: discountAmount,
      total,
      couponCode: appliedCoupon?.code || undefined,
    };

    try {
      const generatedDocId = await createOrder(orderPayload);
      const fullCreatedOrder: Order = {
        ...orderPayload,
        id: generatedDocId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            changedBy: 'Customer (Order Placed)',
            note: 'Order submitted successfully via checkout'
          }
        ]
      };

      clearCart();
      localStorage.removeItem('sk_shop_order_note');
      setIsSubmitting(false);
      onOrderPlaced(fullCreatedOrder);
    } catch (err: any) {
      console.error('Order placement error:', err);
      setValidationError('Failed to place order. Please check your network and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBackToCart}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping Bag</span>
      </button>

      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900">
          {t.checkoutTitle}
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete your delivery and payment details to receive your parcel.
        </p>
      </div>

      {validationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs font-semibold text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Customer & Delivery Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Customer Contact Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center">1</span>
              <span>{t.contactInfo}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Mahbubur Rahman"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  {t.phoneNumber} *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="017XXXXXXXX or 018XXXXXXXX"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center justify-between">
                  <span>Email Address (For Automated Order Confirmation & Receipt)</span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Instant Dispatch
                  </span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@gmail.com (Receive immediate order summary & invoice)"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  We'll automatically send your complete itemized order summary, tracking number, and Cash on Delivery receipt here.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center">2</span>
              <span>Delivery Address in Bangladesh</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  {t.selectDivision} *
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => {
                    const div = e.target.value;
                    setSelectedDivision(div);
                    const defaultDist = BANGLADESH_DISTRICTS.find(d => d.division === div);
                    if (defaultDist) setSelectedDistrict(defaultDist.name);
                  }}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-900 font-medium"
                >
                  {BANGLADESH_DIVISIONS.map(div => (
                    <option key={div.id} value={div.name}>
                      {language === 'bn' ? div.nameBn : div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  {t.selectDistrict} *
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-900 font-medium"
                >
                  {filteredDistricts.map(dist => (
                    <option key={dist.name} value={dist.name}>
                      {language === 'bn' ? dist.nameBn : dist.name} ({dist.isDhakaCity ? 'Dhaka Metro: ৳70' : 'District Delivery: ৳130'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  {t.deliveryAddress} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  {t.upazilaArea} (Optional)
                </label>
                <input
                  type="text"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  placeholder="e.g. Uttara / Banani / Sadar"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  {t.deliveryInstructions}
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Call before delivery, leave with security"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center">3</span>
              <span>{t.paymentMethod}</span>
            </h2>

            <div className="space-y-3">
              {/* Cash On Delivery Option */}
              <div className="p-5 rounded-2xl border-2 border-amber-600 bg-amber-50/50 flex items-start gap-4">
                <div className="mt-0.5 p-2 bg-amber-600 text-white rounded-xl shadow-xs shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900">{t.cod}</span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">100% SECURE & VERIFIED</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {language === 'bn' 
                      ? 'পণ্য হাতে পেয়ে এবং কোয়ালিটি চেক করে ডেলিভারি রাইডারের নিকট মূল্য পরিশোধ করুন।' 
                      : 'Zero upfront risk. Hand over cash to the courier delivery officer when receiving your package at your doorstep.'}
                  </p>
                  <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center gap-2 text-[11px] text-amber-900 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Nationwide Cash on Delivery available across all 64 districts in Bangladesh.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Order Snapshot Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-base font-bold uppercase tracking-wider text-stone-900 pb-3 border-b border-stone-100">
              Your Items ({cart.length})
            </h2>

            {/* Items mini list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={item.id} className="pt-2 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-15 object-cover rounded-lg bg-stone-50 border border-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {language === 'bn' && item.nameBn ? item.nameBn : item.name}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Qty: {item.quantity} | {item.size} · {item.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-stone-900">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-semibold text-stone-900">৳{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.shipping} ({selectedDistrict})</span>
                <span className="font-semibold text-stone-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[11px]">Free</span>
                  ) : (
                    `৳${shippingFee}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-bold text-stone-900">
                <span>{t.total}</span>
                <span className="text-xl text-amber-700">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-stone-400 text-stone-200 cursor-wait'
                  : 'bg-stone-900 hover:bg-amber-600 text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? t.orderProcessing : `${t.placeOrder} (৳${total.toLocaleString()})`}</span>
            </button>

            <div className="text-center text-[11px] text-stone-400 space-y-1">
              <p>🔒 256-Bit SSL Encrypted & Firestore Verified</p>
              <p>You will receive an instant confirmation call/SMS.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
