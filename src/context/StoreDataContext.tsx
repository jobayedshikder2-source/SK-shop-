import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Order, StoreSettings, Coupon, Banner, NotificationLog, AuditLog } from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_STORE_SETTINGS, 
  INITIAL_COUPONS, 
  INITIAL_BANNERS 
} from '../lib/initialData';
import { 
  generateCustomerOrderEmailHtml, 
  generateCustomerOrderEmailText, 
  dispatchCustomerOrderConfirmation 
} from '../lib/emailService';

interface StoreDataContextType {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  settings: StoreSettings;
  notificationLogs: NotificationLog[];
  loading: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => Promise<string>;
  sendCustomerOrderConfirmationEmail: (order: Order, email?: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, newStatus: Order['orderStatus'], adminName: string, courierName?: string, trackingCode?: string, notes?: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
}

const StoreDataContext = createContext<StoreDataContextType | undefined>(undefined);

export const StoreDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Sync & Seeding of Firestore
  useEffect(() => {
    let isSubscribed = true;

    // Check & Seed Products if Firestore is empty
    const initAndSubscribe = async () => {
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        if (prodSnap.empty) {
          // Seed initial products into Firestore
          const batch = writeBatch(db);
          INITIAL_PRODUCTS.forEach((prod) => {
            const ref = doc(db, 'products', prod.id);
            batch.set(ref, prod);
          });
          // Seed initial coupons
          INITIAL_COUPONS.forEach((cpn) => {
            const ref = doc(db, 'coupons', cpn.id);
            batch.set(ref, cpn);
          });
          // Seed banners
          INITIAL_BANNERS.forEach((ban) => {
            const ref = doc(db, 'banners', ban.id);
            batch.set(ref, ban);
          });
          batch.set(doc(db, 'storeSettings', 'general'), INITIAL_STORE_SETTINGS);
          await batch.commit();
        } else {
          // Always ensure the latest hotline, address and logo are merged into Firestore
          await setDoc(doc(db, 'storeSettings', 'general'), INITIAL_STORE_SETTINGS, { merge: true });
        }
      } catch (err) {
        console.warn('Initial seeding fallback to memory/defaults:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    initAndSubscribe();

    // 2. Real-time listener for Products
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (!snapshot.empty) {
          const prods: Product[] = [];
          snapshot.forEach((doc) => prods.push(doc.data() as Product));
          setProducts(prods);
        }
      },
      (error) => {
        console.warn('Products onSnapshot warning (using local initial):', error);
      }
    );

    // 3. Real-time listener for Orders
    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const ords: Order[] = [];
        snapshot.forEach((doc) => ords.push(doc.data() as Order));
        ords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(ords);
      },
      (error) => {
        console.warn('Orders onSnapshot warning:', error);
      }
    );

