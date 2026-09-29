import iphone15Pro from "@/assets/products/iphone-15-pro.jpg";
import iphone13 from "@/assets/products/iphone-13.jpg";
import iphone12 from "@/assets/products/iphone-12.jpg";
import s24Ultra from "@/assets/products/galaxy-s24-ultra.jpg";
import a55 from "@/assets/products/galaxy-a55.jpg";
import pixel9Pro from "@/assets/products/pixel-9-pro.jpg";
import camon30 from "@/assets/products/tecno-camon-30.jpg";
import note40Pro from "@/assets/products/infinix-note-40-pro.jpg";
import gt20Pro from "@/assets/products/infinix-gt-20-pro.jpg";
import xiaomi14 from "@/assets/products/xiaomi-14.jpg";
import redmiNote13Pro from "@/assets/products/redmi-note-13-pro.jpg";
import reno12 from "@/assets/products/oppo-reno-12.jpg";
import oneplus12 from "@/assets/products/oneplus-12.jpg";
import nokiaG42 from "@/assets/products/nokia-g42.jpg";
import accCase from "@/assets/products/acc-case.jpg";
import accScreen from "@/assets/products/acc-screen-protector.jpg";
import accCharger from "@/assets/products/acc-charger.jpg";
import accCable from "@/assets/products/acc-cable.jpg";
import accPowerbank from "@/assets/products/acc-powerbank.jpg";
import accEarbuds from "@/assets/products/acc-earbuds.jpg";
import accWatch from "@/assets/products/acc-smartwatch.jpg";

export type Condition = "Brand New" | "Refurbished" | "Pre-owned";
export type Network = "4G" | "5G";
export type OS = "iOS" | "Android" | "—";
export type ProductKind = "phone" | "accessory";

export type CategorySlug =
  | "iphone"
  | "android"
  | "flagship"
  | "budget"
  | "gaming"
  | "5g"
  | "refurbished"
  | "accessories";

export type AccessoryType =
  | "Phone cases"
  | "Screen protectors"
  | "Chargers"
  | "USB cables"
  | "Power banks"
  | "Earphones"
  | "Smart watches";

export interface Product {
  id: string;
  slug: string;
  kind: ProductKind;
  brand: string;
  model: string;
  name: string;
  categories: CategorySlug[];
  accessoryType?: AccessoryType;
  storage: string;
  storageOptions: string[];
  ram: string;
  network: Network;
  os: OS;
  condition: Condition;
  price: number;
  originalPrice?: number;
  images: string[];
  colors: string[];
  display: string;
  camera: string;
  battery: string;
  charging: string;
  processor: string;
  dimensions: string;
  warranty: string;
  inBox: string[];
  description: string;
  stock: number;
  soldOut?: boolean;
  popularity: number;
  createdAt: string;
  featured?: boolean;
}

export const BRANDS = [
  "Apple",
  "Samsung",
  "Google Pixel",
  "Tecno",
  "Infinix",
  "Xiaomi",
  "Oppo",
  "OnePlus",
  "Nokia",
  "Redmi",
];

export const CATEGORIES: { slug: CategorySlug; label: string; hint: string }[] = [
  { slug: "iphone", label: "iPhone", hint: "from KSh 42,000" },
  { slug: "android", label: "Android Phones", hint: "from KSh 22,000" },
  { slug: "flagship", label: "Flagship Phones", hint: "top spec" },
  { slug: "budget", label: "Budget Phones", hint: "value picks" },
  { slug: "gaming", label: "Gaming Phones", hint: "high FPS" },
  { slug: "5g", label: "5G Phones", hint: "network ready" },
  { slug: "refurbished", label: "Refurbished Phones", hint: "certified" },
  { slug: "accessories", label: "Phone Accessories", hint: "cases · chargers" },
];

export const ACCESSORY_TYPES: AccessoryType[] = [
  "Phone cases",
  "Screen protectors",
  "Chargers",
  "USB cables",
  "Power banks",
  "Earphones",
  "Smart watches",
];

