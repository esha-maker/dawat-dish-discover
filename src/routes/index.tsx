import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Sparkles, Soup, Leaf } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { analyzeFridge } from "@/lib/dawat.functions";
import {
  FREE_DAILY_SCANS,
  fileToDataUrl,
  isPro,
  recordScan,
  saveScan,
  scansLeft,
} from "@/lib/dawat-store";
import heroFridge from "@/assets/hero-fridge.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dawat AI — Fridge to Pakistani Recipe" },
      {
        name: "description",
        content:
          "Snap your fridge and Dawat AI detects your ingredients and suggests fresh Pakistani recipes in Urdu and English.",
      },
      { property: "og:title", content: "Dawat AI — Fridge to Pakistani Recipe" },
      {
        property: "og:description",
        content: "Snap your fridge, get 3 desi recipes you can cook right now.",
      },
    ],
  }),
  component: Home,
});

async function shrink(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const max = 1024;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function Home() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeFridge);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const [pro, setProState] = useState(false);

  useEffect(() => {
    const sync = () => {
      setLeft(scansLeft());
      setProState(isPro());
    };
    sync();
    window.addEventListener("dawat:update", sync);
    return () => window.removeEventListener("dawat:update", sync);
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!pro && scansLeft() <= 0) {
      toast.error("Daily free scans used up", {
        description: "Upgrade to Dawat Pro for unlimited fridge scans.",
      });
      navigate({ to: "/pricing" });
      return;
    }
    setLoading(true);
    try {
      const raw = await fileToDataUrl(file);
      const imageDataUrl = await shrink(raw);
      const scan = await analyze({ data: { imageDataUrl } });
      if (!scan.recipes.length) {
        toast.error("No food spotted", { description: "Try a clearer photo of your fridge." });
        return;
      }
      saveScan(scan, imageDataUrl);
      recordScan();
      navigate({ to: "/results" });
    } catch (error) {
      toast.error("Scan failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-glow" />
        <section className="relative mx-auto max-w-5xl px-5 pt-12 pb-16 sm:pt-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-soft">
                <Leaf className="size-3.5 text-primary" />
                Fridge to desi dawat in seconds
              </span>
              <h1 className="mt-5 text-4xl leading-tight font-semibold sm:text-5xl">
                Snap your fridge.
                <br />
                <span className="text-gradient-fresh">Cook something desi.</span>
              </h1>
              <p className="mt-4 max-w-md text-base text-muted-foreground">
                Dawat AI reads the ingredients in your photo and turns yesterday&apos;s leftovers
                into three Pakistani recipes — with steps in Urdu and English.
              </p>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => void onFile(e.target.files?.[0])}
              />

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  disabled={loading}
                  onClick={() => inputRef.current?.click()}
                  className="h-14 rounded-2xl bg-gradient-fresh px-7 text-base font-semibold shadow-lift"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" /> Reading your fridge…
                    </>
                  ) : (
                    <>
                      <Camera className="size-5" /> Snap Your Fridge
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {pro ? (
                    <span className="font-medium text-primary">Pro · unlimited scans</span>
                  ) : (
                    <>
                      {left ?? FREE_DAILY_SCANS} of {FREE_DAILY_SCANS} free scans left today ·{" "}
                      <Link to="/pricing" className="font-medium text-primary underline">
                        Go Pro
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-fresh opacity-15 blur-2xl" />
              <img
                src={heroFridge}
                alt="Fresh ingredients on a fridge shelf"
                width={1280}
                height={960}
                className="relative aspect-4/3 w-full rounded-[1.75rem] object-cover shadow-lift"
              />
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Camera, title: "1. Snap", text: "Photo of your fridge or leftovers." },
              { icon: Sparkles, title: "2. Detect", text: "AI lists every ingredient it sees." },
              { icon: Soup, title: "3. Banao", text: "Three desi recipes, ready to cook." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <s.icon className="size-5 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
