import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Check, 
  X, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useStoreData } from '../context/StoreDataContext';
import { ProductCard } from '../components/ProductCard';
import { Product, ProductCategory } from '../types';

interface ShopPageProps {
  initialCategory: string;
  onSelectProduct: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialCategory, onSelectProduct }) => {
  const { language, t } = useLanguage();
  const { products } = useStoreData();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(7000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Available Sizes across products
  const allSizes = ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38'];

  const categoryOptions = [
    { id: 'all', labelEn: 'All Categories', labelBn: 'সব ক্যাটাগরি' },
    { id: 'panjabi', labelEn: 'Panjabi & Ethnic', labelBn: 'পাঞ্জাবি ও এথনিক' },
    { id: 'saree', labelEn: 'Sarees', labelBn: 'শাড়ি কালেকশন' },
    { id: 'men', labelEn: "Men's Clothing", labelBn: 'পুরুষদের পোশাক' },
    { id: 'women', labelEn: "Women's Clothing", labelBn: 'নারীদের পোশাক' },
    { id: 'kids', labelEn: "Kids' Collection", labelBn: 'বাচ্চাদের কালেকশন' },
    { id: 'accessories', labelEn: 'Accessories', labelBn: 'এক্সেসরিজ' },
    { id: 'sale', labelEn: 'Discounted / Sale', labelBn: 'ছাড় ও অফার' },
  ];

  const handleToggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setMaxPrice(7000);
    setSelectedSizes([]);
    setInStockOnly(false);
    setSortBy('featured');
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory === 'sale') {
        if (!product.isSale) return false;
      } else if (selectedCategory !== 'all') {
        if (product.category !== selectedCategory) return false;
      }

      // Price filter
      const activePrice = product.discountedPrice || product.regularPrice;
      if (activePrice > maxPrice) return false;

      // In Stock filter
      if (inStockOnly && (!product.isAvailable || product.totalStock <= 0)) return false;

      // Size filter
      if (selectedSizes.length > 0) {
        const hasMatchingSize = product.sizes.some(size => 
          selectedSizes.some(selected => size.toLowerCase().includes(selected.toLowerCase()))
        );
        if (!hasMatchingSize) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountedPrice || a.regularPrice;
      const priceB = b.discountedPrice || b.regularPrice;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [products, selectedCategory, maxPrice, selectedSizes, inStockOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 font-bold">
            SK Shop Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 mt-1">
            {language === 'bn' 
              ? categoryOptions.find(c => c.id === selectedCategory)?.labelBn 
              : categoryOptions.find(c => c.id === selectedCategory)?.labelEn}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Showing {filteredProducts.length} premium fashion products
          </p>
        </div>

        {/* Sorting & Mobile Filter trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-white text-stone-800 flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-stone-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-stone-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
            >
              <option value="featured">Sort by: Featured & Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">Filters</h3>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs text-stone-400 hover:text-stone-900 font-semibold transition"
            >
              Reset
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">Category</h4>
            <div className="space-y-1.5">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full px-3 py-2 text-left text-xs rounded-xl transition flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>{language === 'bn' ? cat.labelBn : cat.labelEn}</span>
                  {selectedCategory === cat.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Max Price</h4>
              <span className="text-xs font-bold text-amber-700">৳{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={800}
              max={7000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>৳800</span>
              <span>৳7,000+</span>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">Sizes</h4>
            <div className="flex flex-wrap gap-1.5">
              {allSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleToggleSize(size)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                    selectedSizes.includes(size)
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded-sm border-stone-300 text-stone-900 focus:ring-stone-900 accent-stone-900"
              />
              <span>In Stock Items Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-1">No products found</h3>
              <p className="text-xs text-stone-500 mb-6 max-w-sm mx-auto">
                No products match your selected filters. Try loosening your price or size criteria.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">Filters</h3>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold uppercase text-stone-700 mb-2">Category</h4>
                <div className="space-y-1">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full px-3 py-2 text-left text-xs rounded-lg ${
                        selectedCategory === cat.id
                          ? 'bg-stone-900 text-white font-semibold'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {language === 'bn' ? cat.labelBn : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold uppercase text-stone-700">Max Price</h4>
                  <span className="text-xs font-bold text-amber-700">৳{maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={800}
                  max={7000}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-xs font-bold uppercase text-stone-700 mb-2">Sizes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleToggleSize(size)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                        selectedSizes.includes(size)
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 flex gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-stone-300 text-stone-700"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold bg-stone-900 text-white rounded-xl"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
