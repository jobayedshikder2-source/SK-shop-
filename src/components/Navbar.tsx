import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  Globe, 
  Phone, 
  ShieldCheck, 
  LogOut, 
  Package, 
  Settings, 
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { Product, ProductCategory } from '../types';

interface NavbarProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  onNavigate: (page: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  onNavigate,
  onSelectProduct
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { currentUser, isAdmin, signInWithGoogle, signOut } = useAuth();
  const { products, settings } = useStoreData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const searchResults = searchQuery.trim()
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nameBn && p.nameBn.includes(searchQuery)) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchResultClick = (product: Product) => {
    onSelectProduct(product);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const categoriesList: { id: string; labelEn: string; labelBn: string; highlight?: boolean }[] = [
    { id: 'all', labelEn: 'All Collections', labelBn: 'সব কালেকশন' },
    { id: 'panjabi', labelEn: 'Panjabi & Ethnic', labelBn: 'পাঞ্জাবি ও এথনিক', highlight: true },
    { id: 'saree', labelEn: 'Sarees', labelBn: 'শাড়ি কালেকশন' },
    { id: 'men', labelEn: "Men's Wear", labelBn: 'পুরুষদের পোশাক' },
    { id: 'women', labelEn: "Women's Wear", labelBn: 'নারীদের পোশাক' },
    { id: 'kids', labelEn: "Kids' Collection", labelBn: 'বাচ্চাদের কালেকশন' },
    { id: 'accessories', labelEn: 'Accessories', labelBn: 'এক্সেসরিজ' },
    { id: 'sale', labelEn: 'Special Offers %', labelBn: 'অফার ও ছাড় %', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all">
      {/* 1. Top Announcement Bar */}
      {settings.announcementBarActive && (
        <div className="bg-stone-900 text-white text-[11px] sm:text-xs py-1.5 px-4 font-medium transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                {language === 'bn' && settings.announcementBarTextBn 
                  ? settings.announcementBarTextBn 
                  : settings.announcementBarText}
              </span>
            </div>

            <div className="flex items-center gap-4 shrink-0 pl-3">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 hover:text-amber-400 transition cursor-pointer text-[11px]"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="font-bold">{language === 'en' ? 'বাংলা' : 'English'}</span>
              </button>

              {/* Admin Portal Quick Link */}
              <button
                onClick={() => onNavigate('admin')}
                className="hidden sm:flex items-center gap-1 text-amber-300 hover:text-white transition cursor-pointer font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Admin Dashboard' : 'Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            className="cursor-pointer flex items-center gap-2.5 sm:gap-3 select-none group"
          >
            <img
              src="/assets/aistudio/file_0000000025048211bceee5b5025f840e_6a06dbdd.png"
              alt="SK Shop Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full shadow-sm group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 font-serif leading-none">
                SK<span className="text-sky-600">.</span>SHOP
              </span>
              <span className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold mt-0.5 hidden sm:block">
                Fashion for Everyone · Ashulia, Savar, Dhaka
              </span>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-lg mx-6 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Autocomplete Suggestions */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-fade-in">
                <div className="p-2 border-b border-stone-100 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Product Suggestions
                </div>
                <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                  {searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSearchResultClick(prod)}
                      className="p-3 flex items-center gap-3 hover:bg-stone-50 cursor-pointer transition"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-10 h-12 object-cover rounded-md bg-stone-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">
                          {language === 'bn' && prod.nameBn ? prod.nameBn : prod.name}
                        </p>
                        <p className="text-[11px] text-stone-500 uppercase">
                          {prod.category} · {prod.sku}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-stone-900">
                          ৳{(prod.discountedPrice || prod.regularPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Track Order link */}
            <button
              onClick={() => onNavigate('track')}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition px-2 py-1.5 rounded-lg hover:bg-stone-100"
            >
              <Package className="w-4 h-4 text-stone-500" />
              <span>{t.trackOrder}</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2.5 text-stone-700 hover:text-red-500 hover:bg-stone-100 rounded-full transition"
              title={t.wishlist}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2.5 bg-stone-900 text-white hover:bg-amber-600 rounded-full transition shadow-sm flex items-center gap-1.5 px-3.5 cursor-pointer"
              title="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold">{totalItemCount}</span>
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition border border-stone-200"
                title="Account Menu"
              >
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block pr-0.5" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  onClick={() => setIsUserMenuOpen(false)}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-100 py-2 z-50 animate-fade-in"
                >
                  {currentUser ? (
                    <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {currentUser.displayName || 'Customer'}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                          Store Administrator
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 border-b border-stone-100">
                      <button
                        onClick={signInWithGoogle}
                        className="w-full py-2 px-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition flex items-center justify-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'গুগল দিয়ে সাইন ইন' : 'Sign in with Google'}
                      </button>
                    </div>
                  )}

                  <div className="py-1">
                    <button
                      onClick={() => onNavigate('account')}
                      className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-stone-400" />
                      <span>{t.myAccount} & Orders</span>
                    </button>
                    <button
                      onClick={() => onNavigate('cart')}
                      className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-stone-400" />
                        <span>Shopping Bag / Cart</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                        {totalItemCount}
                      </span>
                    </button>
                    <button
                      onClick={() => onNavigate('track')}
                      className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <Package className="w-4 h-4 text-stone-400" />
                      <span>{t.trackOrder}</span>
                    </button>
                    <button
                      onClick={() => onNavigate('wishlist')}
                      className="w-full px-4 py-2 text-left text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-stone-400" />
                      <span>{t.wishlist} ({wishlist.length})</span>
                    </button>
                    
                    {isAdmin && (
                      <>
                        <div className="border-t border-stone-100 my-1"></div>
                        <button
                          onClick={() => onNavigate('admin')}
                          className="w-full px-4 py-2 text-left text-xs text-amber-800 hover:bg-amber-50 font-semibold flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <span>Admin Dashboard</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                      </>
                    )}

                    {currentUser && (
                      <button
                        onClick={signOut}
                        className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-stone-100"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Log Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar for Mobile */}
        <div className="mt-3 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-stone-200 bg-stone-50"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* 3. Category Horizontal Navigation Bar */}
      <nav className="border-t border-stone-100 bg-stone-50/70 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 sm:space-x-2 py-2">
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onNavigate('shop');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                currentCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : cat.highlight
                  ? 'text-amber-800 bg-amber-100/60 hover:bg-amber-100'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {language === 'bn' ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>
      </nav>

      {/* 4. Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/aistudio/file_0000000025048211bceee5b5025f840e_6a06dbdd.png"
                    alt="SK Shop Logo"
                    className="w-9 h-9 object-contain rounded-full shadow-xs"
                  />
                  <span className="text-xl font-extrabold font-serif">SK SHOP</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="py-4 space-y-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full py-2.5 px-3 text-left font-semibold text-stone-800 rounded-lg hover:bg-stone-100 text-sm"
                >
                  {t.home}
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onSelectCategory('all');
                    onNavigate('shop');
                  }}
                  className="w-full py-2.5 px-3 text-left font-semibold text-stone-800 rounded-lg hover:bg-stone-100 text-sm"
                >
                  {t.shop}
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('track');
                  }}
                  className="w-full py-2.5 px-3 text-left font-semibold text-stone-800 rounded-lg hover:bg-stone-100 text-sm flex items-center justify-between"
                >
                  <span>{t.trackOrder}</span>
                  <Package className="w-4 h-4 text-stone-400" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('cart');
                  }}
                  className="w-full py-2.5 px-3 text-left font-semibold text-stone-800 rounded-lg hover:bg-stone-100 text-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                    <span>{t.cart} / Bag</span>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold bg-stone-900 text-white rounded-full">
                    {totalItemCount}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('account');
                  }}
                  className="w-full py-2.5 px-3 text-left font-semibold text-stone-800 rounded-lg hover:bg-stone-100 text-sm"
                >
                  {t.myAccount}
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full py-2.5 px-3 text-left font-semibold text-amber-700 bg-amber-50 rounded-lg text-sm flex items-center justify-between"
                  >
                    <span>{t.adminDashboard}</span>
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="border-t border-stone-200 pt-4">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                  {t.categories}
                </h4>
                <div className="space-y-1">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSelectCategory(cat.id);
                        onNavigate('shop');
                      }}
                      className="w-full py-2 px-3 text-left text-xs font-medium text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-50"
                    >
                      {language === 'bn' ? cat.labelBn : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="border-t border-stone-200 pt-4 space-y-3">
              <button
                onClick={toggleLanguage}
                className="w-full py-2 text-xs font-semibold rounded-lg border border-stone-300 flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                <span>Switch to {language === 'en' ? 'বাংলা' : 'English'}</span>
              </button>
              <div className="text-[11px] text-stone-500 text-center">
                Need help? Hotline: <span className="font-bold text-stone-800">{settings.phone}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
