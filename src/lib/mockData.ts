export interface ProductReview {
  author: string;
  rating: number;
  content: string;
}

export interface ProductSpecs {
  [key: string]: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  isNew: boolean;
  tag: string;
  image: string;
  inStock: boolean;
  description: string;
  images: string[];
  colors: string[];
  colorValues: string[];
  specs: ProductSpecs;
  reviewSummary?: string;
  reviews: ProductReview[];
}

export const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Starlight Automatic",
    brand: "CHRONOS",
    category: "Watches",
    price: 2450,
    originalPrice: 2880,
    rating: 5,
    ratingCount: 42,
    isNew: false,
    tag: "-15%",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop",
    inStock: true,
    description: "The Starlight Automatic is a testament to heritage horology. Featuring a highly precise self-winding Swiss automatic movement, 42-hour power reserve, and a breathtaking midnight blue dial enclosed in a robust brushed steel case.",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop",
    ],
    colors: ["Brushed Silver", "Midnight Gold"],
    colorValues: ["#d1d5db", "#fbbf24"],
    specs: {
      "Movement": "Swiss Automatic (Calibre SW200)",
      "Power Reserve": "42 Hours",
      "Case Diameter": "40mm",
      "Water Resistance": "100m (10 ATM)",
      "Glass": "Scratch-resistant Sapphire Crystal",
    },
    reviewSummary: "Customers consistently praise the Starlight Automatic for its outstanding build quality and mechanical reliability. Reviewers highly recommend the blue dial watch facet which gives it an exceptionally premium reflection under daylight.",
    reviews: [
      {
        author: "Marcus K.",
        rating: 5,
        content: "Outstanding weight and precision. Keeps perfect time and the skeleton back is beautiful to admire.",
      },
      {
        author: "Lara P.",
        rating: 5,
        content: "The blue dial catches the light beautifully. Very satisfied with my purchase.",
      }
    ],
  },
  {
    id: 2,
    name: "Meridian Tote",
    brand: "AETHEL",
    category: "Accessories",
    price: 1200,
    rating: 5,
    ratingCount: 18,
    isNew: true,
    tag: "NEW",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
    inStock: true,
    description: "Crafted in Florence from ultra-soft pebbled calfskin leather, the Meridian Tote represents everyday luxury. Unlined to highlight the natural beauty of the leather structure, it features a spacious interior and internal slip pocket.",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=600&auto=format&fit=crop",
    ],
    colors: ["Pebbled Taupe", "Sahara Tan", "Noir Black"],
    colorValues: ["#c2b2a2", "#d97706", "#09090b"],
    specs: {
      "Material": "100% Calfskin Leather",
      "Hardware": "Gold-finished Brass",
      "Dimensions": "32cm H x 40cm W x 15cm D",
      "Strap Drop": "24cm",
      "Origin": "Made in Italy",
    },
    reviewSummary: "Praised for its spacious design and supple leather grade. Customers report it acts as the perfect high-fashion carry-on or work bag, easily fitting a laptop and modern accessories without losing structure.",
    reviews: [
      {
        author: "Sarah J.",
        rating: 5,
        content: "The quality of the calfskin is unmatched. The structure is elegant and the size is absolutely perfect for daily use.",
      }
    ],
  },
  {
    id: 3,
    name: "Eclipse Drop Earrings",
    brand: "LUMINA",
    category: "Jewelry",
    price: 850,
    rating: 4,
    ratingCount: 95,
    isNew: false,
    tag: "",
    image: "https://images.unsplash.com/photo-1635767790028-3e9a53d6d24a?q=80&w=600&auto=format&fit=crop",
    inStock: true,
    description: "The Eclipse Drop Earrings showcase brilliant pave-set diamonds suspended from an 18-karat gold frame, designed to catch and reflect light with every movement.",
    images: [
      "https://images.unsplash.com/photo-1635767790028-3e9a53d6d24a?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop",
    ],
    colors: ["Yellow Gold", "White Gold"],
    colorValues: ["#eab308", "#f4f4f5"],
    specs: {
      "Metal": "18k Yellow Gold",
      "Stones": "VVS1 Branded Diamonds",
      "Total Carat Weight": "0.75 ctw",
      "Fastening": "Post and clutch backing",
      "Length": "1.8 cm",
    },
    reviewSummary: "Reviewed as extremely lightweight but eye-catching. Ideal for evening wear and formal affairs, matching clean gold chokers or necklaces.",
    reviews: [
      {
        author: "Emma R.",
        rating: 4,
        content: "Elegant earrings. They shine brilliantly, though I wish the posts were slightly longer.",
      }
    ],
  },
  {
    id: 4,
    name: "AuraBook Pro 16",
    brand: "AURATECH",
    category: "Laptops",
    price: 2499,
    rating: 4.8,
    ratingCount: 124,
    isNew: true,
    tag: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop",
    inStock: true,
    description: "Experience the pinnacle of performance with the AuraBook Pro 16. Engineered for professionals who demand the best, this powerhouse features the revolutionary Aura M3 Pro chip, delivering unprecedented speed and efficiency for the most demanding creative workflows. The stunning 16.2-inch Liquid Retina XDR display offers extreme dynamic range and incredible contrast ratio, making your content come to life with vivid detail and true-to-life colors. Whether you're editing 8K video, compiling code, or designing complex 3D models, the AuraBook Pro 16 is built to handle it all with ease.",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600&auto=format&fit=crop",
    ],
    colors: ["Space Silver", "Space Grey"],
    colorValues: ["#e2e8f0", "#334155"],
    specs: {
      "Processor": "Aura M3 Pro Chip (12-core CPU)",
      "Memory": "32GB Unified Memory",
      "Storage": "1TB SSD Storage",
      "Display": "16.2-inch Liquid Retina XDR",
    },
    reviewSummary: "Customers consistently praise the AuraBook Pro 16 for its exceptional battery life and stunning display. Most users find the performance more than adequate for professional creative workflows, though some note the weight as a consideration for travel.",
    reviews: [
      {
        author: "Sarah J.",
        rating: 5,
        content: "The best laptop I've ever owned. The screen is just incredible.",
      }
    ],
  },
  {
    id: 5,
    name: "Silence Pro Studio",
    brand: "AURATECH",
    category: "Accessories",
    price: 349,
    rating: 4.7,
    ratingCount: 55,
    isNew: true,
    tag: "NEW",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    inStock: true,
    description: "Designed for audio engineers and audiophiles, the Silence Pro Studio offers hybrid active noise cancelling, custom dynamic 40mm drivers, and plush memory foam cups for all-day mixing comfort.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?q=80&w=600&auto=format&fit=crop",
    ],
    colors: ["Space Black", "Alpine White"],
    colorValues: ["#18181b", "#fafafa"],
    specs: {
      "Drivers": "40mm Bio-Cellulose Dynamic",
      "ANC Depth": "Up to 45dB",
      "Battery Life": "40 Hours (ANC On)",
      "Connectivity": "Bluetooth 5.3 & 3.5mm Jack",
      "Audio Codec": "LDAC, AAC, SBC",
    },
    reviewSummary: "Highly reviewed for noise isolation and frequency response. Users love the studio-flat sound signature which makes EQ mixing very precise.",
    reviews: [
      {
        author: "David L.",
        rating: 5,
        content: "Zero fatigue even after 8 hours of mixing. Noise cancellation is remarkably natural.",
      }
    ],
  },
  {
    id: 6,
    name: "Prism Diamond Pendant",
    brand: "AETHEL",
    category: "Jewelry",
    price: 850,
    originalPrice: 1100,
    rating: 5,
    ratingCount: 12,
    isNew: false,
    tag: "Sale",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    inStock: true,
    description: "An elegant solitaire teardrop diamond pendant, suspended from a delicate 16-inch rope chain. Designed as a timeless minimal signature piece.",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop",
    ],
    colors: ["Rose Gold", "Platinum"],
    colorValues: ["#fda4af", "#cbd5e1"],
    specs: {
      "Chain Type": "16-inch Rope Chain (1.2mm width)",
      "Stone": "Round Brilliant cut VVS2 Diamond",
      "Carat Weight": "0.45 ctw",
      "Setting": "3-prong claw",
      "Clasp": "Lobster claw clasp",
    },
    reviewSummary: "Reviewed as the perfect anniversary gift. Customers mention the diamond reflects beautifully in ambient evening lighting.",
    reviews: [
      {
        author: "Christian P.",
        rating: 5,
        content: "Simply stunning. The teardrop shape is incredibly unique and minimal.",
      }
    ],
  },
  {
    id: 7,
    name: "Vanguard Smart Wallet",
    brand: "VANGUARD",
    category: "Accessories",
    price: 89,
    rating: 4.5,
    ratingCount: 34,
    isNew: false,
    tag: "",
    image: "https://images.unsplash.com/photo-1627124718515-4d3f31777d13?q=80&w=600&auto=format&fit=crop",
    inStock: true,
    description: "An aluminum-encased quick-access card ejection wallet wrapped in premium full-grain Italian leather. Includes integrated RFID shielding and tracking card pocket.",
    images: [
      "https://images.unsplash.com/photo-1627124718515-4d3f31777d13?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606503825008-01ad0e2c88f1?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620625515032-654877373be5?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600&auto=format&fit=crop",
    ],
    colors: ["Saddle Brown", "Carbon Black"],
    colorValues: ["#7c2d12", "#27272a"],
    specs: {
      "Capacity": "Holds up to 12 Cards",
      "Material": "Aviation-grade Aluminum & Leather",
      "Shielding": "RFID/NFC protection built-in",
      "Ejection Mechanism": "Quick-trigger button",
      "Weight": "72 grams",
    },
    reviewSummary: "Lauded for its compact profile and satisfying trigger mechanism. Reviewers appreciate that cards don't fall out even when shaken.",
    reviews: [
      {
        author: "Alex H.",
        rating: 5,
        content: "Sleek, secure, and card access is extremely snappy. Highly recommended.",
      }
    ],
  },
  {
    id: 8,
    name: "Nova Smart Ring Series 2",
    brand: "AURATECH",
    category: "Jewelry",
    price: 299,
    rating: 4.8,
    ratingCount: 20,
    isNew: false,
    tag: "",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
    inStock: false,
    description: "A lightweight titanium smart ring measuring heart rate, sleep quality, blood oxygen, and activity levels. Completely waterproof and fits standard sizes.",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1635767790028-3e9a53d6d24a?q=80&w=600&auto=format&fit=crop",
    ],
    colors: ["Titanium Silver", "Matte Gold"],
    colorValues: ["#94a3b8", "#ca8a04"],
    specs: {
      "Material": "Fighter-jet grade Titanium",
      "Sensors": "Optical PPG, Accelerometer, Gyroscope",
      "Battery Life": "7 Days per charge",
      "Waterproofing": "IP68 / 50m Depth",
      "Width": "8mm",
    },
    reviewSummary: "Acclaimed as the most comfortable sleep tracker available. Customers report the battery easily lasts a full week and charges in under 45 minutes.",
    reviews: [
      {
        author: "Tyler W.",
        rating: 5,
        content: "Infinitely better than wearing a bulky smartwatch to bed. Heart rate tracking is spot on.",
      }
    ],
  },
  {
    id: 9,
    name: "Oud & Bergamot Extrait",
    brand: "MAISON",
    category: "Accessories",
    price: 185,
    rating: 4.6,
    ratingCount: 15,
    isNew: false,
    tag: "",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop",
    inStock: true,
    description: "An intense extrait de parfum blending dark, smoky wood notes of agarwood (oud) with the crisp, zesty freshness of Italian bergamot.",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615655404704-2f2b262f27a7?q=80&w=600&auto=format&fit=crop",
    ],
    colors: ["Classic Amber"],
    colorValues: ["#d97706"],
    specs: {
      "Concentration": "Extrait de Parfum (28%)",
      "Top Notes": "Italian Bergamot, Sweet Orange",
      "Heart Notes": "Smoky Oud, Vetiver",
      "Base Notes": "Sandalwood, Ambergris",
      "Volume": "100ml / 3.4 fl oz",
    },
    reviewSummary: "Noted for its exceptionally long sillage and unique fresh-smoky duality. Customers mention it stays active on fabric for multiple days.",
    reviews: [
      {
        author: "Sophie B.",
        rating: 5,
        content: "A masterpiece. The contrast between citrus and heavy wood is perfectly balanced. Projects like a dream.",
      }
    ],
  }
];

