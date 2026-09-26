import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Flame } from "lucide-react";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { dishImages, loadScan } from "@/lib/dawat-store";
import type { DawatRecipe } from "@/lib/dawat.functions";

export const Route = createFileRoute("/recipe/$id")({
  head: () => ({
    meta: [
      { title: "Recipe — Dawat AI" },
      {
        name: "description",
        content: "Full Pakistani recipe with ingredients and step-by-step method in Urdu and English.",
      },
      { property: "og:title", content: "Recipe — Dawat AI" },
      {
        property: "og:description",
        content: "Ingredients and steps in Urdu and English, made from what's in your fridge.",
      },
    ],
  }),
  component: RecipePage,
});

function RecipePage() {
  const { id } = useParams({ from: "/recipe/$id" });
  const [recipe, setRecipe] = useState<DawatRecipe | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const scan = loadScan();
    setRecipe(scan?.recipes.find((r) => r.id === id) ?? null);
    setReady(true);
  }, [id]);

  if (ready && !recipe) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-2xl px-5 py-20 text-center">
          <h1 className="text-2xl font-semibold">Recipe not found</h1>
          <p className="mt-2 text-muted-foreground">Scan your fridge again to get fresh ideas.</p>
          <Button asChild className="mt-6 rounded-xl bg-gradient-fresh">
            <Link to="/">Snap Your Fridge</Link>
          </Button>
        </main>
      </div>
    );
  }

  if (!recipe) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <Link
          to="/results"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to recipes
        </Link>

        <img
          src={dishImages[recipe.image] ?? dishImages["karahi"]}
          alt={recipe.name}
          width={1024}
          height={768}
          className="mt-5 aspect-16/9 w-full rounded-3xl object-cover shadow-lift"
        />

        <div className="mt-6">
          <h1 className="text-3xl font-semibold sm:text-4xl">{recipe.name}</h1>
          <p className="urdu mt-2 text-xl">{recipe.nameUrdu}</p>
          <p className="mt-3 text-muted-foreground">{recipe.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-primary" /> {recipe.minutes} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Flame className="size-4 text-spice" /> {recipe.difficulty}
            </span>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Ingredients · اجزاء</h2>
          <ul className="mt-4 space-y-3">
            {recipe.ingredients.map((item, i) => (
              <li
                key={i}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium">{item.en}</span>
                <span className="urdu text-sm text-muted-foreground">{item.ur}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Method · ترکیب</h2>
          <ol className="mt-4 space-y-4">
            {recipe.steps.map((step, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-fresh text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm">{step.en}</p>
                  <p className="urdu mt-2 text-sm text-muted-foreground">{step.ur}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 rounded-3xl bg-gradient-fresh p-6 text-center shadow-lift">
          <p className="font-display text-xl font-semibold text-primary-foreground">
            Mazaydaar bana? Scan again for tomorrow&apos;s dawat.
          </p>
          <Button asChild variant="secondary" className="mt-4 rounded-xl font-semibold">
            <Link to="/">Snap Your Fridge</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
