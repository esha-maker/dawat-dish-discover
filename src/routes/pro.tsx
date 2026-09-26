import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Package } from "@revenuecat/purchases-js";
import { Check, Crown, Infinity as InfinityIcon } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { FREE_DAILY_SCANS, isPro, scansUsedToday } from "@/lib/dawat-store";
import {
  hasRevenueCatKey,
  loadPlans,
  purchasePlan,
  refreshProStatus,
  type ProPlans,
} from "@/lib/revenuecat";

export const Route = createFileRoute("/pro")({
  head: () => ({
    meta: [
      { title: "Dawat Pro — Monthly & yearly plans" },
      {
        name: "description",
        content: "Free gives 2 fridge scans a day. Dawat Pro unlocks unlimited scans, monthly or yearly.",
      },
      { property: "og:title", content: "Dawat Pro — Monthly & yearly plans" },
      { property: "og:description", content: "Unlimited AI fridge scans and Pakistani recipes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProPage,
});

type Cycle = "monthly" | "yearly";

function ProPage() {
  const navigate = useNavigate();
  const [pro, setProState] = useState(false);
  const [used, setUsed] = useState(0);
  const [plans, setPlans] = useState<ProPlans | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Cycle | null>(null);

  useEffect(() => {
    const sync = () => {
      setProState(isPro());
      setUsed(scansUsedToday());
    };
    sync();
    window.addEventListener("dawat:update", sync);
    Promise.all([loadPlans(), refreshProStatus()])
      .then(([p]) => setPlans(p))
      .catch((e) => {
        console.error(e);
        toast.error("Couldn't load plans", { description: "Please try again shortly." });
      })
      .finally(() => setLoading(false));
    return () => window.removeEventListener("dawat:update", sync);
  }, []);

  async function buy(cycle: Cycle, pkg: Package | null) {
    if (!pkg) {
      toast.error("This plan isn't available yet.");
      return;
    }
    setBusy(cycle);
    try {
      const ok = await purchasePlan(pkg);
      if (ok) {
        toast.success("Dawat Pro activated", { description: "Unlimited fridge scans unlocked." });
        navigate({ to: "/" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Purchase failed";
      if (!/cancel/i.test(msg)) toast.error("Purchase didn't go through", { description: msg });
    } finally {
      setBusy(null);
    }
  }

  const price = (pkg: Package | null | undefined, fallback: string) =>
    pkg?.webBillingProduct.currentPrice.formattedPrice ?? fallback;

  const tiers: { cycle: Cycle; title: string; pkg: Package | null; fallback: string; per: string; note?: string }[] = [
    { cycle: "monthly", title: "Monthly", pkg: plans?.monthly ?? null, fallback: "—", per: "/month" },
    {
      cycle: "yearly",
      title: "Yearly",
      pkg: plans?.yearly ?? null,
      fallback: "—",
      per: "/year",
      note: "Best value",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-fresh px-3 py-1 text-xs font-semibold text-primary-foreground">
            <Crown className="size-3.5" /> Dawat Pro
          </span>
          <h1 className="mt-4 text-4xl font-semibold">
            Cook more, <span className="text-gradient-fresh">scan more</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Free includes {FREE_DAILY_SCANS} scans a day. Pro is unlimited.
          </p>
        </div>

        {pro ? (
          <div className="mx-auto mt-10 max-w-md rounded-3xl border-2 border-primary bg-card p-8 text-center shadow-lift">
            <Crown className="mx-auto size-10 text-spice" />
            <h2 className="mt-3 text-2xl font-semibold">You&apos;re on Pro</h2>
            <p className="mt-2 text-sm text-muted-foreground">Unlimited fridge scans are unlocked.</p>
            <Button onClick={() => navigate({ to: "/" })} className="mt-6 rounded-xl bg-gradient-fresh">
              Snap your fridge
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
              <h2 className="text-xl font-semibold">Free</h2>
              <p className="mt-5 text-4xl font-semibold">Rs 0</p>
              <ul className="mt-6 space-y-3 text-sm">
                {[`${FREE_DAILY_SCANS} scans per day`, "3 recipes per scan", "Urdu + English steps"].map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="size-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted-foreground">
                {used} of {FREE_DAILY_SCANS} scans used today
              </p>
            </div>

            {tiers.map((t) => (
              <div
                key={t.cycle}
                className={`relative rounded-3xl bg-card p-7 ${t.note ? "border-2 border-primary shadow-lift" : "border border-border shadow-soft"}`}
              >
                {t.note ? (
                  <span className="absolute top-5 right-5 rounded-full bg-gradient-fresh px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {t.note}
                  </span>
                ) : null}
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Crown className="size-5 text-spice" /> {t.title}
                </h2>
                <p className="mt-5 text-4xl font-semibold">
                  {loading ? "…" : price(t.pkg, t.fallback)}
                  <span className="text-base font-normal text-muted-foreground">{t.per}</span>
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {["Unlimited fridge scans", "Priority AI detection", "All recipes, Urdu + English"].map((f) => (
                    <li key={f} className="flex gap-2">
                      <InfinityIcon className="size-4 shrink-0 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => void buy(t.cycle, t.pkg)}
                  disabled={loading || busy !== null || !t.pkg}
                  className="mt-7 w-full rounded-xl bg-gradient-fresh font-semibold"
                >
                  {busy === t.cycle ? "Opening checkout…" : `Go ${t.title}`}
                </Button>
              </div>
            ))}
          </div>
        )}

        {!hasRevenueCatKey() ? (
          <p className="mt-8 text-center text-sm text-destructive">
            Payments aren&apos;t connected yet — add your RevenueCat key to enable checkout.
          </p>
        ) : (
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Secure checkout by RevenueCat. Cancel anytime.
          </p>
        )}
      </main>
    </div>
  );
}