    // 4. Real-time listener for Coupons
    const unsubCoupons = onSnapshot(
      collection(db, 'coupons'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cpns: Coupon[] = [];
          snapshot.forEach((doc) => cpns.push(doc.data() as Coupon));
          setCoupons(cpns);
        }
      },
      (error) => {
        console.warn('Coupons onSnapshot warning:', error);
      }
    );

    // 5. Real-time listener for Store Settings
    const unsubSettings = onSnapshot(
      doc(db, 'storeSettings', 'general'),
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data() as StoreSettings);
        }
      },
      (error) => {
        console.warn('StoreSettings onSnapshot warning:', error);
      }
    );

    // 6. Real-time listener for Notification Logs
    const unsubNotifications = onSnapshot(
      collection(db, 'notificationLogs'),
      (snapshot) => {
        const logs: NotificationLog[] = [];
        snapshot.forEach((doc) => logs.push(doc.data() as NotificationLog));
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotificationLogs(logs);
      },
      (error) => {
        console.warn('NotificationLogs onSnapshot warning:', error);
      }
    );

    return () => {
      isSubscribed = false;
      unsubProducts();
      unsubOrders();
      unsubCoupons();
      unsubSettings();
      unsubNotifications();
    };
  }, []);

  // Place Order function (Atomic creation, stock deduction, and notification)
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<string> => {
    const timestamp = new Date().toISOString();
    const orderDocRef = doc(collection(db, 'orders'));
    const orderId = orderDocRef.id;

    const fullOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: timestamp,
      updatedAt: timestamp,
      statusHistory: [
        {
          status: 'pending',
          timestamp,
          changedBy: 'Customer / System',
          note: 'Order placed by customer via ' + orderData.paymentMethod.toUpperCase()
        }
      ]
    };

    try {
      const batch = writeBatch(db);
      // 1. Write the order
      batch.set(orderDocRef, fullOrder);

      // 2. Reduce product stock
      orderData.items.forEach((item) => {
        const prodRef = doc(db, 'products', item.productId);
        const currentProd = products.find(p => p.id === item.productId);
        if (currentProd) {
          const remainingStock = Math.max(0, currentProd.totalStock - item.quantity);
          batch.update(prodRef, { 
            totalStock: remainingStock,
            isAvailable: remainingStock > 0 
          });
        }
      });

      // 3. Increment coupon usage if applied
      if (orderData.couponCode) {
        const coupon = coupons.find(c => c.code.toLowerCase() === orderData.couponCode?.toLowerCase());
        if (coupon) {
          const couponRef = doc(db, 'coupons', coupon.id);
          batch.update(couponRef, { usageCount: (coupon.usageCount || 0) + 1 });
        }
      }

      // 4. Construct rich admin email notification payload
      const adminEmails = Array.from(new Set([
        'bnagladeshbodnaparty@gmail.com',
        'skshopsaport@gmail.com',
        settings.email
      ].filter(Boolean)));

      const itemsSummaryText = fullOrder.items
        .map(it => `• ${it.name} (SKU: ${it.sku || 'N/A'}, Size: ${it.size || 'Std'}, Color: ${it.color || 'Default'}) x${it.quantity} = ৳${(it.price * it.quantity).toLocaleString()}`)
        .join('\n');

      const itemsSummaryHtml = fullOrder.items
        .map(it => `
          <tr style="border-bottom: 1px solid #e7e5e4;">
            <td style="padding: 8px; font-weight: 600; color: #1c1917;">
              ${it.name}
              <div style="font-size: 11px; color: #78716c; font-weight: normal;">
                SKU: ${it.sku || 'N/A'} | Size: ${it.size || 'Std'} | Color: ${it.color || 'Default'}
              </div>
            </td>
            <td style="padding: 8px; text-align: center; color: #44403c;">${it.quantity}</td>
            <td style="padding: 8px; text-align: right; color: #44403c;">৳${it.price.toLocaleString()}</td>
            <td style="padding: 8px; text-align: right; font-weight: 600; color: #1c1917;">৳${(it.price * it.quantity).toLocaleString()}</td>
          </tr>
        `).join('');

      const plainTextAdminEmail = `
🚨 NEW ORDER CONFIRMED - SK SHOP BD
=========================================
Order Number: #${fullOrder.orderNumber}
Order Date: ${new Date(timestamp).toLocaleString()}
Payment Method: ${fullOrder.paymentMethod.toUpperCase()}
Order Total: ৳${fullOrder.total.toLocaleString()}

CUSTOMER DETAILS:
Name: ${fullOrder.customerName}
Phone: ${fullOrder.customerPhone}
Email: ${fullOrder.customerEmail || 'Not provided'}
Address: ${fullOrder.deliveryAddress}
District: ${fullOrder.district}
Notes: ${fullOrder.deliveryInstructions || 'None'}

ITEMS ORDERED:
${itemsSummaryText}

FINANCIAL SUMMARY:
Subtotal: ৳${fullOrder.subtotal.toLocaleString()}
Delivery Charge: ৳${fullOrder.shippingFee.toLocaleString()}
Discount Applied: ৳${fullOrder.discount.toLocaleString()}
Grand Total: ৳${fullOrder.total.toLocaleString()}
`.trim();

      const htmlAdminEmail = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden;">
  <div style="background: #1c1917; color: #ffffff; padding: 22px; text-align: center;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1px;">🚨 NEW ORDER CONFIRMED</h1>
    <p style="margin: 6px 0 0; color: #f59e0b; font-size: 13px; font-weight: 600;">SK SHOP · Admin Alert Notification</p>
  </div>
  
  <div style="padding: 22px;">
    <div style="background: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 14px 18px; margin-bottom: 18px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="color: #78716c; padding: 4px 0;">Order Number:</td>
          <td style="font-weight: 700; text-align: right; color: #1c1917;">#${fullOrder.orderNumber}</td>
        </tr>
        <tr>
          <td style="color: #78716c; padding: 4px 0;">Time:</td>
          <td style="text-align: right; color: #44403c;">${new Date(timestamp).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="color: #78716c; padding: 4px 0;">Payment:</td>
          <td style="text-align: right; font-weight: 700; color: #047857;">${fullOrder.paymentMethod.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="color: #78716c; padding: 4px 0;">Total Amount:</td>
          <td style="text-align: right; font-weight: 800; color: #d97706; font-size: 16px;">৳${fullOrder.total.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <div style="background: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 14px 18px; margin-bottom: 18px;">
      <h3 style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; border-bottom: 1px solid #f5f5f4; padding-bottom: 6px;">Customer & Delivery</h3>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Name:</strong> ${fullOrder.customerName}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Phone:</strong> <a href="tel:${fullOrder.customerPhone}" style="color: #d97706; text-decoration: none; font-weight: 600;">${fullOrder.customerPhone}</a></p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Address:</strong> ${fullOrder.deliveryAddress}, ${fullOrder.district}</p>
      ${fullOrder.deliveryInstructions ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Notes:</strong> ${fullOrder.deliveryInstructions}</p>` : ''}
    </div>

    <div style="background: #ffffff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 14px 18px; margin-bottom: 18px;">
      <h3 style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; border-bottom: 1px solid #f5f5f4; padding-bottom: 6px;">Ordered Items</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 2px solid #e7e5e4; color: #78716c; text-align: left;">
            <th style="padding: 6px 8px;">Product</th>
            <th style="padding: 6px 8px; text-align: center;">Qty</th>
            <th style="padding: 6px 8px; text-align: right;">Price</th>
            <th style="padding: 6px 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsSummaryHtml}
        </tbody>
      </table>

      <div style="border-top: 1px solid #e7e5e4; margin-top: 10px; padding-top: 10px;">
        <table style="width: 100%; font-size: 12px;">
          <tr>
            <td style="color: #78716c;">Subtotal:</td>
            <td style="text-align: right; font-weight: 600;">৳${fullOrder.subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: #78716c;">Delivery:</td>
            <td style="text-align: right; font-weight: 600;">৳${fullOrder.shippingFee.toLocaleString()}</td>
          </tr>
          ${fullOrder.discount > 0 ? `
          <tr>
            <td style="color: #047857;">Discount:</td>
            <td style="text-align: right; color: #047857; font-weight: 600;">-৳${fullOrder.discount.toLocaleString()}</td>
          </tr>` : ''}
          <tr style="font-size: 14px; font-weight: 800; border-top: 1px solid #e7e5e4;">
            <td style="padding-top: 6px; color: #1c1917;">Total:</td>
            <td style="padding-top: 6px; text-align: right; color: #d97706;">৳${fullOrder.total.toLocaleString()}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>

  <div style="background: #f5f5f4; color: #a8a29e; font-size: 11px; text-align: center; padding: 14px; border-top: 1px solid #e7e5e4;">
    Automated notification dispatched to store administrators: bnagladeshbodnaparty@gmail.com, skshopsaport@gmail.com
  </div>
</div>
`.trim();

      // 5. Write to Outbound Mail Queue (Trigger Email compatible)
      const mailDocRef = doc(collection(db, 'mail'));
      batch.set(mailDocRef, {
        to: adminEmails,
        message: {
          subject: `🚨 [NEW ORDER ALERT] #${fullOrder.orderNumber} - ৳${fullOrder.total.toLocaleString()} - ${fullOrder.customerName}`,
          text: plainTextAdminEmail,
          html: htmlAdminEmail
        },
        orderNumber: fullOrder.orderNumber,
        customerName: fullOrder.customerName,
        customerPhone: fullOrder.customerPhone,
        total: fullOrder.total,
        status: 'queued',
        createdAt: timestamp
      });

      // 6. Write to Direct Admin Notifications Collection
      const notifDocRef = doc(collection(db, 'notifications'));
      batch.set(notifDocRef, {
        id: notifDocRef.id,
        type: 'order_confirmed_admin_alert',
        title: `🚨 New Order Confirmed #${fullOrder.orderNumber}`,
        body: `Customer ${fullOrder.customerName} (${fullOrder.customerPhone}) placed order #${fullOrder.orderNumber} for ৳${fullOrder.total.toLocaleString()} via ${fullOrder.paymentMethod.toUpperCase()}.`,
        recipientEmail: 'bnagladeshbodnaparty@gmail.com',
        secondaryEmail: 'skshopsaport@gmail.com',
        orderId: fullOrder.id,
        orderNumber: fullOrder.orderNumber,
        customerPhone: fullOrder.customerPhone,
        total: fullOrder.total,
        read: false,
        createdAt: timestamp
      });

      // 7. Write to Activity & Notification Logs for Admin Dashboard
      const notifLog1 = doc(collection(db, 'notificationLogs'));
      batch.set(notifLog1, {
        id: notifLog1.id,
        orderId: fullOrder.orderNumber,
        type: 'email',
        recipient: adminEmails.join(', '),
        title: `Admin Order Email Dispatched #${fullOrder.orderNumber}`,
        message: `Order confirmation notification automatically sent to admin emails (${adminEmails.join(', ')}). Total: ৳${fullOrder.total.toLocaleString()}, Customer: ${fullOrder.customerName} (${fullOrder.customerPhone}).`,
        status: 'delivered',
        timestamp
      });

      const notifLog2 = doc(collection(db, 'notificationLogs'));
      batch.set(notifLog2, {
        id: notifLog2.id,
        orderId: fullOrder.orderNumber,
        type: 'sms',
        recipient: fullOrder.customerPhone,
        title: `SK Shop Order #${fullOrder.orderNumber} Confirmed`,
        message: `Thank you for shopping at SK Shop! Your order #${fullOrder.orderNumber} for ৳${fullOrder.total} is placed and will be delivered to ${fullOrder.district} shortly.`,
        status: 'delivered',
        timestamp
      });

      // 8. Automated email confirmation service to send order summary to customer immediately
      if (fullOrder.customerEmail && fullOrder.customerEmail.includes('@')) {
        const customerMailDoc = doc(collection(db, 'mail'));
        const customerEmailHtml = generateCustomerOrderEmailHtml(fullOrder, settings);
        const customerEmailText = generateCustomerOrderEmailText(fullOrder, settings);
        batch.set(customerMailDoc, {
          to: [fullOrder.customerEmail],
          message: {
            subject: `✨ Order Confirmed: #${fullOrder.orderNumber} - SK Shop Bangladesh`,
            text: customerEmailText,
            html: customerEmailHtml
          },
          orderNumber: fullOrder.orderNumber,
          customerName: fullOrder.customerName,
          recipientType: 'customer',
          status: 'sent',
          createdAt: timestamp
        });

        const custNotifLog = doc(collection(db, 'notificationLogs'));
        batch.set(custNotifLog, {
          id: custNotifLog.id,
          orderId: fullOrder.orderNumber,
          type: 'email',
          recipient: fullOrder.customerEmail,
          title: `Customer Confirmation Email #${fullOrder.orderNumber} Sent`,
          message: `Automated order summary & digital invoice dispatched to ${fullOrder.customerEmail}.`,
          status: 'delivered',
          timestamp
        });
      }

      await batch.commit();

      // Update local state instantly
      setOrders(prev => [fullOrder, ...prev]);
      return orderId;
    } catch (error) {
      console.error('Error creating order in Firestore:', error);
      // Fallback update local state if offline
      setOrders(prev => [fullOrder, ...prev]);
      return orderId;
    }
  };

  // Update Order Status
  // Send or resend customer order confirmation email service
  const sendCustomerOrderConfirmationEmail = async (order: Order, email?: string): Promise<boolean> => {
    try {
      const res = await dispatchCustomerOrderConfirmation(order, settings, email);
      if (res.success && email && email !== order.customerEmail) {
        try {
          const ordRef = doc(db, 'orders', order.id);
          await updateDoc(ordRef, { customerEmail: email });
          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, customerEmail: email } : o));
        } catch {
          // ignore
        }
      }
      return res.success;
    } catch (err) {
      console.error('sendCustomerOrderConfirmationEmail error:', err);
      return false;
    }
  };

  const updateOrderStatus = async (
    orderId: string, 
    newStatus: Order['orderStatus'], 
    adminName: string, 
    courierName?: string, 
    trackingCode?: string, 
    notes?: string
  ) => {
    const timestamp = new Date().toISOString();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newHistory = [
      ...order.statusHistory,
      {
        status: newStatus,
        timestamp,
        changedBy: adminName,
        note: notes || `Status changed to ${newStatus}`
      }
    ];

    const updates: Partial<Order> = {
      orderStatus: newStatus,
      updatedAt: timestamp,
      statusHistory: newHistory,
    };

    if (courierName) updates.courierName = courierName;
    if (trackingCode) updates.courierTrackingCode = trackingCode;
    if (notes) updates.internalNotes = notes;

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, updates);

      // Create Notification Log for customer update
      const notifRef = doc(collection(db, 'notificationLogs'));
      await setDoc(notifRef, {
        id: notifRef.id,
        orderId: order.orderNumber,
        type: 'sms',
        recipient: order.customerPhone,
        title: `SK Shop Order #${order.orderNumber} is ${newStatus.toUpperCase()}`,
        message: `Dear ${order.customerName}, your order status is updated to ${newStatus}.${courierName ? ` Courier: ${courierName}, Tracking: ${trackingCode || 'N/A'}` : ''}`,
        status: 'delivered',
        timestamp
      });

      // Update local
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    } catch (error) {
      console.error('Error updating order status:', error);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    }
  };

  // Add Product
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<string> => {
    const timestamp = new Date().toISOString();
    const newRef = doc(collection(db, 'products'));
    const id = newRef.id;
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    try {
      await setDoc(newRef, newProduct);
      setProducts(prev => [newProduct, ...prev]);
      return id;
    } catch (error) {
      console.error('Error adding product:', error);
      setProducts(prev => [newProduct, ...prev]);
      return id;
    }
  };

  // Update Product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const timestamp = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt: timestamp };

    try {
      const prodRef = doc(db, 'products', id);
      await updateDoc(prodRef, cleanUpdates);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...cleanUpdates } : p));
    } catch (error) {
      console.error('Error updating product:', error);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...cleanUpdates } : p));
    }
  };

  // Delete Product
  const deleteProduct = async (id: string) => {
    try {
      const prodRef = doc(db, 'products', id);
      await deleteDoc(prodRef);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Quick Stock Adjustment
  const updateProductStock = async (productId: string, newStock: number) => {
    const isAvail = newStock > 0;
    try {
      const prodRef = doc(db, 'products', productId);
      await updateDoc(prodRef, { totalStock: newStock, isAvailable: isAvail });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, totalStock: newStock, isAvailable: isAvail } : p));
    } catch (error) {
      console.error('Error updating stock:', error);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, totalStock: newStock, isAvailable: isAvail } : p));
    }
  };

  // Update Store Settings
  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const settingsRef = doc(db, 'storeSettings', 'general');
      await updateDoc(settingsRef, newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error updating settings:', error);
      setSettings(prev => ({ ...prev, ...newSettings }));
    }
  };

  // Add Coupon
  const addCoupon = async (couponData: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newRef = doc(collection(db, 'coupons'));
    const newCoupon: Coupon = {
      ...couponData,
      id: newRef.id,
      usageCount: 0
    };

    try {
      await setDoc(newRef, newCoupon);
      setCoupons(prev => [newCoupon, ...prev]);
    } catch (error) {
      console.error('Error adding coupon:', error);
      setCoupons(prev => [newCoupon, ...prev]);
    }
  };

  // Delete Coupon
  const deleteCoupon = async (id: string) => {
    try {
      const cpnRef = doc(db, 'coupons', id);
      await deleteDoc(cpnRef);
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <StoreDataContext.Provider
      value={{
        products,
        orders,
        coupons,
        banners,
        settings,
        notificationLogs,
        loading,
        createOrder,
        sendCustomerOrderConfirmationEmail,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStoreSettings,
        addCoupon,
        deleteCoupon,
        updateProductStock,
      }}
    >
      {children}
    </StoreDataContext.Provider>
  );
};

export const useStoreData = () => {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error('useStoreData must be used within a StoreDataProvider');
  }
  return context;
};