export interface CartItem {
  productId: string | number;
  id: string | number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  specsText: string;
}

export interface RecommendedProduct {
  id: number;
  name: string;
  price: number;
  image: string;
}

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    productId: "201",
    id: 201,
    name: "AuraBook Pro 14\"",
    brand: "AURATECH",
    price: 1299,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop",
    quantity: 1,
    specsText: "Space Gray • M3 Pro • 1TB SSD • 18GB RAM",
  },
  {
    productId: "202",
    id: 202,
    name: "Aura Noise-Cancelling Headphones",
    brand: "AURATECH",
    price: 249,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    quantity: 1,
    specsText: "Matte Black • Wireless • Over-Ear",
  },
  {
    productId: "203",
    id: 203,
    name: "Minimalist Leather Desk Mat",
    brand: "AURATECH",
    price: 45,
    image: "https://images.unsplash.com/photo-1627124718515-4d3f31777d13?q=80&w=600&auto=format&fit=crop",
    quantity: 2,
    specsText: "Warm Taupe • Large (90×40cm) • Vegan Leather",
  },
];

export const RECOMMENDED_PRODUCTS: RecommendedProduct[] = [
  {
    id: 301,
    name: "Aura MagCharge Stand",
    price: 89,
    image: "https://images.unsplash.com/photo-1622445262465-2481c857535a?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 302,
    name: "Low-Profile Mechanical Keyboard",
    price: 149,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 303,
    name: "Aura Ergonomic Chair",
    price: 599,
    image: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 304,
    name: "AuraDisplay 27\" 4K",
    price: 699,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop",
  },
];

