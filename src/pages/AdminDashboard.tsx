import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Boxes, 
  Tag, 
  Users, 
  Settings, 
  Bell, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Printer, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertTriangle, 
  DollarSign, 
  Filter, 
  X, 
  Save, 
  ArrowLeft,
  MessageCircle,
  Eye,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  FileSpreadsheet,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  Sparkles,
  LogOut,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStoreData } from '../context/StoreDataContext';
import { useLanguage } from '../context/LanguageContext';
import { AdminInvoiceModal } from '../components/AdminInvoiceModal';
import { Order, Product, Coupon, StoreSettings, OrderStatus, PaymentMethod } from '../types';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { currentUser, isAdmin, signOut } = useAuth();
  const { 
    orders, 
    products, 
    coupons, 
    settings, 
    notificationLogs, 
    updateOrderStatus, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateStoreSettings, 
    addCoupon, 
    deleteCoupon, 
    updateProductStock 
  } = useStoreData();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'inventory' | 'coupons' | 'customers' | 'settings' | 'notifications'
  >('overview');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Status Change State inside Order Detail Modal
  const [statusChangeValue, setStatusChangeValue] = useState<OrderStatus>('pending');
  const [courierNameInput, setCourierNameInput] = useState('');
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Order Filters
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [prodForm, setProdForm] = useState({
    name: '',
    nameBn: '',
    description: '',
    descriptionBn: '',
    category: 'panjabi' as any,
    subCategory: '',
    sku: '',
    regularPrice: 2200,
    discountedPrice: 1800,
    isSale: true,
    isFeatured: true,
    isBestSeller: false,
    isAvailable: true,
    totalStock: 30,
    fabricInfo: '100% Combed Cotton',
    careInstructions: 'Dry clean or cold wash',
    imagesText: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    sizesText: 'S, M, L, XL, XXL',
    colorsText: 'Royal Navy (#1B2A4A), White (#FFFFFF)'
  });

  // Product Photo Upload from File State & Handlers
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [adminDailyEmailTriggerSuccess, setAdminDailyEmailTriggerSuccess] = useState<string | null>(null);

  const handlePhotoFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (!result) return;

        // Auto-compress high-res uploads to web-optimized dimensions
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setUploadedImages((prev) => [...prev, compressed]);
          } else {
            setUploadedImages((prev) => [...prev, result]);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetMainPhoto = (indexToPromote: number) => {
    setUploadedImages((prev) => {
      const item = prev[indexToPromote];
      const rest = prev.filter((_, idx) => idx !== indexToPromote);
      return [item, ...rest];
    });
  };

  // Coupon Add Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderValue: 1000,
    maxDiscount: 500,
    validUntil: '2026-12-31',
    isActive: true,
  });

  // Settings Edit State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Synchronize settings form when store settings change
  React.useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Key Analytics Calculations
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.orderStatus !== 'cancelled' && o.orderStatus !== 'rejected')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const deliveredRevenue = useMemo(() => {
    return orders
      .filter(o => o.orderStatus === 'delivered')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'pending').length;
  }, [orders]);

  const processingOrdersCount = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'confirmed').length;
  }, [orders]);

  const shippedOrdersCount = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'shipped').length;
  }, [orders]);

  const deliveredOrdersCount = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'delivered').length;
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.totalStock <= 10);
  }, [products]);

  const averageOrderValue = useMemo(() => {
    const validOrders = orders.filter(o => o.orderStatus !== 'cancelled');
    if (!validOrders.length) return 0;
    return Math.round(totalRevenue / validOrders.length);
  }, [orders, totalRevenue]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const q = orderSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        order.district.toLowerCase().includes(q) ||
        (order.courierTrackingCode && order.courierTrackingCode.toLowerCase().includes(q));

      const matchesStatus = orderStatusFilter === 'all' || order.orderStatus === orderStatusFilter;
      const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, orderSearchQuery, orderStatusFilter, paymentFilter]);

  // Unique Customers calculation
  const customerList = useMemo(() => {
    const map = new Map<string, {
      name: string;
      phone: string;
      email?: string;
      orderCount: number;
      totalSpent: number;
      lastOrderDate: string;
      district: string;
    }>();

    orders.forEach(order => {
      const key = order.customerPhone || order.customerId;
      if (!map.has(key)) {
        map.set(key, {
          name: order.customerName,
          phone: order.customerPhone,
          email: order.customerEmail,
          orderCount: 1,
          totalSpent: order.total,
          lastOrderDate: order.createdAt,
          district: order.district
        });
      } else {
        const existing = map.get(key)!;
        existing.orderCount += 1;
        existing.totalSpent += order.total;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
          existing.district = order.district;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = productSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearchQuery, productCategoryFilter]);

  // Handle Order Status Update
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdatingOrder(true);
    const adminIdentifier = currentUser?.email || 'Store Administrator';

    try {
      await updateOrderStatus(
        selectedOrder.id,
        statusChangeValue,
        adminIdentifier,
        courierNameInput.trim() || undefined,
        trackingCodeInput.trim() || undefined,
        internalNoteInput.trim() || undefined
      );

      // Update local modal view copy
      setSelectedOrder(prev => prev ? {
        ...prev,
        orderStatus: statusChangeValue,
        courierName: courierNameInput.trim() || undefined,
        courierTrackingCode: trackingCodeInput.trim() || undefined,
        internalNotes: internalNoteInput.trim() || undefined
      } : null);
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setUploadedImages([
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80'
    ]);
    setShowUrlFallback(false);
    setProdForm({
      name: '',
      nameBn: '',
      description: '',
      descriptionBn: '',
      category: 'panjabi',
      subCategory: 'Royal Silk',
      sku: `SK-${Math.floor(1000 + Math.random() * 9000)}`,
      regularPrice: 2200,
      discountedPrice: 1800,
      isSale: true,
      isFeatured: true,
      isBestSeller: false,
      isAvailable: true,
      totalStock: 30,
      fabricInfo: '100% Fine Combed Cotton',
      careInstructions: 'Dry clean or cold wash',
      imagesText: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
      sizesText: 'S, M, L, XL, XXL',
      colorsText: 'Royal Navy (#1B2A4A), Crisp White (#FFFFFF)'
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setUploadedImages(prod.images && prod.images.length ? prod.images : []);
    setShowUrlFallback(false);
    setProdForm({
      name: prod.name,
      nameBn: prod.nameBn || '',
      description: prod.description,
      descriptionBn: prod.descriptionBn || '',
      category: prod.category,
      subCategory: prod.subCategory || '',
      sku: prod.sku,
      regularPrice: prod.regularPrice,
      discountedPrice: prod.discountedPrice || prod.regularPrice,
      isSale: prod.isSale || false,
      isFeatured: prod.isFeatured || false,
      isBestSeller: prod.isBestSeller || false,
      isAvailable: prod.isAvailable,
      totalStock: prod.totalStock,
      fabricInfo: prod.fabricInfo || '',
      careInstructions: prod.careInstructions || '',
      imagesText: prod.images.join('\n'),
      sizesText: prod.sizes.join(', '),
      colorsText: prod.colors.map(c => `${c.name} (${c.hex})`).join(', ')
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = uploadedImages.length > 0 
      ? uploadedImages 
      : prodForm.imagesText
          .split(/[\n,]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0);

    const sizes = prodForm.sizesText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const colors = prodForm.colorsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(cStr => {
        const match = cStr.match(/(.*?)\s*\((#[A-Fa-f0-9]{3,6})\)/);
        if (match) {
          return { name: match[1].trim(), hex: match[2].trim() };
        }
        return { name: cStr, hex: '#000000' };
      });

    const productPayload = {
      name: prodForm.name,
      nameBn: prodForm.nameBn || undefined,
      description: prodForm.description,
      descriptionBn: prodForm.descriptionBn || undefined,
      category: prodForm.category,
      subCategory: prodForm.subCategory || undefined,
      sku: prodForm.sku,
      regularPrice: Number(prodForm.regularPrice),
      discountedPrice: Number(prodForm.discountedPrice),
      isSale: prodForm.isSale,
      isFeatured: prodForm.isFeatured,
      isBestSeller: prodForm.isBestSeller,
      isAvailable: prodForm.isAvailable,
      images: images.length ? images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80'],
      sizes: sizes.length ? sizes : ['Standard'],
      colors: colors.length ? colors : [{ name: 'Default', hex: '#000000' }],
      totalStock: Number(prodForm.totalStock),
      fabricInfo: prodForm.fabricInfo || undefined,
      careInstructions: prodForm.careInstructions || undefined,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 1,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productPayload);
    } else {
      await addProduct(productPayload);
    }

    setIsProductModalOpen(false);
  };

  // Add Coupon Submit
  const handleSaveCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    await addCoupon({
      code: couponForm.code.toUpperCase().trim(),
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      minOrderValue: Number(couponForm.minOrderValue),
      maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
      validUntil: couponForm.validUntil,
      isActive: couponForm.isActive,
    });

    setIsCouponModalOpen(false);
    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 1000,
      maxDiscount: 500,
      validUntil: '2026-12-31',
      isActive: true,
    });
  };

  // Save Settings Submit
  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreSettings(settingsForm);
    setSettingsSavedSuccess(true);
    setTimeout(() => setSettingsSavedSuccess(false), 3500);
  };

  // Export Orders as CSV
  const handleExportOrdersCSV = () => {
    if (!orders.length) return;
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'District', 'Payment Method', 'Status', 'Total (BDT)'];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerPhone,
      `"${o.district}"`,
      o.paymentMethod.toUpperCase(),
      o.orderStatus.toUpperCase(),
      o.total
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SK_Shop_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Common Couriers in Bangladesh
  const BANGLADESH_COURIERS = [
    'Steadfast Courier',
    'Pathao Courier',
    'RedX Delivery',
    'Paperfly',
    'Sundarban Courier Service',
    'eCourier',
    'SA Paribahan',
    'In-House Express Delivery'
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* 1. Global Admin Topbar */}
      <header className="bg-stone-950 text-white border-b border-stone-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 text-xs font-bold text-stone-300 hover:text-white transition bg-stone-850 hover:bg-stone-800 border border-stone-700/60 px-3.5 py-2 rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/file_0000000025048211bceee5b5025f840e_6a06dbdd.png"
              alt="SK Shop Logo"
              className="w-8 h-8 object-contain rounded-full border border-stone-700 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold font-serif tracking-tight text-white">SK SHOP</span>
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 border border-stone-800 rounded-lg text-[10px] text-stone-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Firebase: <strong className="text-amber-400 font-mono">{settings.firebaseProjectName || 'SK Shop'}</strong></span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                  ADMIN SUITE
                </span>
              </div>
              <p className="text-[10px] text-stone-400 hidden md:block">Real-time Fashion Operations & Inventory Portal</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-stone-300 font-medium text-[11px] truncate max-w-[220px]">
              {currentUser?.email || 'Authorized Administrator'}
            </span>
          </div>

          <button
            onClick={signOut}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-850 rounded-xl transition"
            title="Sign Out of Admin Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Admin Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sleek Sidebar Navigation */}
        <aside aria-label="Admin navigation" className="w-full md:w-64 bg-stone-900 text-stone-300 p-3 sm:p-4 shrink-0 border-r border-stone-800 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold tracking-widest uppercase text-stone-500">
            Navigation Menu
          </div>

          {[
            { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} New` : undefined, badgeColor: 'bg-amber-500 text-stone-950' },
            { id: 'products', label: `Products (${products.length})`, icon: ShoppingBag },
            { id: 'inventory', label: 'Inventory & Stock', icon: Boxes, badge: lowStockProducts.length > 0 ? `${lowStockProducts.length} Low` : undefined, badgeColor: 'bg-rose-500 text-white' },
            { id: 'coupons', label: `Discount Coupons (${coupons.length})`, icon: Tag },
            { id: 'customers', label: `Customer Base (${customerList.length})`, icon: Users },
            { id: 'settings', label: 'Store & Shipping Settings', icon: Settings },
            { id: 'notifications', label: `Activity Logs (${notificationLogs.length})`, icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 mt-6 border-t border-stone-800 text-[11px] text-stone-500 px-3 space-y-2">
            <div className="flex justify-between items-center">
              <span>Hotline:</span>
              <span className="font-mono text-stone-300">01781822686</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Support:</span>
              <a href="mailto:skshopsaport@gmail.com" className="text-amber-400 hover:underline truncate">
                skshopsaport
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span>Location:</span>
              <span className="text-stone-300">Ashulia, Savar</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Header Title & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">Executive Dashboard</h1>
                  <p className="text-xs text-stone-500 mt-0.5">Live store revenue, fulfillment metrics, and catalog status</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportOrdersCSV}
                    className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2 bg-stone-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Store Volume</span>
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-stone-900">৳{totalRevenue.toLocaleString()}</div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Delivered Revenue: ৳{deliveredRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Orders Lifecycle</span>
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-stone-900">{orders.length}</div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-2">
                    <span className="font-semibold text-amber-600">{pendingOrdersCount} Pending</span>
                    <span>·</span>
                    <span className="font-semibold text-emerald-600">{deliveredOrdersCount} Delivered</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Average Order Value</span>
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-stone-900">৳{averageOrderValue.toLocaleString()}</div>
                  <div className="text-[11px] text-stone-500">Across all customer checkouts</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Inventory Status</span>
                    <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                      <Boxes className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-stone-900">{products.length} Items</div>
                  <div className="text-[11px] flex items-center gap-1.5">
                    {lowStockProducts.length > 0 ? (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {lowStockProducts.length} low stock warnings
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        All stock levels healthy
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Status Funnel & Visual Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fulfillment Status Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Order Fulfillment Pipeline</span>
                  </h3>

                  <div className="space-y-3 pt-1">
                    {[
                      { label: 'Pending Verification', count: pendingOrdersCount, color: 'bg-amber-500', total: orders.length },
                      { label: 'Confirmed & Processing', count: processingOrdersCount, color: 'bg-blue-500', total: orders.length },
                      { label: 'Shipped with Courier', count: shippedOrdersCount, color: 'bg-purple-500', total: orders.length },
                      { label: 'Successfully Delivered', count: deliveredOrdersCount, color: 'bg-emerald-500', total: orders.length },
                      { label: 'Cancelled / Returned', count: orders.filter(o => o.orderStatus === 'cancelled').length, color: 'bg-stone-300', total: orders.length },
                    ].map((step, idx) => {
                      const pct = step.total > 0 ? Math.round((step.count / step.total) * 100) : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-stone-600 font-medium">{step.label}</span>
                            <span className="font-bold text-stone-900">{step.count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${step.color} transition-all duration-500 rounded-full`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Selling Products Leaderboard */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Featured Catalog Highlights</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                    >
                      View All Products →
                    </button>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {products.slice(0, 4).map(prod => (
                      <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-12 h-14 object-cover rounded-xl bg-stone-100 shrink-0 border border-stone-200/60"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{prod.name}</h4>
                            <p className="text-[11px] text-stone-400">
                              SKU: <span className="font-mono">{prod.sku}</span> · Category: {prod.category}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-extrabold text-stone-900">৳{prod.discountedPrice || prod.regularPrice}</span>
                              {prod.isSale && (
                                <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-sm">
                                  Sale
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            prod.totalStock > 15 
                              ? 'bg-emerald-50 text-emerald-800' 
                              : prod.totalStock > 0 
                                ? 'bg-amber-50 text-amber-800' 
                                : 'bg-rose-50 text-rose-800'
                          }`}>
                            {prod.totalStock} in Stock
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview Table */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Recent Customer Orders</h3>
                    <p className="text-[11px] text-stone-500">Real-time incoming parcels ready for processing</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition"
                  >
                    Manage Orders ({orders.length}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {orders.slice(0, 5).map(order => (
                        <tr key={order.id} className="hover:bg-stone-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-stone-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-stone-900 block">{order.customerName}</span>
                            <span className="text-[11px] text-stone-400">{order.customerPhone}</span>
                          </td>
                          <td className="py-3 px-4 text-stone-600">{order.district}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-emerald-50 text-emerald-800">
                              COD
                            </span>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-stone-900">
                            ৳{order.total.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.orderStatus === 'confirmed' ? 'bg-teal-100 text-teal-800' :
                              order.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setStatusChangeValue(order.orderStatus);
                                setCourierNameInput(order.courierName || '');
                                setTrackingCodeInput(order.courierTrackingCode || '');
                                setInternalNoteInput(order.internalNotes || '');
                              }}
                              className="px-2.5 py-1 text-stone-700 hover:text-stone-950 font-bold hover:bg-stone-100 rounded-lg transition"
                            >
                              Manage →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: ORDERS MANAGEMENT ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">Order Management</h1>
                  <p className="text-xs text-stone-500 mt-0.5">Filter, process parcels, assign couriers, and generate invoices</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportOrdersCSV}
                    className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by Order ID (#), Customer Name, Phone, District, or Tracking Code..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-medium focus:outline-hidden"
                  >
                    <option value="all">All Statuses ({orders.length})</option>
                    <option value="pending">Pending ({pendingOrdersCount})</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped ({shippedOrdersCount})</option>
                    <option value="delivered">Delivered ({deliveredOrdersCount})</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-medium focus:outline-hidden"
                  >
                    <option value="all">Payment: Cash on Delivery</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Courier & Tracking</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-stone-400">
                            No orders found matching your search and filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-stone-50/70 transition">
                            <td className="py-3 px-4 font-mono font-bold text-stone-900">
                              #{order.orderNumber}
                            </td>
                            <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-stone-900 block">{order.customerName}</span>
                              <span className="text-[11px] text-stone-400">{order.customerPhone}</span>
                            </td>
                            <td className="py-3 px-4 text-stone-600">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-emerald-50 text-emerald-800">
                                COD
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {order.courierName ? (
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-stone-900 block truncate max-w-[140px]">{order.courierName}</span>
                                  {order.courierTrackingCode && (
                                    <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-1 rounded-sm">
                                      {order.courierTrackingCode}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-stone-400 italic">Not Assigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-extrabold text-stone-900 whitespace-nowrap">
                              ৳{order.total.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.orderStatus === 'confirmed' ? 'bg-teal-100 text-teal-800' :
                                order.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition"
                                title="Print Invoice / Packing Slip"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setStatusChangeValue(order.orderStatus);
                                  setCourierNameInput(order.courierName || '');
                                  setTrackingCodeInput(order.courierTrackingCode || '');
                                  setInternalNoteInput(order.internalNotes || '');
                                }}
                                className="px-2.5 py-1.5 bg-stone-900 hover:bg-amber-600 text-white font-bold rounded-lg transition"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: PRODUCTS CATALOG ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">Product Catalog</h1>
                  <p className="text-xs text-stone-500 mt-0.5">Manage fashion apparel, inventory pricing, and showcase collections</p>
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Product Search & Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Search product by title, SKU, or category..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex gap-2">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-medium"
                  >
                    <option value="all">All Categories</option>
                    <option value="panjabi">Panjabi & Ethnic</option>
                    <option value="saree">Sarees</option>
                    <option value="men">Men's Wear</option>
                    <option value="women">Women's Wear</option>
                    <option value="kids">Kids</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map(prod => (
                  <div key={prod.id} className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden flex flex-col">
                    <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                          prod.totalStock > 10 ? 'bg-emerald-600 text-white' : prod.totalStock > 0 ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {prod.totalStock} in stock
                        </span>
                        {prod.isSale && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-md">
                            SALE
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-mono">
                        {prod.sku}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                          {prod.category}
                        </span>
                        <h3 className="text-sm font-bold text-stone-900 line-clamp-1 mt-0.5">{prod.name}</h3>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1">{prod.description}</p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-extrabold text-stone-900">৳{prod.discountedPrice || prod.regularPrice}</span>
                          {prod.discountedPrice && prod.discountedPrice < prod.regularPrice && (
                            <span className="text-xs text-stone-400 line-through ml-2">৳{prod.regularPrice}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete ${prod.name}?`)) {
                                await deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: INVENTORY & STOCK ================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">Inventory & Stock Adjustment</h1>
                <p className="text-xs text-stone-500 mt-0.5">Quick in-place stock increment/decrement and warehouse replenishment</p>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Current Stock</th>
                        <th className="py-3 px-4 text-center">Quick Adjust</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {products.map(prod => (
                        <tr key={prod.id} className="hover:bg-stone-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-10 h-12 object-cover rounded-md bg-stone-100 shrink-0"
                              />
                              <span className="font-semibold text-stone-900 line-clamp-1 max-w-xs">{prod.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 capitalize">{prod.category}</td>
                          <td className="py-3 px-4 font-mono">{prod.sku}</td>
                          <td className="py-3 px-4 font-bold text-stone-900">৳{prod.discountedPrice || prod.regularPrice}</td>
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-sm text-stone-900">{prod.totalStock}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                              <button
                                onClick={() => updateProductStock(prod.id, Math.max(0, prod.totalStock - 1))}
                                className="px-2 py-0.5 text-xs font-bold bg-white text-stone-800 hover:bg-stone-200 rounded-lg shadow-2xs"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => updateProductStock(prod.id, prod.totalStock + 1)}
                                className="px-2 py-0.5 text-xs font-bold bg-white text-stone-800 hover:bg-stone-200 rounded-lg shadow-2xs"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => updateProductStock(prod.id, prod.totalStock + 10)}
                                className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-lg shadow-2xs"
                              >
                                +10
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                              prod.totalStock > 15 ? 'bg-emerald-50 text-emerald-800' : prod.totalStock > 0 ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {prod.totalStock > 15 ? 'Healthy' : prod.totalStock > 0 ? 'Low Stock' : 'Out of Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: COUPONS ================= */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">Discount Vouchers & Coupons</h1>
                  <p className="text-xs text-stone-500 mt-0.5">Create promotional codes for festive seasons and special marketing campaigns</p>
                </div>

                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map(coupon => (
                  <div key={coupon.id} className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-extrabold text-stone-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl tracking-wider">
                        {coupon.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        coupon.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-400'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-stone-700 font-medium">
                        Discount: <strong className="text-stone-900">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `৳${coupon.discountValue} Flat Discount`}
                        </strong>
                      </p>
                      <p className="text-stone-500">Min Order: ৳{coupon.minOrderValue.toLocaleString()}</p>
                      <p className="text-stone-500">Valid Until: {coupon.validUntil}</p>
                      <p className="text-stone-400 text-[11px]">Usage Count: {coupon.usageCount} checkouts</p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex justify-end">
                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete coupon ${coupon.code}?`)) {
                            await deleteCoupon(coupon.id);
                          }
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                      >
                        Delete Coupon
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 6: CUSTOMERS ================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">Customer Intelligence & Contacts</h1>
                <p className="text-xs text-stone-500 mt-0.5">Registered customer base, lifetime order value, and direct contact channels</p>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                      <tr>
                        <th className="py-3 px-4">Customer Name</th>
                        <th className="py-3 px-4">Phone Number</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">District</th>
                        <th className="py-3 px-4">Orders Placed</th>
                        <th className="py-3 px-4">Total Spent</th>
                        <th className="py-3 px-4 text-right">Quick Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {customerList.map((customer, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/70 transition">
                          <td className="py-3 px-4 font-bold text-stone-900">{customer.name}</td>
                          <td className="py-3 px-4 font-mono">{customer.phone}</td>
                          <td className="py-3 px-4 text-stone-500">{customer.email || 'N/A'}</td>
                          <td className="py-3 px-4">{customer.district}</td>
                          <td className="py-3 px-4 font-semibold">{customer.orderCount}</td>
                          <td className="py-3 px-4 font-extrabold text-stone-900">৳{customer.totalSpent.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <a
                              href={`https://wa.me/88${customer.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <a
                              href={`tel:${customer.phone}`}
                              className="inline-flex p-1.5 text-stone-700 hover:bg-stone-100 rounded-lg transition"
                              title="Call Customer"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">Store & Delivery Configuration</h1>
                <p className="text-xs text-stone-500 mt-0.5">Update branding, hotline, support email, studio address, shipping rates, and announcements</p>
              </div>

              {settingsSavedSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Store configuration successfully saved to Firestore and updated live on the storefront!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettingsSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Store Identity & Firebase Configuration
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-md font-mono">
                      Firebase: {settingsForm.firebaseProjectName || 'SK Shop'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Store Name</label>
                      <input
                        type="text"
                        value={settingsForm.storeName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Firebase Project Name</label>
                      <input
                        type="text"
                        value={settingsForm.firebaseProjectName || 'SK Shop'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, firebaseProjectName: e.target.value })}
                        placeholder="SK Shop"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl font-medium"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">Connected Firebase Instance: SK Shop (ai-studio-remixskshoppremi)</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Customer Hotline Phone</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Customer Support Email</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Official WhatsApp Number</label>
                      <input
                        type="text"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Physical Studio / Warehouse Address</label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Notification Day Email Settings */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Admin Notification Day Email (Daily Digest)
                    </h3>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md uppercase">
                      ALLOWED & ACTIVE
                    </span>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.adminDailyEmailEnabled ?? true}
                        onChange={(e) => setSettingsForm({ ...settingsForm, adminDailyEmailEnabled: e.target.checked })}
                        className="w-4 h-4 rounded-sm border-stone-300 text-stone-900"
                      />
                      <span>Allowed Admin Notification Day Email (Automated End-of-Day Orders & Sales Digest)</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Admin Notification Recipient Emails</label>
                        <input
                          type="text"
                          value={settingsForm.adminNotificationEmail || 'bnagladeshbodnaparty@gmail.com, skshopsaport@gmail.com'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adminNotificationEmail: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl font-mono text-[11px]"
                        />
                        <p className="text-[10px] text-stone-400 mt-1">Separate multiple emails with commas</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Notification Day Schedule</label>
                        <input
                          type="text"
                          value={settingsForm.adminNotificationDaySchedule || 'Daily at 8:00 PM (Bangladesh Time)'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adminNotificationDaySchedule: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl text-stone-800"
                        />
                        <p className="text-[10px] text-stone-400 mt-1">Daily summary dispatch timing</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-2">
                    Payment Method
                  </h3>
                  <div className="p-3.5 bg-stone-50 rounded-xl text-xs text-stone-600 border border-stone-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-stone-900">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">Active across all 64 districts in Bangladesh with doorstep parcel inspection.</p>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-lg">ACTIVE</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-2">
                    Courier Shipping Rates & Free Shipping Threshold (BDT ৳)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Inside Dhaka City Metro</label>
                      <input
                        type="number"
                        value={settingsForm.deliveryChargeDhaka}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryChargeDhaka: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Outside Dhaka City Metro</label>
                      <input
                        type="number"
                        value={settingsForm.deliveryChargeOutside}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryChargeOutside: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Free Shipping Order Threshold</label>
                      <input
                        type="number"
                        value={settingsForm.freeShippingThreshold}
                        onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-100 pb-2">
                    Header Top Announcement Bar
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.announcementBarActive}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcementBarActive: e.target.checked })}
                        className="w-4 h-4 rounded-sm border-stone-300 text-stone-900"
                      />
                      <span>Show top announcement bar to customers</span>
                    </label>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">Announcement Text (English)</label>
                      <input
                        type="text"
                        value={settingsForm.announcementBarText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcementBarText: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-stone-900 text-white font-bold rounded-xl hover:bg-amber-600 transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Settings to Firestore</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 8: ACTIVITY LOGS ================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">System & Activity Logs</h1>
                <p className="text-xs text-stone-500 mt-0.5">Audit trail of order lifecycle events, notifications, and administrative updates</p>
              </div>

              {/* Email Notification Status Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 text-stone-950 rounded-xl font-bold shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-stone-900 text-sm">Allowed Admin Notification Day Email (Active)</h4>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase">
                        Day Email Allowed
                      </span>
                    </div>
                    <p className="text-stone-600 mt-1">
                      Daily automated summary and instant order alerts are configured and dispatched daily at <strong>{settings.adminNotificationDaySchedule || '8:00 PM (Bangladesh Time)'}</strong> to authorized admin inboxes:
                    </p>
                    <p className="text-stone-600 mt-0.5">
                      Whenever a customer confirms an order, an automated email notification with order items, pricing, and shipping address is immediately dispatched to:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1.5 font-mono text-[11px]">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded-md border border-amber-300">
                        bnagladeshbodnaparty@gmail.com
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded-md border border-amber-300">
                        skshopsaport@gmail.com
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time Dispatch Ready</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs divide-y divide-stone-100">
                {notificationLogs.length === 0 ? (
                  <div className="p-12 text-center text-stone-400">
                    No activity logs recorded yet. Events will appear here automatically when orders are placed and processed.
                  </div>
                ) : (
                  notificationLogs.map((log) => {
                    const isEmail = log.type === 'email';
                    return (
                      <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isEmail ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {isEmail ? <Mail className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-stone-900">{log.title}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isEmail ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                              }`}>
                                {log.type}
                              </span>
                            </div>
                            <p className="text-stone-600 mt-1 leading-relaxed">{log.message}</p>
                            <span className="text-[10px] text-stone-400 mt-1 block">Recipient: {log.recipient}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: ORDER DETAILS & MANAGEMENT ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold font-serif text-base">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-stone-400">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-700 flex-1">
              {/* Customer & Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Customer Information</span>
                  <p className="font-bold text-stone-900 text-sm">{selectedOrder.customerName}</p>
                  <p className="text-stone-700">Phone: {selectedOrder.customerPhone}</p>
                  {selectedOrder.customerEmail && <p className="text-stone-500">Email: {selectedOrder.customerEmail}</p>}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Delivery Address</span>
                  <p className="text-stone-900 font-medium leading-relaxed">
                    {selectedOrder.deliveryAddress}, {selectedOrder.upazila ? `${selectedOrder.upazila}, ` : ''}{selectedOrder.district}
                  </p>
                  {selectedOrder.deliveryInstructions && (
                    <p className="text-[11px] text-amber-700 italic">Note: {selectedOrder.deliveryInstructions}</p>
                  )}
                </div>
              </div>

              {/* Status Update Control Card */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  Update Order Lifecycle Status & Assign Courier
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">New Status</label>
                    <select
                      value={statusChangeValue}
                      onChange={(e) => setStatusChangeValue(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Courier Partner</label>
                    <input
                      type="text"
                      list="courierOptions"
                      value={courierNameInput}
                      onChange={(e) => setCourierNameInput(e.target.value)}
                      placeholder="e.g. Steadfast Courier"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                    />
                    <datalist id="courierOptions">
                      {BANGLADESH_COURIERS.map((c, i) => (
                        <option key={i} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Tracking Code</label>
                    <input
                      type="text"
                      value={trackingCodeInput}
                      onChange={(e) => setTrackingCodeInput(e.target.value)}
                      placeholder="e.g. SF-948192"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Internal Staff Note</label>
                  <input
                    type="text"
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="e.g. Customer requested delivery after 3 PM"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleUpdateOrderStatus}
                    disabled={isUpdatingOrder}
                    className="px-5 py-2 bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isUpdatingOrder ? 'Saving...' : 'Apply Status Update'}</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">Ordered Items</span>
                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-12 object-cover rounded-md bg-stone-100"
                        />
                        <div>
                          <p className="font-semibold text-stone-900">{item.name}</p>
                          <p className="text-[11px] text-stone-400">
                            Size: {item.size} · Color: {item.color} · Qty: {item.quantity} · SKU: {item.sku}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span>৳{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charge:</span>
                  <span>৳{selectedOrder.shippingFee.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>-৳{selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-2 border-t border-stone-200">
                  <span>Total Amount:</span>
                  <span className="text-amber-700">৳{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedInvoiceOrder(selectedOrder);
                }}
                className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold font-serif text-base">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Fashion Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Product Title (English)</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Product Title (Bengali)</label>
                  <input
                    type="text"
                    value={prodForm.nameBn}
                    onChange={(e) => setProdForm({ ...prodForm, nameBn: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium"
                  >
                    <option value="panjabi">Panjabi & Ethnic</option>
                    <option value="saree">Sarees</option>
                    <option value="men">Men's Wear</option>
                    <option value="women">Women's Wear</option>
                    <option value="kids">Kids' Collection</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Keeping Unit (SKU)</label>
                  <input
                    type="text"
                    required
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.regularPrice}
                    onChange={(e) => setProdForm({ ...prodForm, regularPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discounted / Offer Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.discountedPrice}
                    onChange={(e) => setProdForm({ ...prodForm, discountedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Initial Total Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={prodForm.totalStock}
                    onChange={(e) => setProdForm({ ...prodForm, totalStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Subcategory / Collection Tag</label>
                  <input
                    type="text"
                    value={prodForm.subCategory}
                    onChange={(e) => setProdForm({ ...prodForm, subCategory: e.target.value })}
                    placeholder="e.g. Festive Silk"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Photo Upload from File Section */}
              <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-stone-900 text-xs uppercase tracking-wider">
                      Product Photos ({uploadedImages.length} uploaded)
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Upload high quality fashion photos directly from your device file browser.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                  >
                    {showUrlFallback ? 'Hide URL Input' : '+ Or Add by Image URL'}
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  multiple
                  onChange={handlePhotoFilesUpload}
                  className="hidden"
                />

                {/* Upload Button Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-5 text-center cursor-pointer bg-white transition hover:bg-amber-50/30 group"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-stone-900">
                    Click to Choose Photos from File
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Select multiple fashion pictures from your computer or phone (JPG, PNG, WEBP)
                  </p>
                </div>

                {/* Uploaded Photos Gallery Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {uploadedImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl border border-stone-200 overflow-hidden bg-white shadow-2xs aspect-[3/4] flex flex-col"
                      >
                        <img
                          src={imgUrl}
                          alt={`Uploaded photo ${idx + 1}`}
                          className="w-full h-full object-cover object-top"
                        />

                        {/* Photo Number / Cover Badge */}
                        <span className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          idx === 0
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-stone-900/80 text-stone-100'
                        }`}>
                          {idx === 0 ? 'Cover Photo' : `#${idx + 1}`}
                        </span>

                        {/* Action buttons overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetMainPhoto(idx)}
                              className="text-[9px] font-bold text-white bg-stone-800/90 hover:bg-amber-600 px-1.5 py-1 rounded transition cursor-pointer"
                              title="Set as main cover photo"
                            >
                              Set Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer ml-auto"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Fallback Textarea for Image URLs */}
                {showUrlFallback && (
                  <div className="pt-2 border-t border-stone-200 animate-fade-in">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Or paste direct image URLs (one URL per line)
                    </label>
                    <textarea
                      rows={2}
                      value={prodForm.imagesText}
                      onChange={(e) => setProdForm({ ...prodForm, imagesText: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-[11px] bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sizes (comma-separated)</label>
                  <input
                    type="text"
                    value={prodForm.sizesText}
                    onChange={(e) => setProdForm({ ...prodForm, sizesText: e.target.value })}
                    placeholder="S, M, L, XL, XXL"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Colors (e.g. Navy (#1E3A8A), White (#FFFFFF))</label>
                  <input
                    type="text"
                    value={prodForm.colorsText}
                    onChange={(e) => setProdForm({ ...prodForm, colorsText: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              {/* Badges toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={prodForm.isSale}
                    onChange={(e) => setProdForm({ ...prodForm, isSale: e.target.checked })}
                    className="w-4 h-4 rounded-sm"
                  />
                  <span>Mark as Sale</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={prodForm.isFeatured}
                    onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded-sm"
                  />
                  <span>Featured Collection</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    checked={prodForm.isAvailable}
                    onChange={(e) => setProdForm({ ...prodForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded-sm"
                  />
                  <span>Is Available</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 text-white font-bold rounded-xl hover:bg-amber-600 transition"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE COUPON ================= */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold font-serif text-base">Create Discount Voucher</h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCouponSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Promo Code (e.g. SKEID20)</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed BDT (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Minimum Order Value (৳)</label>
                <input
                  type="number"
                  required
                  value={couponForm.minOrderValue}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={couponForm.validUntil}
                  onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 text-white font-bold rounded-xl hover:bg-amber-600 transition"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= INVOICE PRINT MODAL ================= */}
      <AdminInvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
};
