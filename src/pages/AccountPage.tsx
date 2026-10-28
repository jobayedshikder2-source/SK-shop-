import React, { useState } from 'react';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  LogOut, 
  ExternalLink, 
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStoreData } from '../context/StoreDataContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { AdminInvoiceModal } from '../components/AdminInvoiceModal';
import { ProductCard } from '../components/ProductCard';
import { Order, Product } from '../types';

interface AccountPageProps {
  onNavigateToTracking: (orderNumber: string, phone: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToAdmin: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onNavigateToTracking,
  onSelectProduct,
  onNavigateToAdmin
}) => {
  const { currentUser, userProfile, signInWithGoogle, signInAsAdmin, signOut, isAdmin, authErrorMessage } = useAuth();
  const { language, t } = useLanguage();
  const { orders, products } = useStoreData();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses'>('orders');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Filter orders for logged-in user or show recent browser orders
  const userOrders = currentUser
    ? orders.filter(o => o.customerId === currentUser.uid || o.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase())
    : orders.slice(0, 5); // show preview if not signed in

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Auth error notice */}
      {authErrorMessage && !currentUser && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 space-y-2">
          <p className="font-bold text-amber-950 flex items-center gap-1.5">
            <span>⚠️ Firebase Authentication Notice</span>
          </p>
          <p className="text-amber-800 leading-relaxed">{authErrorMessage}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'Customer'}
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-600 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 border border-stone-200">
              <User className="w-8 h-8" />
            </div>
          )}

          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
              {currentUser?.displayName || 'Guest Customer'}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              {currentUser?.email || 'Sign in to access your orders and admin controls.'}
            </p>
            {isAdmin && (
              <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full">
                Authorized Store Administrator
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentUser ? (
            <button
              onClick={signOut}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-500" />
              <span>Sign Out</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => signInAsAdmin('jobayedshikder2@gmail.com')}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Instant access as store administrator"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
              <button
                onClick={signInWithGoogle}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Google Sign In</span>
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Go to Admin Panel</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'orders' ? 'border-amber-600 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Order History ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'wishlist' ? 'border-amber-600 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>My Wishlist ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'addresses' ? 'border-amber-600 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-6">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">No orders placed yet</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Once you place an order, you can review details, track shipping live, and download tax invoices here.
              </p>
            </div>
          ) : (
            userOrders.map((ord) => (
              <div key={ord.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-base text-stone-900">
                        #{ord.orderNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.orderStatus === 'shipped' ? 'bg-sky-100 text-sky-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()} · {ord.paymentMethod.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateToTracking(ord.orderNumber, ord.customerPhone)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition"
                    >
                      Track Package
                    </button>
                    <button
                      onClick={() => setSelectedInvoiceOrder(ord)}
                      className="px-3 py-1.5 text-xs font-semibold border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition flex items-center gap-1.5"
                      title="Reprint Order Invoice or Receipt"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reprint Receipt</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-md bg-stone-100" />
                        <div>
                          <p className="font-semibold text-stone-900">{item.name}</p>
                          <p className="text-[11px] text-stone-400">
                            Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                  <span className="text-stone-500">
                    Delivered to: <strong>{ord.district}</strong>
                  </span>
                  <span className="font-bold text-sm text-stone-900">
                    Total: <span className="text-amber-700">৳{ord.total.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-6">
              <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">Your wishlist is empty</h3>
              <p className="text-xs text-stone-500 mt-1">
                Click the heart icon on any product card to save your favorites here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {wishlistProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4 max-w-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
            Default Delivery Address
          </h3>
          <p className="text-xs text-stone-500">
            Addresses are automatically saved during checkout for streamlined one-click ordering.
          </p>
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1">
            <span className="font-bold text-stone-900 block">{currentUser?.displayName || 'Primary Address'}</span>
            <p>House 12, Road 4, Banani, Dhaka-1213</p>
            <p>District: Dhaka City · Phone: +880 1712-345678</p>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <AdminInvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
};
