/**
 * Central business configuration.
 * Change the WhatsApp number here when the production line is ready.
 */
export const BUSINESS = {
  name: "Market Rise Digital",
  tagline: "Smart Phones. Smart Choices.",
  /** International format, digits only (no +). Placeholder — swap for production number. */
  whatsappNumber: "254108957557",
  phoneDisplay: "+254 108 957 557",
  email: "marketrisedigital254@gmail.com",
  location: "Nairobi CBD, Kenya",
  hours: "Mon – Sat, 8:00am – 7:00pm",
  socials: {
    instagram: "https://instagram.com/marketrisedigital",
    facebook: "https://facebook.com/marketrisedigital",
    tiktok: "https://tiktok.com/@marketrisedigital",
    x: "https://x.com/marketrisedigital",
  },
} as const;

export const DELIVERY_ZONES = [
  { id: "nairobi-cbd", label: "Nairobi CBD (pickup / same day)", cost: 0 },
  { id: "nairobi", label: "Nairobi & environs", cost: 300 },
  { id: "mombasa", label: "Mombasa", cost: 500 },
  { id: "kisumu", label: "Kisumu", cost: 500 },
  { id: "nakuru", label: "Nakuru", cost: 450 },
  { id: "eldoret", label: "Eldoret", cost: 500 },
  { id: "other", label: "Other towns (courier)", cost: 600 },
] as const;

export const PAYMENT_METHODS = [
  { id: "mpesa", label: "M-Pesa (Lipa na M-Pesa)", hint: "Pay on confirmation" },
  { id: "cod", label: "Cash on delivery", hint: "Nairobi only" },
  { id: "card", label: "Card payment", hint: "Coming soon" },
  { id: "bank", label: "Bank transfer", hint: "Details sent on confirmation" },
] as const;

export const ORDER_STATUSES = [
  "Order Received",
  "Confirmed",
  "Processing",
  "Dispatched",
  "Delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
