import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  CreditCard 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useStoreData } from '../context/StoreDataContext';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  onNavigate: (page: string) => void;
  onSelectCategory: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  const { language, t } = useLanguage();
  const { settings } = useStoreData();
  const { isAdmin } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 border-t border-stone-800">
      {/* 1. Value Badges Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-stone-800 text-amber-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.nationwideDelivery}</h4>
              <p className="text-xs text-stone-400 mt-0.5">{t.nationwideDeliverySub}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-stone-800 text-amber-400 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.codAvailable}</h4>
              <p className="text-xs text-stone-400 mt-0.5">{t.codAvailableSub}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-stone-800 text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.premiumQuality}</h4>
              <p className="text-xs text-stone-400 mt-0.5">{t.premiumQualitySub}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-stone-800 text-amber-400 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.easyReturn}</h4>
              <p className="text-xs text-stone-400 mt-0.5">{t.easyReturnSub}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Contact */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
              <img
                src="/assets/aistudio/file_0000000025048211bceee5b5025f840e_6a06dbdd.png"
                alt="SK Shop Logo"
                className="w-12 h-12 object-contain rounded-full shadow-md bg-stone-900 border border-stone-800"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-white font-serif leading-none">
                  SK<span className="text-sky-400">.</span>SHOP
                </span>
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mt-1">
                  Fashion for Everyone
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              {t.aboutText}
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-stone-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Hotline: {settings.phone}</span>
              </div>
              <a 
                href={`mailto:${settings.email || 'skshopsaport@gmail.com'}`}
                className="flex items-center gap-2.5 hover:text-amber-400 transition"
              >
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Email: {settings.email || 'skshopsaport@gmail.com'}</span>
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t.categories}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button 
                  onClick={() => { onSelectCategory('panjabi'); onNavigate('shop'); }}
                  className="hover:text-amber-400 transition"
                >
                  {t.panjabi}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectCategory('saree'); onNavigate('shop'); }}
                  className="hover:text-amber-400 transition"
                >
                  {t.saree}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectCategory('men'); onNavigate('shop'); }}
                  className="hover:text-amber-400 transition"
                >
                  {t.men}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectCategory('women'); onNavigate('shop'); }}
                  className="hover:text-amber-400 transition"
                >
                  {t.women}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectCategory('kids'); onNavigate('shop'); }}
                  className="hover:text-amber-400 transition"
                >
                  {t.kids}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onSelectCategory('accessories'); onNavigate('shop'); }}
                  className="hover:text-amber-400 transition"
                >
                  {t.accessories}
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t.customerService}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('track')} className="hover:text-amber-400 transition">
                  {t.trackOrder}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy-shipping')} className="hover:text-amber-400 transition">
                  {t.shippingPolicy}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy-return')} className="hover:text-amber-400 transition">
                  {t.returnPolicy}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy-faq')} className="hover:text-amber-400 transition">
                  {t.faqs}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy-privacy')} className="hover:text-amber-400 transition">
                  {t.privacyPolicy}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy-terms')} className="hover:text-amber-400 transition">
                  {t.termsConditions}
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t.newsletter}
            </h4>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              {t.newsletterSub}
            </p>
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 bg-stone-800 text-emerald-400 text-xs rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t.subscribedMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-500 transition"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.subscribe}</span>
                </button>
              </form>
            )}

            {/* Payment Partners Badge */}
            <div className="pt-6">
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-2">
                Supported Payment Methods
              </p>
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-700 text-white rounded-md">Cash on Delivery</span>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-700 text-white rounded-md">Visa / Mastercard</span>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-stone-700 text-white rounded-md">Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
        <p>© 2026 {settings.storeName}. {t.allRightsReserved}</p>
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate('policy-privacy')} className="hover:text-stone-300 transition">
            Privacy Policy
          </button>
          <button onClick={() => onNavigate('policy-terms')} className="hover:text-stone-300 transition">
            Terms of Service
          </button>
          {isAdmin && (
            <button onClick={() => onNavigate('admin')} className="hover:text-amber-400 transition font-semibold">
              Admin Portal
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
