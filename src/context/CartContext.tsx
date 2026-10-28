import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CartItem, Product, Coupon } from '../types';
import { calculateShippingFee } from '../lib/bangladeshLocations';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateItemVariant: (cartItemId: string, newSize: string, newColor: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => { success: boolean; message: string };
  removeCoupon: () => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  totalItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sk_shop_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: any) => ({
        ...item,
        quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1,
        price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0,
        regularPrice: typeof item.regularPrice === 'number' && !isNaN(item.regularPrice) ? item.regularPrice : (item.price || 0),
        maxStock: typeof item.maxStock === 'number' && !isNaN(item.maxStock) && item.maxStock > 0 ? item.maxStock : 50
      }));
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('sk_shop_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedDistrict, setSelectedDistrict] = useState<string>('Dhaka City');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const freeShippingThreshold = 2000;

  // Sync with Firestore for signed-in user on authentication
  useEffect(() => {
    if (!currentUser) return;
    const loadUserCart = async () => {
      try {
        const cartRef = doc(db, 'carts', currentUser.uid);
        const snap = await getDoc(cartRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            setCart(data.items.map((item: any) => ({
              ...item,
              quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1,
              price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0,
              maxStock: typeof item.maxStock === 'number' && !isNaN(item.maxStock) && item.maxStock > 0 ? item.maxStock : 50
            })));
          }
        }
      } catch (err) {
        console.warn('Error loading user cart from Firestore:', err);
      }
    };
    loadUserCart();
  }, [currentUser]);

  // Save cart to localStorage and Firestore
  useEffect(() => {
    localStorage.setItem('sk_shop_cart', JSON.stringify(cart));

    if (currentUser) {
      const saveUserCart = async () => {
        try {
          const cartRef = doc(db, 'carts', currentUser.uid);
          await setDoc(cartRef, {
            id: currentUser.uid,
            userId: currentUser.uid,
            items: cart,
            totalItems: cart.reduce((acc, i) => acc + (i.quantity || 1), 0),
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          console.warn('Error syncing cart to Firestore:', err);
        }
      };
      saveUserCart();
    }
  }, [cart, currentUser]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('sk_shop_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('sk_shop_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, size: string, color: string, quantity = 1, openDrawer = true) => {
    const cartItemId = `${product.id}-${size}-${color}`;
    const price = typeof product.discountedPrice === 'number' && product.discountedPrice > 0 ? product.discountedPrice : product.regularPrice;
    const stockLimit = typeof product.totalStock === 'number' && product.totalStock > 0 ? product.totalStock : 50;
    const requestedQty = Math.max(1, quantity);

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        const cur = typeof existing.quantity === 'number' && !isNaN(existing.quantity) ? existing.quantity : 1;
        const newQty = Math.min(cur + requestedQty, stockLimit);
        return prev.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQty, maxStock: stockLimit } : item
        );
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          nameBn: product.nameBn,
          price,
          regularPrice: product.regularPrice,
          image: product.images[0] || '',
          size,
          color,
          quantity: Math.min(requestedQty, stockLimit),
          sku: product.sku,
          maxStock: stockLimit
        };
        return [...prev, newItem];
      }
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.id === cartItemId) {
          const max = typeof item.maxStock === 'number' && !isNaN(item.maxStock) && item.maxStock > 0 ? item.maxStock : 50;
          return { ...item, quantity: Math.min(Math.max(1, quantity), max), maxStock: max };
        }
        return item;
      })
    );
  };

  const updateItemVariant = (cartItemId: string, newSize: string, newColor: string) => {
    setCart(prev => {
      const currentItem = prev.find(item => item.id === cartItemId);
      if (!currentItem) return prev;
      if (currentItem.size === newSize && currentItem.color === newColor) return prev;

      const newId = `${currentItem.productId}-${newSize}-${newColor}`;
      const existingNewItem = prev.find(item => item.id === newId);

      if (existingNewItem) {
        const combinedQty = Math.min(
          existingNewItem.quantity + currentItem.quantity,
          existingNewItem.maxStock || 50
        );
        return prev
          .filter(item => item.id !== cartItemId)
          .map(item => item.id === newId ? { ...item, quantity: combinedQty } : item);
      } else {
        return prev.map(item =>
          item.id === cartItemId
            ? { ...item, id: newId, size: newSize, color: newColor }
            : item
        );
      }
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((acc, item) => {
    const p = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
    const q = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1;
    return acc + p * q;
  }, 0);

  // Validate coupon when subtotal changes
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minOrderValue) {
      setAppliedCoupon(null);
    }
  }, [subtotal, appliedCoupon]);

  const applyCoupon = (coupon: Coupon): { success: boolean; message: string } => {
    if (!coupon.isActive) {
      return { success: false, message: 'This coupon is no longer active.' };
    }
    if (subtotal < coupon.minOrderValue) {
      return { 
        success: false, 
        message: `Minimum order value of ৳${coupon.minOrderValue} required for this coupon.` 
      };
    }
    setAppliedCoupon(coupon);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      const calculated = (subtotal * appliedCoupon.discountValue) / 100;
      discountAmount = appliedCoupon.maxDiscount ? Math.min(calculated, appliedCoupon.maxDiscount) : calculated;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const shippingFee = cart.length === 0 ? 0 : calculateShippingFee(selectedDistrict, subtotal, 70, 130, freeShippingThreshold);
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemVariant,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        selectedDistrict,
        setSelectedDistrict,
        subtotal,
        discountAmount,
        shippingFee,
        total,
        totalItemCount,
        isCartOpen,
        setIsCartOpen,
        freeShippingThreshold,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
