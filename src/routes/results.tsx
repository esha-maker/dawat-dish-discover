import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Clock, Flame, Square, Volume2 } from "lucide-react";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { dishImages, loadScan } from "@/lib/dawat-store";
import { speakRecipeUrdu, stopSpeaking, warmUpVoices } from "@/lib/speech";
import type { DawatScan } from "@/lib/dawat.functions";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your ingredients & recipes — Dawat AI" },
      {
        name: "description",
        content: "Ingredients detected from your fridge photo and three Pakistani recipes to cook.",
      },
      { property: "og:title", content: "Your ingredients & recipes — Dawat AI" },
      {
        property: "og:description",
        content: "See what Dawat AI found in your fridge and pick a recipe.",
      },
    ],
  }),
  component: Results,
});

function Results() {
  const [scan, setScan] = useState<(DawatScan & { photo?: string }) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setScan(loadScan());
    setReady(true);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10">
        {ready && !scan ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <h1 className="text-2xl font-semibold">No scan yet</h1>
            <p className="mt-2 text-muted-foreground">
              Take a photo of your fridge and we&apos;ll find recipes for you.
            </p>
            <Button asChild className="mt-6 rounded-xl bg-gradient-fresh">
              <Link to="/">
                <Camera className="size-4" /> Snap Your Fridge
              </Link>
            </Button>
          </div>
        ) : null}

        {scan ? (
          <>
            <section className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-start">
              {scan.photo ? (
                <img
                  src={scan.photo}
                  alt="Your fridge"
                  loading="lazy"
                  className="h-40 w-full rounded-2xl object-cover shadow-soft sm:h-44"
                />
              ) : null}
              <div>
                <h1 className="text-3xl font-semibold">Detected ingredients</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {scan.ingredients.length} items found in your photo.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {scan.ingredients.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Aaj kya banayein?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Three Pakistani dishes from what you already have.
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {scan.recipes.map((recipe) => (
                  <article
                    key={recipe.id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift"
                  >
                    <img
                      src={dishImages[recipe.image] ?? dishImages["karahi"]}
                      alt={recipe.name}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-xl font-semibold">{recipe.name}</h3>
                      <p className="urdu mt-1 text-sm text-muted-foreground">{recipe.nameUrdu}</p>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">
                        {recipe.description}
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5 text-primary" /> {recipe.minutes} min
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Flame className="size-3.5 text-spice" /> {recipe.difficulty}
                        </span>
                      </div>
                      <Button
                        asChild
                        className="mt-5 rounded-xl bg-gradient-fresh font-semibold shadow-soft"
                      >
                        <Link to="/recipe/$id" params={{ id: recipe.id }}>
                          Banao
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