const phone = (
  p: Omit<Product, "kind" | "name" | "slug" | "id"> & { id?: string },
): Product => {
  const name = `${p.model}`;
  const slug = `${p.brand} ${p.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return { ...p, id: p.id ?? slug, kind: "phone", name, slug };
};

const accessory = (
  p: Omit<
    Product,
    | "kind"
    | "name"
    | "slug"
    | "id"
    | "storageOptions"
    | "ram"
    | "os"
    | "display"
    | "camera"
    | "battery"
    | "charging"
    | "processor"
    | "dimensions"
    | "network"
    | "storage"
    | "categories"
  > &
    Partial<Pick<Product, "battery" | "charging" | "dimensions" | "display" | "storage">>,
): Product => {
  const slug = `${p.brand} ${p.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return {
    storage: "—",
    storageOptions: [],
    ram: "—",
    network: "4G",
    os: "—",
    display: "—",
    camera: "—",
    battery: "—",
    charging: "—",
    processor: "—",
    dimensions: "—",
    categories: ["accessories"],
    ...p,
    id: slug,
    kind: "accessory",
    name: p.model,
    slug,
  };
};

export const SEED_PRODUCTS: Product[] = [
  phone({
    brand: "Apple",
    model: "iPhone 15 Pro",
    categories: ["iphone", "flagship", "5g"],
    storage: "256GB",
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
    ram: "8GB",
    network: "5G",
    os: "iOS",
    condition: "Brand New",
    price: 105000,
    originalPrice: 120000,
    images: [iphone15Pro],
    colors: ["Black Titanium", "Natural Titanium", "Blue Titanium", "White Titanium"],
    display: '6.1" Super Retina XDR OLED, 120Hz ProMotion',
    camera: "48MP main + 12MP ultra-wide + 12MP 3x telephoto · 12MP front",
    battery: "3,274 mAh",
    charging: "27W wired · 15W MagSafe",
    processor: "Apple A17 Pro",
    dimensions: "146.6 × 70.6 × 8.25 mm · 187g",
    warranty: "12 months Market Rise warranty",
    inBox: ["iPhone 15 Pro", "USB-C to USB-C cable", "Documentation", "SIM ejector"],
    description:
      "The iPhone 15 Pro brings a light titanium design, the customizable Action button and the A17 Pro chip — the fastest ever in a smartphone. Pro camera system with 48MP main sensor and USB-C with USB 3 speeds.",
    stock: 6,
    popularity: 98,
    createdAt: "2026-08-20",
    featured: true,
  }),
  phone({
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    categories: ["android", "flagship", "5g", "gaming"],
    storage: "512GB",
    storageOptions: ["256GB", "512GB", "1TB"],
    ram: "12GB",
    network: "5G",
    os: "Android",
    condition: "Brand New",
    price: 178000,
    originalPrice: 193000,
    images: [s24Ultra],
    colors: ["Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"],
    display: '6.8" Dynamic AMOLED 2X, QHD+, 120Hz',
    camera: "200MP main + 50MP 5x periscope + 10MP 3x + 12MP UW · 12MP front",
    battery: "5,000 mAh",
    charging: "45W wired · 15W wireless",
    processor: "Snapdragon 8 Gen 3 for Galaxy",
    dimensions: "162.3 × 79 × 8.6 mm · 232g",
    warranty: "12 months Market Rise warranty",
    inBox: ["Galaxy S24 Ultra", "S Pen (built-in)", "USB-C cable", "SIM ejector"],
    description:
      "Galaxy AI meets a titanium frame and the flattest, brightest Samsung display yet. Built-in S Pen, 200MP camera and seven years of updates make it the ultimate Android flagship.",
    stock: 4,
    popularity: 95,
    createdAt: "2026-08-15",
    featured: true,
  }),
  phone({
    brand: "OnePlus",
    model: "OnePlus 12",
    categories: ["android", "flagship", "5g", "gaming"],
    storage: "256GB",
    storageOptions: ["256GB", "512GB"],
    ram: "12GB",
    network: "5G",
    os: "Android",
    condition: "Brand New",
    price: 92000,
    originalPrice: 108000,
    images: [oneplus12],
    colors: ["Flowy Emerald", "Silky Black"],
    display: '6.82" LTPO AMOLED, 2K, 120Hz, 4500 nits',
    camera: "50MP Hasselblad main + 64MP 3x periscope + 48MP UW · 32MP front",
    battery: "5,400 mAh",
    charging: "100W SUPERVOOC · 50W wireless",
    processor: "Snapdragon 8 Gen 3",
    dimensions: "164.3 × 75.8 × 9.2 mm · 220g",
    warranty: "12 months Market Rise warranty",
    inBox: ["OnePlus 12", "100W SUPERVOOC charger", "USB-C cable", "Protective case"],
    description:
      "Flagship power with the fastest charging in its class. A 2K ProXDR display, Hasselblad cameras and a 5,400 mAh battery that lasts all day and refills in under 30 minutes.",
    stock: 7,
    popularity: 90,
    createdAt: "2026-08-10",
    featured: true,
  }),
  phone({
    brand: "Google Pixel",
    model: "Pixel 9 Pro",
    categories: ["android", "flagship", "5g"],
    storage: "256GB",
    storageOptions: ["128GB", "256GB", "512GB"],
    ram: "16GB",
    network: "5G",
    os: "Android",
    condition: "Brand New",
    price: 118000,
    images: [pixel9Pro],
    colors: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"],
    display: '6.3" Super Actua LTPO OLED, 120Hz',
    camera: "50MP main + 48MP UW + 48MP 5x telephoto · 42MP front",
    battery: "4,700 mAh",
    charging: "27W wired · 21W wireless",
    processor: "Google Tensor G4",
    dimensions: "152.8 × 72 × 8.5 mm · 199g",
    warranty: "12 months Market Rise warranty",
    inBox: ["Pixel 9 Pro", "USB-C cable", "Quick switch adapter", "SIM tool"],
    description:
      "The smartest Pixel yet, with Gemini built in, a pro triple-camera system and 7 years of OS updates. Best-in-class computational photography.",
    stock: 5,
    popularity: 88,
    createdAt: "2026-09-01",
    featured: true,
  }),
  phone({
    brand: "Xiaomi",
    model: "Xiaomi 14",
    categories: ["android", "flagship", "5g"],
    storage: "512GB",
    storageOptions: ["256GB", "512GB"],
    ram: "12GB",
    network: "5G",
    os: "Android",
    condition: "Brand New",
    price: 89000,
    originalPrice: 99000,
    images: [xiaomi14],
    colors: ["Black", "White", "Jade Green"],
    display: '6.36" LTPO AMOLED, 1.5K, 120Hz',
    camera: "50MP Leica main + 50MP 3.2x telephoto + 50MP UW · 32MP front",
    battery: "4,610 mAh",
    charging: "90W HyperCharge · 50W wireless",
    processor: "Snapdragon 8 Gen 3",
    dimensions: "152.8 × 71.5 × 8.2 mm · 193g",
    warranty: "12 months Market Rise warranty",
    inBox: ["Xiaomi 14", "90W charger", "USB-C cable", "Clear case"],
    description:
      "Compact flagship with Leica Summilux optics and a razor-sharp 1.5K display. Powerful, pocketable and beautifully finished.",
    stock: 3,
    popularity: 84,
    createdAt: "2026-07-28",
  }),
  phone({
    brand: "Samsung",
    model: "Galaxy A55",
    categories: ["android", "5g", "budget"],
    storage: "256GB",
    storageOptions: ["128GB", "256GB"],
    ram: "8GB",
    network: "5G",
    os: "Android",
    condition: "Brand New",
    price: 45000,
    originalPrice: 49500,
    images: [a55],
    colors: ["Awesome Navy", "Awesome Iceblue", "Awesome Lilac"],
    display: '6.6" Super AMOLED FHD+, 120Hz',
    camera: "50MP main + 12MP UW + 5MP macro · 32MP front",
    battery: "5,000 mAh",
    charging: "25W wired",
    processor: "Exynos 1480",
    dimensions: "161.1 × 77.4 × 8.2 mm · 213g",
    warranty: "12 months Market Rise warranty",
    inBox: ["Galaxy A55", "USB-C cable", "SIM ejector"],
    description:
      "Premium metal frame, a gorgeous 120Hz AMOLED display and IP67 water resistance in a mid-range phone with four years of OS updates.",
    stock: 12,
    popularity: 86,
    createdAt: "2026-08-05",
    featured: true,
  }),
  phone({
    brand: "Tecno",
    model: "Camon 30",
    categories: ["android", "budget", "5g"],
    storage: "256GB",
    storageOptions: ["256GB"],
    ram: "8GB",
    network: "5G",
    os: "Android",
    condition: "Brand New",
    price: 28500,
    originalPrice: 32000,
    images: [camon30],
    colors: ["Uyuni Salt White", "Basaltic Dark", "Iceland Basaltic"],
    display: '6.78" AMOLED FHD+, 120Hz',
    camera: "50MP Sony main + 2MP depth · 50MP front",
    battery: "5,000 mAh",
    charging: "70W Ultra Charge",
    processor: "MediaTek Dimensity 7020",
    dimensions: "164.6 × 75.6 × 7.7 mm · 187g",
    warranty: "12 months Market Rise warranty",
    inBox: ["Camon 30", "70W charger", "USB-C cable", "Case", "Earphones"],
    description:
      "Kenya's favourite camera phone: 50MP front and rear Sony sensors, a bright 120Hz AMOLED and 70W charging at an unbeatable price.",
    stock: 20,
    popularity: 92,
    createdAt: "2026-08-25",
    featured: true,
  }),
  phone({
    brand: "Infinix",
    model: "Note 40 Pro",
    categories: ["android", "budget"],
    storage: "256GB",
    storageOptions: ["256GB"],
    ram: "12GB",
    network: "4G",
    os: "Android",
    condition: "Brand New",
    price: 26000,
    images: [note40Pro],
    colors: ["Titan Gold", "Obsidian Black", "Vintage Green"],
    display: '6.78" AMOLED FHD+, 120Hz curved',
    camera: "108MP OIS main + 2MP + 2MP · 32MP front",
    battery: "5,000 mAh",
    charging: "70W All-Round FastCharge · 20W MagCharge wireless",
    processor: "MediaTek Helio G99 Ultimate",
    dimensions: "164.3 × 74.5 × 7.8 mm · 190g",
    warranty: "12 months Market Rise warranty",
    inBox: ["Note 40 Pro", "70W charger", "USB-C cable", "Case", "Screen protector"],
    description:
      "Big, bold and beautifully curved. 108MP OIS camera, wireless MagCharge and JBL-tuned stereo speakers — an exceptional daily driver.",
    stock: 15,
    popularity: 80,
    createdAt: "2026-07-15",
  }),
  phone({
    brand: "Infinix",
    model: "GT 20 Pro",
    categories: ["android", "gaming", "5g"],
    storage: "256GB",
    storageOptions: ["256GB"],
    ram: "12GB",
    network: "5G",
    os: "Android",
    condition: "Brand New",
    price: 38000,
    originalPrice: 42000,
    images: [gt20Pro],
    colors: ["Mecha Blue", "Mecha Orange", "Mecha Silver"],
    display: '6.78" AMOLED FHD+, 144Hz',
    camera: "108MP OIS main + 2MP + 2MP · 32MP front",
    battery: "5,000 mAh",
    charging: "45W wired",
    processor: "MediaTek Dimensity 8200 Ultimate + Pixelworks X5 Turbo",
    dimensions: "164.3 × 75.4 × 8.2 mm · 194g",
    warranty: "12 months Market Rise warranty",
    inBox: ["GT 20 Pro", "45W charger", "USB-C cable", "Mecha case"],
    description:
      "A gaming phone built for 120FPS with a dedicated display chip, 144Hz AMOLED, RGB Cyber Mecha lighting and a vapour chamber cooling system.",
    stock: 8,
    popularity: 78,
    createdAt: "2026-08-30",
  }),
  phone({
    brand: "Redmi",
    model: "Redmi Note 13 Pro",
    categories: ["android", "budget", "5g"],
    storage: "256GB",
    storageOptions: ["128GB", "256GB", "512GB"],
    ram: "8GB",
    network: "5G",
    os: "Android",
    condition: "Brand New",
    price: 32000,
    originalPrice: 36000,
    images: [redmiNote13Pro],
    colors: ["Ocean Teal", "Midnight Black", "Aurora Purple"],
    display: '6.67" AMOLED 1.5K, 120Hz',
    camera: "200MP OIS main + 8MP UW + 2MP macro · 16MP front",
    battery: "5,100 mAh",
    charging: "67W turbo charging",
    processor: "Snapdragon 7s Gen 2",
    dimensions: "161.2 × 74.2 × 8 mm · 187g",
    warranty: "12 months Market Rise warranty",
    inBox: ["Redmi Note 13 Pro", "67W charger", "USB-C cable", "Case"],
    description:
      "A 200MP camera and a crisp 1.5K AMOLED at a mid-range price. Gorilla Glass Victus, IP54 and a 5,100 mAh battery for two days of use.",
    stock: 18,
    popularity: 89,
    createdAt: "2026-08-12",
  }),
  phone({
    brand: "Oppo",
    model: "Reno 12",
    categories: ["android", "5g"],
    storage: "256GB",
    storageOptions: ["256GB", "512GB"],
    ram: "12GB",
    network: "5G",
    os: "Android",
    condition: "Brand New",
    price: 55000,
    images: [reno12],
    colors: ["Astro Silver", "Matte Brown", "Sunset Pink"],
    display: '6.7" AMOLED FHD+, 120Hz',
    camera: "50MP main + 8MP UW + 2MP macro · 32MP front",
    battery: "5,000 mAh",
    charging: "80W SUPERVOOC",
    processor: "MediaTek Dimensity 7300-Energy",
    dimensions: "161.4 × 74.1 × 7.6 mm · 177g",
    warranty: "12 months Market Rise warranty",
    inBox: ["Reno 12", "80W charger", "USB-C cable", "Case"],
    description:
      "Slim, light and packed with AI portrait tools. Reno 12 pairs an all-day battery with 80W charging in a premium fluid-glass design.",
    stock: 9,
    popularity: 74,
    createdAt: "2026-07-20",
  }),
  phone({
    brand: "Apple",
    model: "iPhone 13",
    categories: ["iphone", "5g"],
    storage: "128GB",
    storageOptions: ["128GB", "256GB"],
    ram: "4GB",
    network: "5G",
    os: "iOS",
    condition: "Brand New",
    price: 62000,
    originalPrice: 68000,
    images: [iphone13],
    colors: ["Midnight", "Starlight", "Blue", "Pink", "Green"],
    display: '6.1" Super Retina XDR OLED',
    camera: "12MP wide + 12MP ultra-wide · 12MP front",
    battery: "3,240 mAh",
    charging: "20W wired · 15W MagSafe",
    processor: "Apple A15 Bionic",
    dimensions: "146.7 × 71.5 × 7.65 mm · 174g",
    warranty: "12 months Market Rise warranty",
    inBox: ["iPhone 13", "USB-C to Lightning cable", "Documentation"],
    description:
      "Still one of the best-value iPhones: A15 Bionic performance, superb dual cameras with Cinematic mode and all-day battery life.",
    stock: 10,
    popularity: 91,
    createdAt: "2026-06-10",
  }),
  phone({
    brand: "Apple",
    model: "iPhone 12",
    categories: ["iphone", "refurbished", "5g", "budget"],
    storage: "128GB",
    storageOptions: ["64GB", "128GB"],
    ram: "4GB",
    network: "5G",
    os: "iOS",
    condition: "Refurbished",
    price: 42000,
    originalPrice: 48000,
    images: [iphone12],
    colors: ["(PRODUCT)RED", "Black", "Blue", "White"],
    display: '6.1" Super Retina XDR OLED',
    camera: "12MP wide + 12MP ultra-wide · 12MP front",
    battery: "2,815 mAh · battery health 88%+",
    charging: "20W wired · 15W MagSafe",
    processor: "Apple A14 Bionic",
    dimensions: "146.7 × 71.5 × 7.4 mm · 164g",
    warranty: "6 months Market Rise warranty",
    inBox: ["iPhone 12 (Grade A refurbished)", "USB-C to Lightning cable"],
    description:
      "Certified Grade A refurbished. Fully tested, genuine parts, battery health 88% or better, with a 6-month warranty. Looks and works like new.",
    stock: 5,
    popularity: 82,
    createdAt: "2026-08-28",
  }),
  phone({
    brand: "Nokia",
    model: "G42 5G",
    categories: ["android", "budget", "5g"],
    storage: "128GB",
    storageOptions: ["128GB"],
    ram: "6GB",
    network: "5G",
    os: "Android",
    condition: "Brand New",
    price: 22000,
    images: [nokiaG42],
    colors: ["So Purple", "So Grey", "So Pink"],
    display: '6.56" HD+ LCD, 90Hz',
    camera: "50MP main + 2MP macro + 2MP depth · 8MP front",
    battery: "5,000 mAh",
    charging: "20W wired",
    processor: "Snapdragon 480+",
    dimensions: "165 × 76 × 8.6 mm · 194g",
    warranty: "12 months Market Rise warranty",
    inBox: ["Nokia G42 5G", "USB-C cable", "SIM tool"],
    description:
      "Affordable 5G with repairable design (QuickFix) and a three-day battery. Clean Android with two years of OS upgrades.",
    stock: 14,
    popularity: 66,
    createdAt: "2026-05-30",
  }),

  // Accessories
  accessory({
    brand: "Market Rise",
    model: "MagSafe Silicone Case",
    accessoryType: "Phone cases",
    condition: "Brand New",
    price: 1800,
    originalPrice: 2500,
    images: [accCase],
    colors: ["Black", "Midnight Blue", "Clay"],
    warranty: "3 months",
    inBox: ["Silicone case"],
    description:
      "Soft-touch silicone with built-in magnets for MagSafe. Raised edges protect the camera and screen. Available for iPhone 12–16 series.",
    stock: 60,
    popularity: 70,
    createdAt: "2026-08-01",
  }),
  accessory({
    brand: "Market Rise",
    model: "9H Tempered Glass Protector",
    accessoryType: "Screen protectors",
    condition: "Brand New",
    price: 800,
    images: [accScreen],
    colors: ["Clear", "Privacy"],
    warranty: "Free replacement if cracked on install",
    inBox: ["2× tempered glass", "Alignment frame", "Cleaning kit"],
    description:
      "Edge-to-edge 9H hardness glass with oleophobic coating. Twin pack with alignment frame for bubble-free fitting.",
    stock: 120,
    popularity: 75,
    createdAt: "2026-08-01",
  }),
  accessory({
    brand: "Market Rise",
    model: "65W GaN USB-C Fast Charger",
    accessoryType: "Chargers",
    condition: "Brand New",
    price: 3200,
    originalPrice: 3900,
    images: [accCharger],
    colors: ["White", "Black"],
    warranty: "6 months",
    inBox: ["65W GaN charger"],
    description:
      "Compact gallium-nitride charger with USB-C PD 3.0 and PPS. Fast-charges iPhone, Samsung and laptops.",
    stock: 40,
    popularity: 68,
    createdAt: "2026-08-01",
  }),
  accessory({
    brand: "Market Rise",
    model: "Braided USB-C to USB-C Cable 100W",
    accessoryType: "USB cables",
    condition: "Brand New",
    price: 900,
    images: [accCable],
    colors: ["Black", "Graphite"],
    warranty: "6 months",
    inBox: ["1.5m braided cable"],
    description:
      "Nylon-braided, 100W power delivery, 480Mbps data, rated for 30,000 bends. 1.5m length.",
    stock: 90,
    popularity: 64,
    createdAt: "2026-08-01",
  }),
  accessory({
    brand: "Market Rise",
    model: "20,000mAh Power Bank 22.5W",
    accessoryType: "Power banks",
    condition: "Brand New",
    price: 3500,
    originalPrice: 4200,
    images: [accPowerbank],
    colors: ["Black"],
    battery: "20,000 mAh",
    charging: "22.5W USB-C PD in/out · 2× USB-A",
    warranty: "6 months",
    inBox: ["Power bank", "USB-C cable"],
    description:
      "Charge your phone four times over. Digital percentage display, 22.5W fast output and airline-safe capacity.",
    stock: 35,
    popularity: 72,
    createdAt: "2026-08-01",
  }),
  accessory({
    brand: "Market Rise",
    model: "TWS Pro Wireless Earbuds",
    accessoryType: "Earphones",
    condition: "Brand New",
    price: 4500,
    originalPrice: 5500,
    images: [accEarbuds],
    colors: ["White", "Black"],
    battery: "6h + 24h case",
    charging: "USB-C",
    warranty: "6 months",
    inBox: ["Earbuds", "Charging case", "3 ear-tip sizes", "USB-C cable"],
    description:
      "Active noise cancellation, transparency mode, Bluetooth 5.3 and 30 hours total playtime. Works with iOS and Android.",
    stock: 25,
    popularity: 77,
    createdAt: "2026-08-01",
  }),
  accessory({
    brand: "Market Rise",
    model: "Pulse Smart Watch AMOLED",
    accessoryType: "Smart watches",
    condition: "Brand New",
    price: 6500,
    originalPrice: 7900,
    images: [accWatch],
    colors: ["Black", "Silver"],
    display: '1.43" AMOLED always-on',
    battery: "10 days typical",
    charging: "Magnetic dock",
    warranty: "6 months",
    inBox: ["Smart watch", "Silicone strap", "Magnetic charger"],
    description:
      "Heart-rate, SpO2 and sleep tracking, Bluetooth calling and 100+ sport modes. Pairs with any iPhone or Android phone.",
    stock: 22,
    popularity: 71,
    createdAt: "2026-08-01",
  }),
];

export const categoryLabel = (slug: CategorySlug) =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
