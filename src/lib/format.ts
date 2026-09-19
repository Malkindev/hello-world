import { BUSINESS } from "./config";

export const ksh = (amount: number) => `KSh ${Math.round(amount).toLocaleString("en-KE")}`;

export const discountPct = (price: number, original?: number) =>
  original && original > price ? Math.round(((original - price) / original) * 100) : 0;

export const whatsappLink = (message: string, number: string = BUSINESS.whatsappNumber) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

export const productWhatsappMessage = (name: string, storage: string, price: number) =>
  `Hello ${BUSINESS.name}, I am interested in buying the ${name} ${storage} listed at ${ksh(price)}.`;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const orderNumber = () => {
  const d = new Date();
  const y = String(d.getFullYear()).slice(2);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MRD-${y}${String(d.getMonth() + 1).padStart(2, "0")}-${rand}`;
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
