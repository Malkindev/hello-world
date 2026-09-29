import { DELIVERY_ZONES } from "./config";

const ZONE_KEY = "mrd-zone";

export type ZoneId = (typeof DELIVERY_ZONES)[number]["id"];

export const getZoneId = (): ZoneId => {
  if (typeof window === "undefined") return "nairobi-cbd";
  const raw = window.localStorage.getItem(ZONE_KEY);
  return (DELIVERY_ZONES.some((z) => z.id === raw) ? raw : "nairobi-cbd") as ZoneId;
};

export const setZoneId = (id: ZoneId) => {
  try {
    window.localStorage.setItem(ZONE_KEY, id);
  } catch {
    /* ignore */
  }
};

export const zoneById = (id: string) =>
  DELIVERY_ZONES.find((z) => z.id === id) ?? DELIVERY_ZONES[0];
