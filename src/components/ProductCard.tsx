import React from 'react';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { language, t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isFavorited = isInWishlist(product.id);
  const title = language === 'bn' && product.nameBn ? product.nameBn : product.name;
  const price = product.discountedPrice || product.regularPrice;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.regularPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((product.regularPrice - product.discountedPrice!) / product.regularPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.isAvailable || product.totalStock <= 0) return;
    const defaultSize = product.sizes[0] || 'Standard';
    const defaultColor = product.colors[0]?.name || 'Standard';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={title}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-red-600 text-white rounded-full shadow-sm">
              {discountPercent}% {t.discount}
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-amber-500 text-white rounded-full shadow-sm">
              BEST SELLER
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label="Toggle Wishlist"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 z-10 shadow-sm ${
            isFavorited 
              ? 'bg-red-50 text-red-500' 
              : 'bg-white/80 text-stone-600 hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
        </button>

        {/* Quick View overlay on desktop */}
        <div className="absolute inset-x-0 bottom-3 px-3 hidden group-hover:flex items-center justify-center gap-2 transition-all duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={!product.isAvailable || product.totalStock <= 0}
            className={`w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
              product.isAvailable && product.totalStock > 0
                ? 'bg-stone-900 text-white hover:bg-amber-600'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.isAvailable && product.totalStock > 0 ? t.addToCart : t.outOfStock}
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Color chips */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
            {product.subCategory || product.category}
          </span>
          {/* Color Dots */}
          <div className="flex items-center -space-x-1">
            {product.colors.slice(0, 3).map((col, idx) => (
              <span 
                key={idx} 
                className="w-3 h-3 rounded-full border border-white shadow-xs" 
                style={{ backgroundColor: col.hex }} 
                title={col.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[10px] text-stone-400 pl-1.5">+{product.colors.length - 3}</span>
            )}
          </div>
        </div>

        {/* Product Title */}
        <h3 className="font-medium text-stone-800 text-sm line-clamp-2 hover:text-amber-700 transition leading-snug mb-2">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2.5">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs font-semibold text-stone-700">{product.rating.toFixed(1)}</span>
          <span className="text-[11px] text-stone-400">({product.reviewCount})</span>
        </div>

        {/* Price & Stock status */}
        <div className="mt-auto pt-2 border-t border-stone-50 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-stone-900">
              ৳{price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">
                ৳{product.regularPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Mobile Quick Add Icon */}
          <button
            onClick={handleQuickAdd}
            disabled={!product.isAvailable || product.totalStock <= 0}
            className="md:hidden p-2 rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-900 hover:text-white transition"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
