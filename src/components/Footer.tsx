import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-5 py-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-soft">
          <Heart className="size-4 fill-primary text-primary" />
          Made with Esha by <span className="font-semibold text-foreground">Dawat AI</span>
        </span>
      </div>
    </footer>
  );
}
