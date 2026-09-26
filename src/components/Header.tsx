import { Link } from "@tanstack/react-router";
import { ChefHat } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-fresh shadow-soft">
            <ChefHat className="size-5 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-semibold">Dawat AI</span>
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
            to="/pricing"
            className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
          >
            Pro
          </Link>
        </nav>
      </div>
    </header>
  );
}
