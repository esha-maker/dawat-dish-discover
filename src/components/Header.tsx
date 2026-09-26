import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChefHat, Crown } from "lucide-react";
import { isPro } from "@/lib/dawat-store";
import { refreshProStatus } from "@/lib/revenuecat";

export function Header() {
  const [pro, setPro] = useState(false);

  useEffect(() => {
    const sync = () => setPro(isPro());
    sync();
    window.addEventListener("dawat:update", sync);
    refreshProStatus().catch(() => {});
    return () => window.removeEventListener("dawat:update", sync);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-fresh shadow-soft">
            <ChefHat className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-semibold">Dawat AI</span>
          {pro ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-fresh px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
              <Crown className="size-3" /> PRO
            </span>
          ) : null}
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            to="/results"
            className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
          >
            Recipes
          </Link>
          <Link
            to="/pro"
            className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
          >
            {pro ? "Pro ✓" : "Go Pro"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
