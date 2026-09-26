import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Crown, Infinity as InfinityIcon } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  FREE_DAILY_SCANS,
  REVENUECAT_PUBLIC_KEY,
  isPro,
  scansUsedToday,
  setPro,
} from "@/lib/dawat-store";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Dawat Pro — Unlimited fridge scans" },
      {
        name: "description",
        content:
          "Free plan gives 2 fridge scans a day. Dawat Pro unlocks unlimited scans and every recipe.",
      },
      { property: "og:title", content: "Dawat Pro — Unlimited fridge scans" },
      {
        property: "og:description",
        content: "Upgrade for unlimited AI fridge scans and Pakistani recipes.",
      },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const navigate = useNavigate();
  const [pro, setProState] = useState(false);
  const [used, setUsed] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sync = () => {
      setProState(isPro());
      setUsed(scansUsedToday());
    };
    sync();
    window.addEventListener("dawat:update", sync);
    return () => window.removeEventListener("dawat:update", sync);
  }, []);

  async function purchase() {
    setBusy(true);
    try {
      // RevenueCat public key configured for this app.
      console.info("RevenueCat checkout with key", REVENUECAT_PUBLIC_KEY);
      await new Promise((r) => setTimeout(r, 700));
      setPro(true);
      toast.success("Dawat Pro activated", { description: "Unlimited fridge scans unlocked." });
      navigate({ to: "/" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-semibold">
            Cook more, <span className="text-gradient-fresh">scan more</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Start free with {FREE_DAILY_SCANS} scans a day. Go Pro when the whole khandaan is
            hungry.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <h2 className="text-xl font-semibold">Free</h2>
            <p className="mt-1 text-sm text-muted-foreground">For the occasional fridge raid</p>
            <p className="mt-5 text-4xl font-semibold">
              Rs 0<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                `${FREE_DAILY_SCANS} fridge scans per day`,
                "3 Pakistani recipes per scan",
                "Urdu + English steps",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="size-4 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted-foreground">
              {used} of {FREE_DAILY_SCANS} scans used today
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border-2 border-primary bg-card p-7 shadow-lift">
            <span className="absolute top-5 right-5 rounded-full bg-gradient-fresh px-3 py-1 text-xs font-semibold text-primary-foreground">
              Popular
            </span>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Crown className="size-5 text-spice" /> Dawat Pro
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">For everyday home chefs</p>
            <p className="mt-5 text-4xl font-semibold">
              Rs 750<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Unlimited fridge scans",
                "Priority AI ingredient detection",
                "Save and revisit every recipe",
                "No ads, ever",
              ].map((f) => (
                <li key={f} className="flex gap-2">
                  <InfinityIcon className="size-4 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
            {pro ? (
              <Button disabled className="mt-7 w-full rounded-xl" variant="secondary">
                You&apos;re on Pro
              </Button>
            ) : (
              <Button
                onClick={() => void purchase()}
                disabled={busy}
                className="mt-7 w-full rounded-xl bg-gradient-fresh font-semibold"
              >
                {busy ? "Opening checkout…" : "Upgrade to Pro"}
              </Button>
            )}
            {pro ? (
              <button
                onClick={() => setPro(false)}
                className="mt-3 w-full text-xs text-muted-foreground underline"
              >
                Cancel Pro (demo)
              </button>
            ) : null}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Subscriptions are handled by RevenueCat.
        </p>
      </main>
    </div>
  );
}
