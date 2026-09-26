import type { DawatScan } from "./dawat.functions";
import karahi from "@/assets/dish-karahi.jpg";
import pulao from "@/assets/dish-pulao.jpg";
import keema from "@/assets/dish-keema.jpg";

export const FREE_DAILY_SCANS = 2;

const SCAN_KEY = "dawat.lastScan";
const USAGE_KEY = "dawat.usage";
const PRO_KEY = "dawat.pro";

export const dishImages: Record<string, string> = { karahi, pulao, keema };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function isPro(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_KEY) === "true";
}

export function setPro(value: boolean) {
  localStorage.setItem(PRO_KEY, String(value));
  window.dispatchEvent(new Event("dawat:update"));
}

export function scansUsedToday(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = JSON.parse(localStorage.getItem(USAGE_KEY) ?? "{}") as {
      date?: string;
      count?: number;
    };
    return raw.date === today() ? (raw.count ?? 0) : 0;
  } catch {
    return 0;
  }
}

export function scansLeft(): number {
  if (isPro()) return Infinity;
  return Math.max(0, FREE_DAILY_SCANS - scansUsedToday());
}

export function recordScan() {
  localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today(), count: scansUsedToday() + 1 }));
  window.dispatchEvent(new Event("dawat:update"));
}

export function saveScan(scan: DawatScan, photo: string) {
  sessionStorage.setItem(SCAN_KEY, JSON.stringify({ ...scan, photo }));
}

export function loadScan(): (DawatScan & { photo?: string }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SCAN_KEY);
    return raw ? (JSON.parse(raw) as DawatScan & { photo?: string }) : null;
  } catch {
    return null;
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that photo."));
    reader.readAsDataURL(file);
  });
}
