import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Package, 
  Printer, 
  MessageCircle, 
  ArrowRight, 
  Truck, 
  MapPin, 
  Phone,
  Mail,
  Send,
  Eye,
  Check,
  RefreshCw,
  Copy,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useStoreData } from '../context/StoreDataContext';
import { AdminInvoiceModal } from '../components/AdminInvoiceModal';
import { generateCustomerOrderEmailHtml } from '../lib/emailService';

interface OrderSuccessPageProps {
  order: Order;
  onNavigateToTracking: (orderNumber: string, phone: string) => void;
  onContinueShopping: () => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order,
  onNavigateToTracking,
  onContinueShopping
}) => {
  const { language, t } = useLanguage();
  const { settings, sendCustomerOrderConfirmationEmail } = useStoreData();

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);

  // Email Confirmation State
  const [targetEmail, setTargetEmail] = useState(order.customerEmail || '');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    sent: boolean;
    recipient: string;
    message?: string;
  }>(() => {
    // If order already has email, it was automatically dispatched during checkout
    if (order.customerEmail && order.customerEmail.includes('@')) {
      return {
        sent: true,
        recipient: order.customerEmail,
        message: `Automated order summary email dispatched immediately to ${order.customerEmail}!`
      };
    }
    return {
      sent: false,
      recipient: '',
      message: undefined
    };
  });

  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti on order placement
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignored in sandbox
    }
  }, []);

  // Handle direct manual or resend of email confirmation
  const handleSendEmailConfirmation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetEmail || !targetEmail.includes('@')) return;

    setIsSendingEmail(true);
    try {
      const success = await sendCustomerOrderConfirmationEmail(order, targetEmail);
      if (success) {
        setEmailStatus({
          sent: true,
          recipient: targetEmail,
          message: `Order summary & confirmation receipt sent to ${targetEmail}!`
        });
      } else {
        setEmailStatus({
          sent: false,
          recipient: targetEmail,
          message: 'Could not send email right now. Please try again or contact WhatsApp support.'
        });
      }
    } catch (err) {
      console.error('Email dispatch error:', err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopyTrackingId = () => {
    try {
      navigator.clipboard.writeText(order.orderNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDirectPrintReceipt = () => {
    setIsInvoiceOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello SK Shop, I just placed order #${order.orderNumber} for ৳${order.total}. Could you please confirm the delivery schedule?`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Success Hero Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 text-center shadow-lg space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-widest rounded-full">
            Order Placed Successfully
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 mt-3">
            {t.orderSuccessTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto">
            {t.orderSuccessSub}
          </p>
        </div>

        {/* Order ID Banner with Copy Option */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-flex flex-col items-center mx-auto relative group">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
            Your Order Tracking ID
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tracking-wider">
              #{order.orderNumber}
            </span>
            <button
              onClick={handleCopyTrackingId}
              className="p-1.5 text-stone-400 hover:text-stone-800 transition rounded-lg hover:bg-stone-200/70"
              title="Copy Tracking ID"
            >
              {copiedTracking ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copiedTracking && (
            <span className="text-[10px] text-emerald-700 font-bold mt-1 animate-fade-in">
              Tracking ID Copied!
            </span>
          )}
        </div>

        {/* Action Buttons Row with Reprint Facility */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Tracking button */}
          <button
            onClick={() => onNavigateToTracking(order.orderNumber, order.customerPhone)}
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Track Order Status</span>
          </button>

          {/* Reprint Facility Button */}
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="px-5 py-3 bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-300 hover:border-stone-900 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
            title="Reprint order invoice or receipt"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Reprint Receipt / Invoice</span>
          </button>

          {/* Direct Print Button */}
          <button
            onClick={handleDirectPrintReceipt}
            className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Quick direct print to printer"
          >
            <FileText className="w-4 h-4 text-stone-500" />
            <span>Fast Print</span>
          </button>

          {/* WhatsApp Support button */}
          <a
            href={`https://wa.me/${(settings.whatsappNumber || '+8801781822686').replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>

      {/* ================= AUTOMATED EMAIL CONFIRMATION SERVICE CARD ================= */}
      <div className="bg-gradient-to-r from-amber-50/70 via-white to-amber-50/50 rounded-3xl border border-amber-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center shrink-0 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-sm">
                  Automated Email Confirmation Service
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Immediate order summary & digital VAT receipt dispatch to customer inbox.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowEmailPreviewModal(true)}
            className="self-start sm:self-auto text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 py-1.5 px-3 bg-amber-100/70 hover:bg-amber-200/80 rounded-xl transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Email Summary</span>
          </button>
        </div>

        {/* Dynamic Status / Email Input Box */}
        {emailStatus.sent ? (
          <div className="p-4 bg-white/90 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">
                  Confirmation Email Dispatched to: <span className="font-mono underline">{emailStatus.recipient}</span>
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Contains complete product breakdown, tracking link, and Cash on Delivery guarantee.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleSendEmailConfirmation()}
                disabled={isSendingEmail}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSendingEmail ? 'animate-spin' : ''}`} />
                <span>{isSendingEmail ? 'Sending...' : 'Resend Email'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendEmailConfirmation} className="p-4 bg-white/90 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-start gap-2 text-xs text-stone-700 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Want an instant order summary in your inbox? Enter your email address to receive immediate order confirmation:
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-stone-900 bg-stone-50"
              />
              <button
                type="submit"
                disabled={isSendingEmail}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingEmail ? 'Dispatching...' : 'Send Email Confirmation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Order Details Snapshot */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-base font-bold text-stone-900 uppercase tracking-wider">
            Delivery & Payment Summary
          </h3>
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Reprint Receipt</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-stone-600">
          <div className="space-y-1.5">
            <span className="font-bold text-stone-400 uppercase tracking-wider block">Delivering To:</span>
            <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
            <p className="flex items-center gap-1.5 text-stone-700">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>{order.customerPhone}</span>
            </p>
            <p className="flex items-start gap-1.5 text-stone-700">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>{order.deliveryAddress}, {order.upazila ? `${order.upazila}, ` : ''}{order.district}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-stone-400 uppercase tracking-wider block">Payment Information:</span>
            <p className="font-bold text-stone-900 text-sm capitalize">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : `${String(order.paymentMethod).toUpperCase()} Mobile Payment`}
            </p>
            <p className="text-stone-700">
              Payment Status: <span className="font-semibold text-emerald-700 uppercase">{order.paymentStatus}</span>
            </p>
            <div className="pt-2 flex items-center gap-2 text-stone-500">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>Estimated Delivery: {order.district.includes('Dhaka') ? '24 to 48 hours' : '48 to 72 hours'}</span>
            </div>
          </div>
        </div>

        {/* Ordered items breakdown */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
            Purchased Products ({order.items.length})
          </span>
          <div className="divide-y divide-stone-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-12 object-cover rounded-md bg-stone-100 shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-stone-900">{item.name}</p>
                    <p className="text-[11px] text-stone-400">
                      Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-stone-900 font-mono">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
            <span>Total Payable Amount (COD):</span>
            <span className="text-xl text-amber-700 font-mono">৳{order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onContinueShopping}
          className="text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-amber-700 transition cursor-pointer"
        >
          Continue Shopping with SK Shop →
        </button>
      </div>

      {/* Printable Invoice Modal (Reprint Facility) */}
      <AdminInvoiceModal
        order={order}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />

      {/* Email Confirmation Summary Preview Modal */}
      {showEmailPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Customer Order Confirmation Email Preview</h3>
              </div>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-stone-100">
              <div className="bg-white rounded-2xl shadow-xs overflow-hidden border border-stone-200">
                <div
                  dangerouslySetInnerHTML={{
                    __html: generateCustomerOrderEmailHtml(order, settings)
                  }}
                />
              </div>
            </div>
            <div className="p-4 bg-white border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEmailPreviewModal(false);
                  setIsInvoiceOpen(true);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Reprint Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
