export type ProductCategory = 
  | 'men' 
  | 'women' 
  | 'kids' 
  | 'accessories' 
  | 'panjabi' 
  | 'saree' 
  | 'western';

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  description: string;
  descriptionBn?: string;
  category: ProductCategory;
  subCategory?: string;
  sku: string;
  regularPrice: number;
  discountedPrice?: number;
  isSale?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isAvailable: boolean;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants?: ProductVariant[];
  totalStock: number;
  fabricInfo?: string;
  careInstructions?: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  nameBn?: string;
  price: number;
  regularPrice: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  sku: string;
  maxStock: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'rejected' 
  | 'refunded';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  productId: string;
  name: string;
  nameBn?: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  regularPrice: number;
  image: string;
  sku: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  changedBy: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  district: string;
  upazila?: string;
  deliveryInstructions?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTrxId?: string;
  orderStatus: OrderStatus;
  courierName?: string;
  courierTrackingCode?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  internalNotes?: string;
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
  usageCount: number;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerifiedPurchase?: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeNameBn?: string;
  tagline: string;
  taglineBn?: string;
  phone: string;
  email: string;
  address: string;
  nagadNumber?: string;
  deliveryChargeDhaka: number;
  deliveryChargeOutside: number;
  freeShippingThreshold: number;
  announcementBarText: string;
  announcementBarTextBn?: string;
  announcementBarActive: boolean;
  whatsappNumber: string;
  logoUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  firebaseProjectName?: string;
  adminDailyEmailEnabled?: boolean;
  adminNotificationEmail?: string;
  adminNotificationDaySchedule?: string;
}

export interface Banner {
  id: string;
  title: string;
  titleBn?: string;
  subtitle: string;
  subtitleBn?: string;
  badge?: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  active: boolean;
  order: number;
}

export interface NotificationLog {
  id: string;
  orderId: string;
  type: 'email' | 'sms' | 'whatsapp' | 'in_app';
  recipient: string;
  title: string;
  message: string;
  status: 'delivered' | 'sent' | 'pending' | 'failed';
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses?: {
    id: string;
    label: string;
    address: string;
    district: string;
    phone: string;
    isDefault: boolean;
  }[];
  wishlist?: string[];
  role?: 'customer' | 'admin';
  createdAt: string;
}
