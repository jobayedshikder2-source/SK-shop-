import React, { useState, useEffect } from 'react';
import { X, Printer, Download, CheckCircle2, Mail, Send, Check } from 'lucide-react';
import { Order } from '../types';
import { useStoreData } from '../context/StoreDataContext';

interface AdminInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminInvoiceModal: React.FC<AdminInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const { settings, sendCustomerOrderConfirmationEmail } = useStoreData();
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (order?.customerEmail) {
      setEmailInput(order.customerEmail);
    }
  }, [order?.customerEmail]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmailCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    setIsSending(true);
    try {
      const ok = await sendCustomerOrderConfirmationEmail(order, emailInput);
      if (ok) {
        setEmailStatus(`Invoice emailed to ${emailInput}!`);
        setTimeout(() => {
          setEmailStatus(null);
          setShowEmailPrompt(false);
        }, 3000);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none">
        {/* Action Header - hidden when printing */}
        <div className="px-6 py-4 bg-stone-900 text-white print:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider">
                  Invoice & Reprint Facility
                </h3>
                <span className="text-[10px] text-stone-400 block font-mono">Order: #{order.orderNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmailPrompt(!showEmailPrompt)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Email this invoice copy to customer"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Email Copy</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                title="Reprint / Print official document"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Reprint / Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1 text-stone-400 hover:text-white rounded-lg ml-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Email dispatch bar if opened */}
          {showEmailPrompt && (
            <form onSubmit={handleSendEmailCopy} className="p-2.5 bg-stone-850 rounded-xl border border-stone-700 flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs animate-fade-in">
              <span className="text-stone-300 font-semibold shrink-0">Send copy to:</span>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="customer@gmail.com"
                className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-700 text-white rounded-lg text-xs focus:outline-hidden focus:border-amber-400"
                required
              />
              <button
                type="submit"
                disabled={isSending}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>{isSending ? 'Sending...' : 'Dispatch'}</span>
              </button>
              {emailStatus && (
                <span className="text-[11px] text-emerald-400 font-bold ml-2">
                  {emailStatus}
                </span>
              )}
            </form>
          )}
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-10 space-y-8 text-stone-800 bg-white" id="printable-invoice">
          {/* Header Row */}
          <div className="flex justify-between items-start border-b border-stone-200 pb-6">
            <div className="flex items-center gap-3.5">
              <img
                src="/assets/aistudio/file_0000000025048211bceee5b5025f840e_6a06dbdd.png"
                alt="SK Shop Logo"
                className="w-14 h-14 object-contain rounded-full shadow-xs"
              />
              <div>
                <h1 className="text-3xl font-extrabold font-serif tracking-tight text-stone-900 leading-none">
                  SK<span className="text-sky-600">.</span>SHOP
                </h1>
                <p className="text-xs text-stone-500 font-medium mt-1">
                  {settings.tagline || 'Fashion for Everyone - Ashulia, Savar, Dhaka'}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{settings.address}</p>
                <p className="text-xs text-stone-500">Hotline: {settings.phone} | {settings.email}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-stone-100 text-stone-800 text-xs font-bold uppercase rounded-md tracking-wider mb-2">
                RETAIL INVOICE
              </span>
              <p className="text-sm font-extrabold text-stone-900 font-mono">#{order.orderNumber}</p>
              <p className="text-xs text-stone-500 mt-1">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-xs font-semibold text-stone-700 capitalize mt-0.5">
                Status: {order.orderStatus.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Bill To & Ship To */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Customer & Delivery Details:
              </span>
              <p className="font-bold text-sm text-stone-900">{order.customerName}</p>
              <p className="text-stone-700 font-medium">Phone: {order.customerPhone}</p>
              {order.customerEmail && <p className="text-stone-600">Email: {order.customerEmail}</p>}
              <p className="text-stone-700 leading-relaxed mt-1">
                {order.deliveryAddress}, {order.upazila ? `${order.upazila}, ` : ''}{order.district}
              </p>
            </div>

            <div className="space-y-1 text-right">
              <span className="font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Payment Info:
              </span>
              <p className="font-bold text-stone-900 capitalize">
                Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : String(order.paymentMethod).toUpperCase()}
              </p>
              <p className="text-stone-600">
                Payment Status: <span className="font-semibold text-emerald-700 uppercase">{order.paymentStatus}</span>
              </p>
              {order.paymentTrxId && (
                <p className="text-stone-600 font-mono">TrxID: {order.paymentTrxId}</p>
              )}
              {order.courierName && (
                <p className="text-stone-600 mt-2 font-medium">
                  Courier: {order.courierName} ({order.courierTrackingCode || 'Pending Tracking'})
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border-b border-stone-200">
              <thead>
                <tr className="bg-stone-100 text-stone-800 font-bold uppercase tracking-wider border-y border-stone-200">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Color</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-semibold text-stone-900">
                      {item.name}
                      <span className="block text-[10px] text-stone-400 font-mono">SKU: {item.sku}</span>
                    </td>
                    <td className="py-3 px-3 text-stone-600">{item.size}</td>
                    <td className="py-3 px-3 text-stone-600">{item.color}</td>
                    <td className="py-3 px-3 text-center font-bold text-stone-800">{item.quantity}</td>
                    <td className="py-3 px-3 text-right text-stone-600">৳{item.price.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold text-stone-900">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Calculation */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-stone-900">৳{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({order.couponCode || 'Coupon'}):</span>
                  <span className="font-semibold">-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-stone-900">
                  {order.shippingFee === 0 ? 'FREE' : `৳${order.shippingFee}`}
                </span>
              </div>
              <div className="pt-2 border-t-2 border-stone-800 flex justify-between text-sm font-bold text-stone-900">
                <span>Total Payable:</span>
                <span className="text-base text-amber-700">৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-stone-200 pt-6 text-[11px] text-stone-500 text-center space-y-1">
            <p className="font-semibold text-stone-700">Thank you for choosing SK Shop Bangladesh!</p>
            <p>For any return or size exchange inquiries within 7 days, please contact WhatsApp: {settings.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
