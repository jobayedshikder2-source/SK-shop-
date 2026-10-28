import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { StoreDataProvider } from './context/StoreDataContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppButton } from './components/WhatsAppButton';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AccountPage } from './pages/AccountPage';
import { PolicyPage } from './pages/PolicyPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminGuard } from './components/AdminGuard';

import { Product, Order } from './types';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        return 'admin';
      }
    }
    return 'home';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');
  const [trackingPhone, setTrackingPhone] = useState<string>('');

  // Synchronize route with browser popstate & hashchange (e.g. /admin)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        setCurrentPage('admin');
      } else if (currentPage === 'admin') {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [currentPage]);

  // Navigate handler that keeps URL in sync with /admin route
  const handleNavigate = (page: string) => {
    if (page === 'admin') {
      if (window.location.pathname !== '/admin') {
        try {
          window.history.pushState(null, '', '/admin');
        } catch {
          window.location.hash = '/admin';
        }
      }
    } else {
      if (window.location.pathname === '/admin' || window.location.hash === '#/admin') {
        try {
          window.history.pushState(null, '', '/');
        } catch {
          window.location.hash = '';
        }
      }
    }
    setCurrentPage(page);
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedProduct]);

  // Product Selection handler
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    handleNavigate('product');
  };

  // Category selection handler
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    handleNavigate('shop');
  };

  // Order placed handler
  const handleOrderPlaced = (order: Order) => {
    setPlacedOrder(order);
    handleNavigate('order-success');
  };

  // Navigation to tracking
  const handleNavigateToTracking = (orderNumber: string, phone: string) => {
    setTrackingOrderNumber(orderNumber);
    setTrackingPhone(phone);
    handleNavigate('track');
  };

  // Render Admin Dashboard full screen protected by AdminGuard (checks 'isAdmin' custom claim)
  if (
    currentPage === 'admin' ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.toLowerCase() === '/admin' ||
        window.location.hash.toLowerCase() === '#/admin' ||
        window.location.hash.toLowerCase() === '#admin'))
  ) {
    return (
      <AdminGuard onBackToStore={() => handleNavigate('home')}>
        <AdminDashboard onBackToStore={() => handleNavigate('home')} />
      </AdminGuard>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onNavigate={(page) => handleNavigate(page)}
        onSelectProduct={handleSelectProduct}
      />

      {/* 2. Main Page Content View */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onSelectCategory={handleSelectCategory}
            onNavigate={(page) => handleNavigate(page)}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'shop' && (
          <ShopPage
            initialCategory={selectedCategory}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'product' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => handleNavigate('shop')}
            onSelectProduct={handleSelectProduct}
            onNavigateToCheckout={() => handleNavigate('checkout')}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage
            onNavigateToCheckout={() => handleNavigate('checkout')}
            onContinueShopping={() => handleNavigate('shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onBackToCart={() => handleNavigate('cart')}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {currentPage === 'order-success' && placedOrder && (
          <OrderSuccessPage
            order={placedOrder}
            onNavigateToTracking={handleNavigateToTracking}
            onContinueShopping={() => handleNavigate('shop')}
          />
        )}

        {currentPage === 'track' && (
          <OrderTrackingPage
            initialOrderNumber={trackingOrderNumber}
            initialPhone={trackingPhone}
            onContinueShopping={() => handleNavigate('shop')}
          />
        )}

        {currentPage === 'account' && (
          <AccountPage
            onNavigateToTracking={handleNavigateToTracking}
            onSelectProduct={handleSelectProduct}
            onNavigateToAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'wishlist' && (
          <AccountPage
            onNavigateToTracking={handleNavigateToTracking}
            onSelectProduct={handleSelectProduct}
            onNavigateToAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage.startsWith('policy-') && (
          <PolicyPage
            initialSection={currentPage.replace('policy-', '')}
            onContinueShopping={() => handleNavigate('shop')}
          />
        )}
      </main>

      {/* 3. Global Footer */}
      <Footer
        onNavigate={(page) => handleNavigate(page)}
        onSelectCategory={handleSelectCategory}
      />

      {/* 4. Slide-out Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => handleNavigate('checkout')}
        onNavigateToCart={() => handleNavigate('cart')}
      />

      {/* 5. Floating WhatsApp Support Button */}
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StoreDataProvider>
          <WishlistProvider>
            <CartProvider>
              <MainApp />
            </CartProvider>
          </WishlistProvider>
        </StoreDataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
