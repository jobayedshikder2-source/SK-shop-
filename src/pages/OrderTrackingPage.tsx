import React, { useState } from 'react';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Calendar,
  MessageCircle,
  ExternalLink,
  Printer,
  Mail,
  Send,
  Check
} from 'lucide-react';
import { AdminInvoiceModal } from '../components/AdminInvoiceModal';
import { useLanguage } from '../context/LanguageContext';
import { useStoreData } from '../context/StoreDataContext';
import { Order, OrderStatus } from '../types';

interface OrderTrackingPageProps {
  initialOrderNumber?: string;
  initialPhone?: string;
  onContinueShopping: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderNumber = '',
  initialPhone = '',
  onContinueShopping
}) => {
  const { language, t } = useLanguage();
  const { orders, sendCustomerOrderConfirmationEmail } = useStoreData();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<string | null>(null);

  const [orderQuery, setOrderQuery] = useState(initialOrderNumber);
  const [phoneQuery, setPhoneQuery] = useState(initialPhone);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    if (initialOrderNumber) {
      const clean = initialOrderNumber.replace('#', '').trim().toLowerCase();
      return orders.find(o => o.orderNumber.toLowerCase() === clean) || null;
    }
    return null;
  });
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const cleanOrder = orderQuery.replace('#', '').trim().toLowerCase();
    const cleanPhone = phoneQuery.trim().replace(/\D/g, '');

    if (!cleanOrder) {
      setSearchError('Please provide your Order ID (e.g. SK-58291).');
      return;
    }

    const found = orders.find(o => {
      const matchOrder = o.orderNumber.toLowerCase() === cleanOrder || o.id.toLowerCase() === cleanOrder;
      if (cleanPhone) {
        return matchOrder && o.customerPhone.replace(/\D/g, '').includes(cleanPhone);
      }
      return matchOrder;
    });

    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchedOrder(null);
      setSearchError('No order found with this Order ID and contact number. Please double check your order receipt.');
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedOrder || !emailInput.trim()) return;
    setIsSendingEmail(true);
    try {
      const ok = await sendCustomerOrderConfirmationEmail(searchedOrder, emailInput.trim());
      if (ok) {
        setEmailSentSuccess('Order summary successfully dispatched to ' + emailInput.trim() + '!');
        setTimeout(() => setEmailSentSuccess(null), 4000);
      }
    } catch {
      // Ignored
    } finally {
      setIsSendingEmail(false);
    }
  };

  const steps: { key: OrderStatus; labelEn: string; labelBn: string; desc: string }[] = [
    { key: 'pending', labelEn: 'Order Placed', labelBn: 'অর্ডার গৃহীত', desc: 'Received & awaiting verification call' },
    { key: 'confirmed', labelEn: 'Confirmed', labelBn: 'অর্ডার নিশ্চিত', desc: 'Verified with customer' },
    { key: 'processing', labelEn: 'Packaging', labelBn: 'প্যাকিং সম্পন্ন', desc: 'Quality checked at Dhaka warehouse' },
    { key: 'shipped', labelEn: 'In Transit', labelBn: 'কুরিয়ারে পাঠানো', desc: 'Handed to courier for delivery' },
    { key: 'delivered', labelEn: 'Delivered', labelBn: 'ডেলিভারি সম্পন্ন', desc: 'Successfully handed to customer' },
  ];

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
      return 'cancelled';
    }
    if (stepIndex <= currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest rounded-full">
          Real-Time Tracking
        </span>
        <h1 className="text-3xl font-extrabold font-serif text-stone-900">
          {t.trackOrderTitle}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          {t.trackOrderSub}
        </p>
      </div>

      {/* Tracking Search Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {t.enterOrderId} *
            </label>
            <input
              type="text"
              required
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="e.g. SK-58291"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-900 uppercase font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {t.enterPhone} (Optional)
            </label>
            <input
              type="tel"
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
              placeholder="e.g. 017XXXXXXXX"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t.findOrder}</span>
            </button>
          </div>
        </form>

        {searchError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Searched Order Details View */}
      {searchedOrder && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-md space-y-8 animate-fade-in">
          {/* Top Order Badge row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-stone-900 font-mono">
                  #{searchedOrder.orderNumber}
                </span>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                  searchedOrder.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                  searchedOrder.orderStatus === 'shipped' ? 'bg-sky-100 text-sky-800' :
                  searchedOrder.orderStatus === 'cancelled' || searchedOrder.orderStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {searchedOrder.orderStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Placed on {new Date(searchedOrder.createdAt).toLocaleString()} · {searchedOrder.paymentMethod.toUpperCase()} (৳{searchedOrder.total.toLocaleString()})
              </p>
            </div>

            {/* Courier Tracking */}
            {searchedOrder.courierName && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <div className="flex items-center gap-1.5 text-stone-500 font-medium">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Courier: <strong className="text-stone-900">{searchedOrder.courierName}</strong></span>
                </div>
                {searchedOrder.courierTrackingCode && (
                  <p className="text-stone-500 font-mono mt-0.5">
                    Waybill ID: <strong className="text-stone-900">{searchedOrder.courierTrackingCode}</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Visual Progress Steps */}
          {searchedOrder.orderStatus === 'cancelled' || searchedOrder.orderStatus === 'rejected' ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-red-800">
              <p className="text-sm font-bold">This order has been {searchedOrder.orderStatus.toUpperCase()}</p>
              <p className="text-xs text-red-600 mt-1">
                If you have questions, please reach out to customer support on WhatsApp.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                {steps.map((step, idx) => {
                  const status = getStepStatus(step.key, searchedOrder.orderStatus);
                  const isDone = status === 'completed';

                  return (
                    <div key={step.key} className="flex sm:flex-col items-center text-left sm:text-center gap-3 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isDone 
                          ? 'bg-emerald-600 text-white shadow-md' 
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      <div>
                        <h4 className={`text-xs font-bold ${isDone ? 'text-stone-900' : 'text-stone-400'}`}>
                          {language === 'bn' ? step.labelBn : step.labelEn}
                        </h4>
                        <p className="text-[10px] text-stone-400 hidden sm:block max-w-[120px] mx-auto mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-stone-50 rounded-2xl text-xs text-stone-600">
            <div>
              <span className="font-bold uppercase tracking-wider text-stone-400 block mb-1">Customer:</span>
              <p className="font-semibold text-stone-900 text-sm">{searchedOrder.customerName}</p>
              <p className="text-stone-600">{searchedOrder.customerPhone}</p>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-stone-400 block mb-1">Delivery Destination:</span>
              <p className="font-medium text-stone-800">
                {searchedOrder.deliveryAddress}, {searchedOrder.upazila ? `${searchedOrder.upazila}, ` : ''}{searchedOrder.district}
              </p>
            </div>
          </div>

          {/* Items in this Order */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Purchased Items ({searchedOrder.items.length})
            </h4>
            <div className="divide-y divide-stone-100">
              {searchedOrder.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-md bg-stone-100" />
                    <div>
                      <p className="font-semibold text-stone-900">{item.name}</p>
                      <p className="text-[11px] text-stone-400">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Automated Email Confirmation & Reprint Facility Bar */}
          <div className="pt-4 border-t border-stone-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
                  title="Reprint Order Receipt / Invoice"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Reprint Invoice / Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsInvoiceOpen(true);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Quick Print</span>
                </button>
              </div>

              <a
                href={`https://wa.me/8801781822686?text=Hello%20SK%20Shop,%20inquiry%20regarding%20Order%20${searchedOrder.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#20bd5a] transition shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Order Helpdesk WhatsApp</span>
              </a>
            </div>

            {/* Email Order Summary Service */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>Email Order Confirmation & Summary:</span>
                </span>
                {searchedOrder.customerEmail && (
                  <span className="text-stone-500 font-mono text-[11px]">
                    Saved: {searchedOrder.customerEmail}
                  </span>
                )}
              </div>
              <form onSubmit={handleSendEmail} className="flex gap-2">
                <input
                  type="email"
                  value={emailInput || searchedOrder.customerEmail || ''}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email address to send copy..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                  required
                />
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSendingEmail ? 'Sending...' : 'Send Email'}</span>
                </button>
              </form>
              {emailSentSuccess && (
                <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{emailSentSuccess}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Printable Invoice Modal (Reprint Facility) */}
      <AdminInvoiceModal
        order={searchedOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
};
