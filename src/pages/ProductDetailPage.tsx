import React, { useState } from 'react';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Ruler, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  ArrowLeft,
  Share2,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useStoreData } from '../context/StoreDataContext';
import { ProductCard } from '../components/ProductCard';
import { SizeChartModal } from '../components/SizeChartModal';
import { Product, Review } from '../types';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToCheckout: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onSelectProduct,
  onNavigateToCheckout
}) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { products } = useStoreData();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'shipping' | 'reviews'>('details');

  // Customer Reviews state
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      productId: product.id,
      userName: 'Arman Habib',
      rating: 5,
      comment: 'Super fast delivery in Gulshan. The cloth texture and stitching on the collar exceeded my expectations.',
      createdAt: '2026-10-12T14:30:00Z',
      isVerifiedPurchase: true
    },
    {
      id: 'rev-2',
      productId: product.id,
      userName: 'Shaila Parveen',
      rating: 5,
      comment: 'Color is exactly identical to the photographs. Great drape and very comfortable.',
      createdAt: '2026-10-14T09:15:00Z',
      isVerifiedPurchase: true
    }
  ]);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const title = language === 'bn' && product.nameBn ? product.nameBn : product.name;
  const description = language === 'bn' && product.descriptionBn ? product.descriptionBn : product.description;
  const price = product.discountedPrice || product.regularPrice;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.regularPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((product.regularPrice - product.discountedPrice!) / product.regularPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product.isAvailable || product.totalStock <= 0) return;
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    if (!product.isAvailable || product.totalStock <= 0) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    onNavigateToCheckout();
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      userName: newReviewerName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      createdAt: new Date().toISOString(),
      isVerifiedPurchase: true
    };

    setReviews(prev => [newRev, ...prev]);
    setNewReviewerName('');
    setNewReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  // Related products in same category
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to collection</span>
      </button>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Gallery */}
        <div className="space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[3/4] bg-stone-100 rounded-3xl overflow-hidden border border-stone-200 shadow-sm">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={title}
              className="w-full h-full object-cover object-top transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold tracking-wider uppercase bg-red-600 text-white rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition ${
                isFavorited ? 'bg-red-50 text-red-500' : 'bg-white/80 text-stone-700 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    activeImageIdx === idx ? 'border-amber-600 shadow-md' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Buy Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                {product.subCategory || product.category}
              </span>
              <span className="text-xs text-stone-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-stone-900 leading-tight">
              {title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-stone-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-stone-400">({product.reviewCount} verified reviews)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-stone-900">
                ৳{price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base text-stone-400 line-through">
                  ৳{product.regularPrice.toLocaleString()}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Save ৳{(product.regularPrice - product.discountedPrice!).toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Meter */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${product.totalStock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {product.totalStock > 0 ? (
              <span className="font-semibold text-emerald-800">
                In Stock ({product.totalStock} units available)
              </span>
            ) : (
              <span className="font-semibold text-red-600">Currently Sold Out</span>
            )}
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              Select Color: <span className="text-stone-900">{selectedColor}</span>
            </label>
            <div className="flex gap-2.5">
              {product.colors.map((col) => (
                <button
                  key={col.name}
                  onClick={() => setSelectedColor(col.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                    selectedColor === col.name
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: col.hex }} />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector + Size Guide */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Select Size: <span className="text-stone-900">{selectedSize}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 underline cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>{t.sizeChart}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] py-2.5 px-4 rounded-xl border text-xs font-bold transition ${
                    selectedSize === size
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50 w-32">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 py-2 text-stone-600 hover:bg-stone-200 transition font-bold"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold text-sm text-stone-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.totalStock || 10, quantity + 1))}
                className="w-10 py-2 text-stone-600 hover:bg-stone-200 transition font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable || product.totalStock <= 0}
              className={`py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border shadow-sm transition ${
                product.isAvailable && product.totalStock > 0
                  ? 'bg-stone-900 text-white hover:bg-stone-800 border-stone-900'
                  : 'bg-stone-200 text-stone-400 border-stone-200 cursor-not-allowed'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.addToCart}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!product.isAvailable || product.totalStock <= 0}
              className={`py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition ${
                product.isAvailable && product.totalStock > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.buyNow}</span>
            </button>
          </div>

          {/* Highlights & Delivery Features */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-4 text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Inside Dhaka 24-48h | Outside 2-4 Days</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>100% Original Authentic Quality</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>7 Days Easy Return & Exchange</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cash on Delivery in 64 Districts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Tabs (Details, Fabric & Care, Delivery, Reviews) */}
      <div className="border-t border-stone-200 pt-8">
        <div className="flex border-b border-stone-200 space-x-6">
          {[
            { id: 'details', label: 'Product Details' },
            { id: 'fabric', label: 'Fabric & Specifications' },
            { id: 'shipping', label: 'Delivery & Returns' },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-amber-600 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-6 text-sm text-stone-700 leading-relaxed max-w-3xl">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <p>{description}</p>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="grid grid-cols-2">
                  <span className="font-semibold text-stone-500">Category:</span>
                  <span className="text-stone-900 font-medium capitalize">{product.category}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold text-stone-500">Silhouette:</span>
                  <span className="text-stone-900 font-medium">Regular to Semi-Slim Comfort</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-semibold text-stone-500">Country of Origin:</span>
                  <span className="text-stone-900 font-medium">Bangladesh 🇧🇩</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fabric' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-stone-900 mb-1">Fabric Composition</h4>
                <p>{product.fabricInfo || '100% Premium Egyptian Combed Cotton & Natural Mulberry Silk blend.'}</p>
              </div>
              <div>
                <h4 className="font-bold text-stone-900 mb-1">Care & Washing Guidelines</h4>
                <p>{product.careInstructions || 'Dry clean recommended. Alternatively, hand wash in cold water with gentle detergent. Avoid bleaching and direct scorching sun.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <p>We deliver nationwide across all 64 districts in Bangladesh with reliable parcel tracking.</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600">
                <li><strong>Dhaka Metro:</strong> Delivery within 24 to 48 hours (৳70).</li>
                <li><strong>Outside Dhaka (Suburbs & Districts):</strong> Delivery within 2 to 4 business days (৳130).</li>
                <li><strong>Free Shipping:</strong> Automatically applied to orders with subtotal ৳2,000 and above!</li>
                <li><strong>Cash on Delivery (COD):</strong> Available nationwide. You can inspect the package upon arrival.</li>
                <li><strong>Exchange:</strong> Free exchange if sizing does not fit within 7 calendar days.</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Existing Reviews */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900">{rev.userName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-amber-500 mb-2">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-stone-600">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {/* Add a Review Form */}
              <div className="p-6 bg-white rounded-2xl border border-stone-200">
                <h4 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>Write a Customer Review</span>
                </h4>

                {reviewSubmitted && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl mb-4">
                    Thank you! Your verified review has been published.
                  </div>
                )}

                <form onSubmit={handleAddReview} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={newReviewerName}
                        onChange={(e) => setNewReviewerName(e.target.value)}
                        placeholder="e.g. Asif Ahmed"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Rating</label>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                      >
                        <option value={5}>5 Stars - Outstanding</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Average</option>
                        <option value={2}>2 Stars - Below Expectations</option>
                        <option value={1}>1 Star - Poor</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Your Experience</label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Comment on the fabric quality, stitching, and fit..."
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-stone-200">
          <h3 className="text-xl font-bold font-serif text-stone-900 mb-6">
            You May Also Admire
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category}
      />
    </div>
  );
};
