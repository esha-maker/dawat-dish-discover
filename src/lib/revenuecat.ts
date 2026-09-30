import type { Package, Purchases as PurchasesT } from "@revenuecat/purchases-js";
import { setPro } from "./dawat-store";

export const PRO_ENTITLEMENT = "pro";
const USER_KEY = "dawat.rcUser";

let instance: PurchasesT | null = null;

export function hasRevenueCatKey() {
  return Boolean(import.meta.env['VITE_REVENUECAT_API_KEY']);
}

async function getPurchases(): Promise<PurchasesT | null> {
  if (typeof window === "undefined") return null;
  const apiKey = import.meta.env['VITE_REVENUECAT_API_KEY'] as string | undefined;
  if (!apiKey) return null;
  if (instance) return instance;
  const { Purchases } = await import("@revenuecat/purchases-js");
  let appUserId = localStorage.getItem(USER_KEY);
  if (!appUserId) {
    appUserId = Purchases.generateRevenueCatAnonymousAppUserId();
    localStorage.setItem(USER_KEY, appUserId);
  }
  instance = Purchases.configure({ apiKey, appUserId });
  return instance;
}

/** Sync the local Pro flag with the RevenueCat entitlement. */
export async function refreshProStatus(): Promise<boolean | null> {
  const p = await getPurchases();
  if (!p) return null;
  const info = await p.getCustomerInfo();
  const active = PRO_ENTITLEMENT in info.entitlements.active;
  setPro(active);
  return active;
}

export type ProPlans = { monthly: Package | null; yearly: Package | null };

export async function loadPlans(): Promise<ProPlans | null> {
  const p = await getPurchases();
  if (!p) return null;
  const offerings = await p.getOfferings();
  const cur = offerings.current;
  if (!cur) return { monthly: null, yearly: null };
  return {
    monthly: cur.monthly ?? cur.availablePackages.find((x) => x.identifier.includes("month")) ?? null,
    yearly:
      cur.annual ??
      cur.availablePackages.find((x) => /year|annual/.test(x.identifier)) ??
      null,
  };
}

export async function purchasePlan(rcPackage: Package): Promise<boolean> {
  const p = await getPurchases();
  if (!p) throw new Error("Payments are not configured yet.");
  const { customerInfo } = await p.purchase({ rcPackage });
  const active = PRO_ENTITLEMENT in customerInfo.entitlements.active;
  setPro(active);
  return active;
}

/** Show the RevenueCat paywall (current offering) as a full-screen overlay. */
export async function showPaywall(): Promise<boolean> {
  const p = await getPurchases();
  if (!p) throw new Error("Payments are not configured yet.");
  const result = await p.presentPaywall({});
  const active = PRO_ENTITLEMENT in result.customerInfo.entitlements.active;
  setPro(active);
  return active;
}
