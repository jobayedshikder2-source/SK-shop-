import { Product, StoreSettings, Coupon, Banner } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-panjabi-01',
    name: "Royal Navy Embroidered Semi-Silk Panjabi",
    nameBn: "রয়্যাল নেভি এমব্রয়ডারি সেমি-সিল্ক পাঞ্জাবি",
    description: "Crafted with premium blended silk-cotton fabric featuring intricate metallic embroidery on collar, placket, and cuffs. Perfect for Eid, weddings, and formal evening gatherings.",
    descriptionBn: "প্রিমিয়াম ব্লেন্ডেড সিল্ক-কটন ফেব্রিক এবং কলার ও বোতাম পট্টিতে নিখুঁত কারচুপির কাজ। ঈদ, বিয়ে ও বিশেষ অনুষ্ঠানের জন্য আভিজাত্যের প্রতীক।",
    category: 'panjabi',
    subCategory: "Men's Ethnic",
    sku: "SK-PANJ-001",
    regularPrice: 2850,
    discountedPrice: 2290,
    isSale: true,
    isFeatured: true,
    isBestSeller: true,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80"
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Royal Navy', hex: '#1B2A4A' },
      { name: 'Midnight Black', hex: '#111827' },
      { name: 'Pure White', hex: '#FFFFFF' }
    ],
    totalStock: 35,
    fabricInfo: "70% Fine Silk, 30% Egyptian Combed Cotton",
    careInstructions: "Dry clean recommended or gentle hand wash in cold water with mild detergent.",
    rating: 4.9,
    reviewCount: 38,
    createdAt: "2026-10-01T10:00:00Z"
  },
  {
    id: 'prod-saree-01',
    name: "Dhakai Handloom Jamdani Saree (84 Count)",
    nameBn: "ঢাকাই তাঁতের জামদানি শাড়ি (৮৪ কাউন্ট)",
    description: "Authentic handloom Jamdani saree woven by master artisans in Narayanganj. Features traditional floral 'Golap Buti' motifs with subtle golden zari borders.",
    descriptionBn: "নারায়ণগঞ্জের ঐতিহ্যবাহী তাঁতশিল্পীদের হাতে বোনা খাঁটি জামদানি শাড়ি। চমৎকার গোলাপ বুটি নকশা এবং সোনালি জরি পাড়।",
    category: 'saree',
    subCategory: "Women's Ethnic",
    sku: "SK-SAR-001",
    regularPrice: 6500,
    discountedPrice: 5200,
    isSale: true,
    isFeatured: true,
    isBestSeller: true,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80"
    ],
    sizes: ['Free Size (12 Haat)'],
    colors: [
      { name: 'Crimson Red', hex: '#991B1B' },
      { name: 'Emerald Green', hex: '#065F46' },
      { name: 'Dusty Pink', hex: '#F472B6' }
    ],
    totalStock: 18,
    fabricInfo: "100% Pure Fine Cotton & Metallic Zari",
    careInstructions: "Dry clean only. Roll fold carefully in cotton bag.",
    rating: 5.0,
    reviewCount: 24,
    createdAt: "2026-10-02T11:00:00Z"
  },
  {
    id: 'prod-women-shalwar-01',
    name: "Pastel Lavender Embroidered 3-Piece Georgette Suit",
    nameBn: "প্যাস্টেল ল্যাভেন্ডার এমব্রয়ডারি থ্রি-পিস সেট",
    description: "Exquisite Pakistani silhouette with heavy sequence embroidery on Kameez, comfortable straight-cut trouser with organza lace borders, and chiffon digital dupatta.",
    descriptionBn: "কামিজের জমিনে জমকালো সুতা ও সিকোয়েন্সের কাজ, অরগাঞ্জা লেসের ট্রাউজার এবং সফট শিফন প্রিন্ট ওড়না।",
    category: 'women',
    subCategory: "Three Piece",
    sku: "SK-3PC-001",
    regularPrice: 3800,
    discountedPrice: 3150,
    isSale: true,
    isFeatured: true,
    isBestSeller: false,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80"
    ],
    sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
    colors: [
      { name: 'Lavender Mist', hex: '#C084FC' },
      { name: 'Mint Sage', hex: '#6EE7B7' }
    ],
    totalStock: 22,
    fabricInfo: "Pure Fox Georgette with Malai Silk inner & Chiffon Dupatta",
    careInstructions: "Dry clean recommended. Cool iron on reverse side.",
    rating: 4.8,
    reviewCount: 19,
    createdAt: "2026-10-03T12:00:00Z"
  },
  {
    id: 'prod-men-shirt-01',
    name: "Classic Oxford 100% Egyptian Cotton Formal Shirt",
    nameBn: "ক্লাসিক অক্সফোর্ড ১০০% মিশরীয় কটন ফর্মাল শার্ট",
    description: "Tailored slim-fit executive shirt with button-down collar, mother-of-pearl buttons, and wrinkle-resistant breathable weave for Bangladesh climate.",
    descriptionBn: "অফিস ও মিটিংয়ের জন্য মার্জিত স্লিম-ফিট ফর্মাল শার্ট। হাই-কোয়ালিটি কটন সুতা, আরামদায়ক ও দীর্ঘস্থায়ী।",
    category: 'men',
    subCategory: "Formal Shirts",
    sku: "SK-SHT-001",
    regularPrice: 1850,
    discountedPrice: 1450,
    isSale: true,
    isFeatured: false,
    isBestSeller: true,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80"
    ],
    sizes: ['15 (M)', '15.5 (L)', '16 (XL)', '16.5 (XXL)'],
    colors: [
      { name: 'Sky Blue', hex: '#BAE6FD' },
      { name: 'Crisp White', hex: '#FFFFFF' },
      { name: 'Light Ash', hex: '#E5E7EB' }
    ],
    totalStock: 40,
    fabricInfo: "100% Combed 60s Compact Oxford Cotton",
    careInstructions: "Machine wash warm, tumble dry low, warm iron.",
    rating: 4.7,
    reviewCount: 42,
    createdAt: "2026-10-04T13:00:00Z"
  },
  {
    id: 'prod-men-polo-01',
    name: "Luxury Pique Cotton Signature Polo T-Shirt",
    nameBn: "লাক্সারি পিক কটন সিগনেচার পোলো টি-শার্ট",
    description: "Heavyweight 240 GSM organic pique polo featuring embroidered crest logo, tipped rib collar, and vented hem for all-day weekend elegance.",
    descriptionBn: "২৪০ জিএসএম প্রিমিয়াম নিট কটন। কালার গ্যারান্টি, টেকসই কলার ও আরামদায়ক কাটিং।",
    category: 'men',
    subCategory: "Polo & Casual",
    sku: "SK-POLO-001",
    regularPrice: 1250,
    discountedPrice: 990,
    isSale: true,
    isFeatured: true,
    isBestSeller: true,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80"
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Olive Green', hex: '#3F6212' },
      { name: 'Burgundy Maroon', hex: '#831843' },
      { name: 'Navy Blue', hex: '#1E3A8A' }
    ],
    totalStock: 50,
    fabricInfo: "95% Organic Combed Cotton, 5% Lycra Pique",
    careInstructions: "Machine wash cold with like colors. Do not bleach.",
    rating: 4.9,
    reviewCount: 65,
    createdAt: "2026-10-05T14:00:00Z"
  },
  {
    id: 'prod-women-kurti-01',
    name: "Botanical Print Summer Cotton Tunic Kurti",
    nameBn: "বোটানিক্যাল প্রিন্ট কটন সামার কুর্তি",
    description: "Breathable airy everyday tunic with side slits, Mandarin band collar, and wooden button accenting. Ideal for university, office, and casual day-outs.",
    descriptionBn: "হালকা ও মনোরম সুতি ফেব্রিকের আধুনিক ডিজাইনের কুর্তি। সহজে পরিধেয় ও মানানসই।",
    category: 'women',
    subCategory: "Kurti & Tunics",
    sku: "SK-KURT-001",
    regularPrice: 1550,
    discountedPrice: 1190,
    isSale: false,
    isFeatured: true,
    isBestSeller: false,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
    ],
    sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    colors: [
      { name: 'Coral Ochre', hex: '#EA580C' },
      { name: 'Teal Blue', hex: '#0D9488' }
    ],
    totalStock: 30,
    fabricInfo: "100% Voile Soft Cotton",
    careInstructions: "Machine wash cold, air dry in shade.",
    rating: 4.8,
    reviewCount: 28,
    createdAt: "2026-10-06T15:00:00Z"
  },
  {
    id: 'prod-men-denim-01',
    name: "Ultra-Stretch Vintage Indigo Denim Jeans",
    nameBn: "আল্ট্রা-স্ট্রেচ ভিন্টেজ ইন্ডিগো ডেনিম জিন্স",
    description: "Engineered with 12 oz authentic selvedge-look denim with 3% dualFX elastane for unbeatable mobility, fade-resistant wash, and heavy-duty YKK copper hardware.",
    descriptionBn: "অরিজিনাল ইন্ডিগো ওয়াশ ও আল্ট্রা-স্ট্রেচ ফেব্রিক। আরামদায়ক ফিটিং এবং সারাদিনের ব্যবহারের উপযোগী।",
    category: 'men',
    subCategory: "Pants & Trousers",
    sku: "SK-DNM-001",
    regularPrice: 2200,
    discountedPrice: 1750,
    isSale: true,
    isFeatured: false,
    isBestSeller: true,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80"
    ],
    sizes: ['30', '32', '34', '36', '38'],
    colors: [
      { name: 'Dark Indigo', hex: '#1E293B' },
      { name: 'Washed Grey', hex: '#4B5563' }
    ],
    totalStock: 32,
    fabricInfo: "97% Ring-spun Denim Cotton, 3% Elastane",
    careInstructions: "Wash inside out with cold water. Avoid high heat dryer.",
    rating: 4.9,
    reviewCount: 51,
    createdAt: "2026-10-07T16:00:00Z"
  },
  {
    id: 'prod-kids-panjabi-01',
    name: "Junior Festive Cotton Panjabi & Pajama Set",
    nameBn: "জুনিয়র উৎসব কটন পাঞ্জাবি ও পায়জামা সেট",
    description: "Hypoallergenic soft combed cotton ensemble for boys aged 2-12 years. Features cute minimalistic embroidery, snap-button closure, and elastic waistband pajama.",
    descriptionBn: "বাচ্চাদের কোমল ত্বকের উপযোগী শতভাগ সুতি পাঞ্জাবি ও পায়জামা সেট। সহজে খোলার জন্য স্ন্যাপ বোতাম ও আরামদায়ক কাটিং।",
    category: 'kids',
    subCategory: "Kids' Ethnic",
    sku: "SK-KID-001",
    regularPrice: 1650,
    discountedPrice: 1290,
    isSale: true,
    isFeatured: true,
    isBestSeller: false,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80"
    ],
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-12Y'],
    colors: [
      { name: 'Mustard Yellow', hex: '#EAB308' },
      { name: 'Sky Turquoise', hex: '#06B6D4' }
    ],
    totalStock: 25,
    fabricInfo: "100% Super-soft Washed Cotton",
    careInstructions: "Hand wash or gentle cycle. Mild detergent.",
    rating: 4.8,
    reviewCount: 16,
    createdAt: "2026-10-08T17:00:00Z"
  },
  {
    id: 'prod-acc-wallet-01',
    name: "Full Grain Buffalo Leather Bi-Fold Wallet & Belt Set",
    nameBn: "ফুল গ্রেইন লেদার মানিব্যাগ ও বেল্ট গিফট কম্বো",
    description: "Handcrafted in Hazaribagh, Dhaka with premium vegetable-tanned full grain leather. Features RFID shielding, 8 card slots, and dual currency compartments.",
    descriptionBn: "শতভাগ খাঁটি চামড়ার তৈরি প্রিমিয়াম মানিব্যাগ ও বেল্ট কম্বো। উপহার দেওয়ার জন্য আকর্ষণীয় লাক্সারি বক্স সহ।",
    category: 'accessories',
    subCategory: "Leather Goods",
    sku: "SK-ACC-001",
    regularPrice: 1950,
    discountedPrice: 1490,
    isSale: false,
    isFeatured: true,
    isBestSeller: true,
    isAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
    ],
    sizes: ['Standard Size (Belt 32-42 inch)'],
    colors: [
      { name: 'Cognac Tan', hex: '#78350F' },
      { name: 'Classic Black', hex: '#000000' }
    ],
    totalStock: 45,
    fabricInfo: "100% Genuine Full Grain Bangladeshi Leather",
    careInstructions: "Wipe with leather conditioner. Keep dry.",
    rating: 5.0,
    reviewCount: 33,
    createdAt: "2026-10-09T18:00:00Z"
  }
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: "SK Shop",
  storeNameBn: "এসকে শপ",
  tagline: "Fashion for Everyone - Exclusive Clothing in Bangladesh",
  taglineBn: "সবার জন্য ফ্যাশন - এক্সক্লুসিভ ক্লোথিং বাংলাদেশ",
  phone: "01781822686",
  email: "skshopsaport@gmail.com",
  address: "Ashulia, Savar, Dhaka, Bangladesh",
  deliveryChargeDhaka: 70,
  deliveryChargeOutside: 130,
  freeShippingThreshold: 2000,
  announcementBarText: "🎉 Special Eid & Summer Offer! Hotline: 01781822686 | Free Shipping above ৳2,000",
  announcementBarTextBn: "🎉 বিশেষ অফার! হটলাইন: ০১৭৮১৮২২৬৮৬ | ২,০০০ টাকার অর্ডারে ফ্রি ডেলিভারি",
  announcementBarActive: true,
  whatsappNumber: "+8801781822686",
  logoUrl: "/assets/aistudio/file_0000000025048211bceee5b5025f840e_6a06dbdd.png",
  facebookUrl: "https://facebook.com/skshopbd",
  instagramUrl: "https://instagram.com/skshopbd",
  youtubeUrl: "https://youtube.com/@skshopbd",
  firebaseProjectName: "SK Shop",
  adminDailyEmailEnabled: true,
  adminNotificationEmail: "bnagladeshbodnaparty@gmail.com, skshopsaport@gmail.com",
  adminNotificationDaySchedule: "Daily at 8:00 PM (Bangladesh Time)"
};

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-skeid15',
    code: 'SKEID15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 1500,
    maxDiscount: 600,
    validUntil: '2026-12-31',
    isActive: true,
    usageCount: 142
  },
  {
    id: 'cpn-welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1000,
    maxDiscount: 400,
    validUntil: '2026-12-31',
    isActive: true,
    usageCount: 289
  },
  {
    id: 'cpn-freeship',
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 130,
    minOrderValue: 1200,
    validUntil: '2026-12-31',
    isActive: true,
    usageCount: 88
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    title: 'Festive Grandeur 2026',
    titleBn: 'উৎসবের আভিজাত্য ২০২৬',
    subtitle: 'Embroidered Silk Panjabis, Dhakai Jamdanis & Designer Ethnic Sets',
    subtitleBn: 'এমব্রয়ডারি করা সিল্ক পাঞ্জাবি, ঢাকাই জামদানি এবং অভিজাত এথনিক কালেকশন',
    badge: 'NEW ARRIVALS',
    buttonText: 'Explore Collection',
    buttonLink: '/shop?category=panjabi',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80',
    active: true,
    order: 1
  },
  {
    id: 'banner-2',
    title: 'Pure Jamdani & Silk Elegance',
    titleBn: 'খাঁটি জামদানি ও সিল্কের মোহময় রূপ',
    subtitle: 'Hand-woven heritage sarees reflecting centuries of Bengal craftsmanship',
    subtitleBn: 'বাঙালির শত বছরের ঐতিহ্যবাহী তাঁতের নিখুঁত কারুকাজ',
    badge: 'AUTHENTIC HANDLOOM',
    buttonText: 'Shop Sarees',
    buttonLink: '/shop?category=saree',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
    active: true,
    order: 2
  },
  {
    id: 'banner-3',
    title: 'Summer Casuals & Premium Denim',
    titleBn: 'সামার ক্যাজুয়াল ও প্রিমিয়াম ডেনিম',
    subtitle: '100% Breathable cotton oxford shirts, luxury pique polos & stretch jeans',
    subtitleBn: 'আরামদায়ক কটন শার্ট, পোলো ও স্টাইলিশ জিন্স',
    badge: 'SUMMER SPECIAL',
    buttonText: 'Discover Casuals',
    buttonLink: '/shop?category=men',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    active: true,
    order: 3
  }
];
