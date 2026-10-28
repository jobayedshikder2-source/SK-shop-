import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  HelpCircle, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  MessageCircle 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useStoreData } from '../context/StoreDataContext';

interface PolicyPageProps {
  initialSection?: string;
  onContinueShopping: () => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ 
  initialSection = 'shipping', 
  onContinueShopping 
}) => {
  const { language } = useLanguage();
  const { settings } = useStoreData();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Cash on Delivery (COD) work at SK Shop?',
      a: 'We offer Cash on Delivery across all 64 districts in Bangladesh. You simply place your order without paying upfront, and hand the cash over to the courier delivery rider after inspecting your parcel package.'
    },
    {
      q: 'How long does delivery take inside and outside Dhaka?',
      a: 'Inside Dhaka City, orders are delivered within 24 to 48 hours. For all other districts and upazilas across Bangladesh, deliveries take 2 to 4 business days via our partner couriers (Steadfast, Pathao, RedX).'
    },
    {
      q: 'What is your 7-Day Exchange & Return policy?',
      a: 'If a size does not fit or if you wish to exchange a color/design, you can request an exchange within 7 days of parcel receipt. The item must be unused, unwashed, and in its original packaging with tags intact.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Cash on Delivery (COD) across all 64 districts in Bangladesh. You simply place your order with zero upfront payment and hand the cash over to the courier rider upon inspecting your parcel at your doorstep.'
    },
    {
      q: 'How do I qualify for Free Nationwide Shipping?',
      a: 'All orders with an item subtotal of ৳2,000 or above automatically receive 100% Free Nationwide Delivery anywhere in Bangladesh.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Policy Navigation Tabs */}
      <div className="flex border-b border-stone-200 overflow-x-auto space-x-2 pb-1">
        {[
          { id: 'shipping', label: 'Shipping & Delivery' },
          { id: 'return', label: '7-Day Return & Exchange' },
          { id: 'faq', label: 'FAQs' },
          { id: 'about', label: 'About SK Shop' },
          { id: 'contact', label: 'Contact Us' },
          { id: 'privacy', label: 'Privacy Policy' },
          { id: 'terms', label: 'Terms & Conditions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeSection === tab.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-xs text-stone-700 leading-relaxed text-sm">
        {/* Shipping & Delivery */}
        {activeSection === 'shipping' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-stone-900 border-b border-stone-100 pb-4">
              <Truck className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold font-serif">Shipping & Nationwide Delivery Policy</h2>
            </div>

            <p>
              At <strong>SK Shop Bangladesh</strong>, we pride ourselves on providing the fastest, safest, and most reliable doorstep delivery across all 64 districts in Bangladesh.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-1">
                  Inside Dhaka City Metro
                </h4>
                <p className="text-xs text-stone-600">Standard Delivery Charge: <strong>৳70</strong></p>
                <p className="text-xs text-stone-600">Estimated Delivery Time: <strong>24 to 48 Hours</strong></p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-1">
                  Outside Dhaka / All Districts
                </h4>
                <p className="text-xs text-stone-600">Standard Delivery Charge: <strong>৳130</strong></p>
                <p className="text-xs text-stone-600">Estimated Delivery Time: <strong>2 to 4 Business Days</strong></p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-semibold">
              🌟 <strong>Free Nationwide Shipping:</strong> Any order containing products valued at ৳2,000 or above qualifies for zero shipping charge automatically at checkout.
            </div>

            <h3 className="font-bold text-stone-900 text-base">Courier Partners & Real-Time Tracking</h3>
            <p>
              We partner with Bangladesh's premier logistics couriers including Steadfast Courier, RedX, and Pathao Courier. Each customer receives a unique parcel Waybill tracking ID via SMS upon dispatch.
            </p>
          </div>
        )}

        {/* Return & Refund */}
        {activeSection === 'return' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-stone-900 border-b border-stone-100 pb-4">
              <RefreshCw className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold font-serif">7-Day Easy Return & Exchange Policy</h2>
            </div>

            <p>
              We want you to love your purchase. If you are not completely satisfied with your clothing fit, color, or style, you may exchange or return it within <strong>7 calendar days</strong> from the date of delivery.
            </p>

            <div className="space-y-2 text-xs text-stone-600 list-disc pl-5">
              <li>Product must be unwashed, unworn, and with original tags and packaging intact.</li>
              <li>Size exchanges are processed free of service charges (nominal delivery re-dispatch applies outside Dhaka).</li>
              <li>Damaged or defective goods upon unboxing will be replaced immediately with zero extra fees.</li>
              <li>Refunds for digital transactions are credited back to your Nagad or bank account within 3-5 business days upon receiving the returned product.</li>
            </div>

            <p className="text-xs text-stone-500 pt-2">
              To initiate an exchange, simply message our support line on WhatsApp with your Order ID: <strong>{settings.phone}</strong>.
            </p>
          </div>
        )}

        {/* FAQs */}
        {activeSection === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-stone-900 border-b border-stone-100 pb-4">
              <HelpCircle className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold font-serif">Frequently Asked Questions (FAQ)</h2>
            </div>

            <div className="divide-y divide-stone-200">
              {faqs.map((faq, index) => (
                <div key={index} className="py-4">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between text-left font-bold text-stone-900 text-sm hover:text-amber-700 transition"
                  >
                    <span>{faq.q}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <p className="mt-2 text-xs text-stone-600 leading-relaxed animate-fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Us */}
        {activeSection === 'about' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-stone-900 border-b border-stone-100 pb-4">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold font-serif">About SK Shop Bangladesh</h2>
            </div>

            <p>
              Founded in Dhaka, <strong>SK Shop</strong> represents the finest intersection of traditional Bangladeshi textile artistry and contemporary tailored silhouettes. From our signature embroidered semi-silk Panjabis and authentic Dhakai Jamdanis to modern breathable cotton shirts, polos, and stretch denim, every product is crafted to elevate your style.
            </p>

            <p>
              We source only natural fibers, combed cottons, and genuine mulberry silks, supporting traditional weavers and local artisans in Narayanganj, Tangail, and Dhaka.
            </p>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600">
              📍 <strong>Flagship Studio:</strong> {settings.address}
            </div>
          </div>
        )}

        {/* Contact Us */}
        {activeSection === 'contact' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-stone-900 border-b border-stone-100 pb-4">
              <Phone className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold font-serif">Customer Care & Support</h2>
            </div>

            <p>
              Our customer happiness team is available everyday from 9:00 AM to 10:00 PM (BST) to assist you with order status, styling suggestions, or custom measurements.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <Phone className="w-5 h-5 text-amber-600 mb-1" />
                <span className="font-bold text-stone-900 block">Phone Support</span>
                <p className="text-stone-600">{settings.phone}</p>
              </div>

              <a 
                href={`mailto:${settings.email || 'skshopsaport@gmail.com'}`}
                className="p-4 bg-stone-50 hover:bg-stone-100/80 rounded-2xl border border-stone-200 space-y-1 block transition cursor-pointer"
              >
                <Mail className="w-5 h-5 text-amber-600 mb-1" />
                <span className="font-bold text-stone-900 block">Email Inquiries</span>
                <p className="text-stone-600 truncate">{settings.email || 'skshopsaport@gmail.com'}</p>
              </a>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <MessageCircle className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="font-bold text-stone-900 block">WhatsApp Chat</span>
                <p className="text-stone-600">{settings.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        {activeSection === 'privacy' && (
          <div className="space-y-6 text-xs text-stone-600 leading-relaxed">
            <div className="flex items-center gap-3 text-stone-900 border-b border-stone-100 pb-4">
              <FileText className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold font-serif">Privacy Policy</h2>
            </div>

            <p>
              Your privacy is of utmost importance to SK Shop. We collect personal identification details such as your full name, phone number, and physical delivery address solely for fulfilling orders, dispatching couriers, and sending confirmation SMS.
            </p>
            <p>
              We do not sell, rent, or trade your personal data to any external advertising parties. All order database records are encrypted and secured with Firebase ABAC security rules.
            </p>
          </div>
        )}

        {/* Terms & Conditions */}
        {activeSection === 'terms' && (
          <div className="space-y-6 text-xs text-stone-600 leading-relaxed">
            <div className="flex items-center gap-3 text-stone-900 border-b border-stone-100 pb-4">
              <FileText className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold font-serif">Terms & Conditions of Service</h2>
            </div>

            <p>
              By browsing and placing orders on SK Shop, you agree to our terms of service. All prices are listed in Bangladeshi Taka (BDT ৳) and are inclusive of standard applicable merchant taxes.
            </p>
            <p>
              SK Shop reserves the right to verify order legitimacy via phone call or SMS before dispatching Cash on Delivery parcels. Fraudulent or repeated unaccepted parcel deliveries may lead to blacklisting.
            </p>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={onContinueShopping}
          className="text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-amber-700 transition"
        >
          Return to SK Shop Catalog →
        </button>
      </div>
    </div>
  );
};
