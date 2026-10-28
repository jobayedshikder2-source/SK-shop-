import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Star, 
  Clock, 
  Flame, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Quote
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useStoreData } from '../context/StoreDataContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface HomePageProps {
  onSelectCategory: (category: string) => void;
  onNavigate: (page: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectCategory,
  onNavigate,
  onSelectProduct
}) => {
  const { language, t } = useLanguage();
  const { products, banners } = useStoreData();
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  // Flash Sale Countdown Timer (Simulated 24-hour cycle)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Banner carousel auto rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanner = banners[currentBannerIdx] || banners[0];

  const newArrivals = products.slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const flashSaleProducts = products.filter(p => p.isSale).slice(0, 4);

  const featuredCategories = [
    {
      id: 'panjabi',
      nameEn: 'Panjabi & Ethnic',
      nameBn: 'পাঞ্জাবি ও এথনিক',
      itemsCount: '28+ Designs',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80',
      badge: 'TOP SELLER'
    },
    {
      id: 'saree',
      nameEn: 'Handloom Sarees',
      nameBn: 'তাঁতের জামদানি ও সিল্ক শাড়ি',
      itemsCount: '19+ Designs',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80',
      badge: 'HERITAGE'
    },
    {
      id: 'men',
      nameEn: "Men's Casual & Formal",
      nameBn: 'কটন শার্ট ও পোলো টি-শার্ট',
      itemsCount: '45+ Designs',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
      badge: '100% COTTON'
    },
    {
      id: 'women',
      nameEn: "Women's 3-Piece & Kurtis",
      nameBn: 'থ্রি-পিস ও ডিজাইনার কুর্তি',
      itemsCount: '32+ Designs',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
      badge: 'ELEGANT'
    }
  ];

  const testimonials = [
    {
      name: 'Tanvir Hossain',
      location: 'Dhanmondi, Dhaka',
      rating: 5,
      comment: 'Ordered the Royal Navy Semi-Silk Panjabi for Eid. The embroidery work on collar and fabric quality is absolutely top notch. Delivered within 24 hours in Dhaka!',
      date: '2 days ago'
    },
    {
      name: 'Nusrat Jahan',
      location: 'Nasirabad, Chattogram',
      rating: 5,
      comment: 'The Dhakai Jamdani Saree is authentic 84 count cotton with intricate floral weave. Packaged very carefully in a luxury box with Cash on Delivery.',
      date: '1 week ago'
    },
    {
      name: 'Dr. Rafiqul Islam',
      location: 'Sylhet Sadar',
      rating: 5,
      comment: 'The Egyptian cotton oxford shirts fit true to size. High comfort in warm weather and zero shrinkage after wash. SK Shop is now my favorite brand.',
      date: '2 weeks ago'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Banner Carousel */}
      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div className="relative min-h-[500px] sm:min-h-[600px] lg:min-h-[640px] flex items-center">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={activeBanner?.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80'}
              alt={activeBanner?.title || 'SK Shop Banner'}
              className="w-full h-full object-cover object-center brightness-60 transition-all duration-1000 transform scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent" />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="max-w-2xl space-y-6">
              {activeBanner?.badge && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeBanner.badge}</span>
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight text-white leading-tight">
                {language === 'bn' && activeBanner?.titleBn 
                  ? activeBanner.titleBn 
                  : activeBanner?.title || t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-stone-200 leading-relaxed max-w-xl">
                {language === 'bn' && activeBanner?.subtitleBn 
                  ? activeBanner.subtitleBn 
                  : activeBanner?.subtitle || t.heroSubtitle}
              </p>

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <button
                  onClick={() => {
                    onSelectCategory('all');
                    onNavigate('shop');
                  }}
                  className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition shadow-lg hover:shadow-amber-600/30 flex items-center gap-2.5 transform hover:-translate-y-0.5"
                >
                  <span>{t.shopNow}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onSelectCategory('panjabi');
                    onNavigate('shop');
                  }}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-bold text-sm uppercase tracking-wider rounded-xl transition"
                >
                  {t.panjabi}
                </button>
              </div>

              {/* Delivery highlight */}
              <div className="pt-6 border-t border-white/10 flex items-center gap-6 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Cash on Delivery in 64 Districts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Free Delivery above ৳2,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Arrows */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 flex gap-2">
              <button
                onClick={() => setCurrentBannerIdx(prev => (prev - 1 + banners.length) % banners.length)}
                className="p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentBannerIdx(prev => (prev + 1) % banners.length)}
                className="p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. Flash Sale with Countdown Timer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-red-600 rounded-2xl text-white shadow-lg animate-pulse">
              <Flame className="w-8 h-8 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-amber-500 text-stone-900 rounded-full">
                  LIMITED TIME OFFER
                </span>
                <span className="text-xs text-amber-200">Up to 30% Off</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                {language === 'bn' ? 'ফ্ল্যাশ সেল অফার' : 'Seasonal Flash Sale'}
              </h2>
            </div>
          </div>

          {/* Timer Boxes */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-stone-800/90 rounded-2xl border border-stone-700 flex items-center justify-center text-xl font-extrabold text-amber-400">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-[10px] uppercase font-bold text-stone-400 mt-1">Hours</span>
            </div>
            <span className="text-2xl font-bold text-stone-500 -mt-4">:</span>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-stone-800/90 rounded-2xl border border-stone-700 flex items-center justify-center text-xl font-extrabold text-amber-400">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-[10px] uppercase font-bold text-stone-400 mt-1">Mins</span>
            </div>
            <span className="text-2xl font-bold text-stone-500 -mt-4">:</span>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-stone-800/90 rounded-2xl border border-stone-700 flex items-center justify-center text-xl font-extrabold text-amber-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="text-[10px] uppercase font-bold text-stone-400 mt-1">Secs</span>
            </div>
          </div>

          <button
            onClick={() => {
              onSelectCategory('sale');
              onNavigate('shop');
            }}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md whitespace-nowrap"
          >
            {language === 'bn' ? 'সব সেল দেখুন' : 'View All Deals'}
          </button>
        </div>

        {/* Flash Sale Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {flashSaleProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 3. Featured Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              {t.featuredCollection}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 mt-1">
              {language === 'bn' ? 'জনপ্রিয় ক্যাটাগরি' : 'Curated Categories'}
            </h2>
          </div>
          <button
            onClick={() => {
              onSelectCategory('all');
              onNavigate('shop');
            }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-amber-600 transition"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onNavigate('shop');
              }}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={cat.image}
                alt={cat.nameEn}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />
              
              <div className="absolute top-4 left-4">
                <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full">
                  {cat.badge}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <p className="text-xs text-amber-300 font-medium">{cat.itemsCount}</p>
                <h3 className="text-xl font-bold font-serif leading-snug">
                  {language === 'bn' ? cat.nameBn : cat.nameEn}
                </h3>
                <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-white/90 group-hover:text-amber-400 transition">
                  <span>Explore Now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Best Sellers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              {t.trendingNow}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 mt-1">
              {t.bestSellers}
            </h2>
          </div>
          <button
            onClick={() => {
              onSelectCategory('all');
              onNavigate('shop');
            }}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-amber-600 transition"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 5. Editorial / Brand Campaign Feature */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-white grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
            <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
              CRAFTSMANSHIP & HERITAGE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif leading-tight">
              {language === 'bn' 
                ? 'ঐতিহ্যবাহী তাঁতের জাদু ও নিখুঁত কারুকাজ'
                : 'Bengal Weaves: Where Heritage Meets Modern Silhouettes'}
            </h2>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              {language === 'bn'
                ? 'এসকে শপ প্রতিটি পোশাকে নিশ্চিত করে সেরা সুতা ও আভিজাত্য। ঈদ ও উৎসবের আনন্দকে আরও দ্বিগুণ করতে আমাদের পাঞ্জাবি ও শাড়ি কালেকশন তৈরি করা হয়েছে পরম মমতায়।'
                : 'Every thread in our Panjabis, Jamdanis, and tailored shirts is spun from selected long-staple cotton and fine mulberry silks. Handcrafted by generational artisans in Narayanganj and Dhaka.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  onSelectCategory('panjabi');
                  onNavigate('shop');
                }}
                className="px-8 py-3.5 bg-white text-stone-900 hover:bg-stone-100 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg"
              >
                {language === 'bn' ? 'পাঞ্জাবি কালেকশন দেখুন' : 'Explore Panjabi & Sarees'}
              </button>
            </div>
          </div>
          <div className="relative min-h-[340px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
              alt="Artisan Craftsmanship"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            TESTIMONIALS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 mt-1">
            {language === 'bn' ? 'আমাদের সম্মানিত গ্রাহকদের মতামত' : 'Loved by 10,000+ Customers Across Bangladesh'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((review, idx) => (
            <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-stone-200 mb-2" />
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{review.name}</h4>
                  <p className="text-[11px] text-stone-400">{review.location}</p>
                </div>
                <span className="text-[10px] text-stone-400">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
