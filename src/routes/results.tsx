import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Clock, Flame, Mic, MonitorSpeaker, Square, Tv, Volume2, VolumeX } from "lucide-react";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dishImages, loadScan } from "@/lib/dawat-store";
import { speakRecipeUrdu, speakText, stopSpeaking, warmUpVoices } from "@/lib/speech";
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
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [alexaOpen, setAlexaOpen] = useState(false);
  const [alexaRecipe, setAlexaRecipe] = useState<DawatScan["recipes"][number] | null>(null);
  const [alexaLang, setAlexaLang] = useState<"ur" | "en" | null>(null);

  useEffect(() => {
    setScan(loadScan());
    setReady(true);
    warmUpVoices();
  }, []);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  function toggleSpeak(recipe: DawatScan["recipes"][number]) {
    if (speakingId === recipe.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    const urduText = [
      recipe.nameUrdu,
      ...recipe.steps.map((step) => step.ur),
    ].join(". ");
    const started = speakRecipeUrdu(urduText, () => setSpeakingId(null));
    if (started) setSpeakingId(recipe.id);
  }

  function openAlexa() {
    setAlexaRecipe(null);
    setAlexaLang(null);
    setAlexaOpen(true);
  }

  function closeAlexa(open: boolean) {
    setAlexaOpen(open);
    if (!open) {
      stopSpeaking();
      setAlexaLang(null);
    }
  }

  function pickAlexaRecipe(recipe: DawatScan["recipes"][number]) {
    setAlexaRecipe(recipe);
    setAlexaLang(null);
    // Simulated Alexa intro line.
    speakText("This is Dawat AI on Alexa plus. Alexa says, " + recipe.name, "en-US");
  }

  function alexaSpeak(lang: "ur" | "en") {
    if (!alexaRecipe) return;
    stopSpeaking();
    setAlexaLang(lang);
    const text =
      lang === "ur"
        ? [alexaRecipe.nameUrdu, ...alexaRecipe.steps.map((s) => s.ur)].join(". ")
        : [alexaRecipe.name, ...alexaRecipe.steps.map((s) => s.en)].join(". ");
    const started = speakText(text, lang === "ur" ? "ur-PK" : "en-US", () => setAlexaLang(null));
    if (!started) setAlexaLang(null);
  }

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
              <button
                type="button"
                onClick={openAlexa}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-alexa px-6 py-5 text-lg font-semibold text-alexa-foreground shadow-lift transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <Mic className="size-6 transition-transform group-hover:scale-110" />
                <span>🎤 Ask Alexa to Speak This Recipe</span>
              </button>
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
                      <div className="mt-2 flex items-center gap-2">
                        <p className="urdu flex-1 text-sm text-muted-foreground">{recipe.nameUrdu}</p>
                        <button
                          type="button"
                          onClick={() => toggleSpeak(recipe)}
                          aria-label={
                            speakingId === recipe.id
                              ? `Stop the Urdu voice for ${recipe.name}`
                              : `Listen to ${recipe.nameUrdu} in Urdu`
                          }
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
                        >
                          {speakingId === recipe.id ? (
                            <Square className="size-3.5" />
                          ) : (
                            <Volume2 className="size-4" />
                          )}
                        </button>
                      </div>
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

            <section className="mt-12 rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
              <h2 className="text-2xl font-semibold">Works with Amazon Devices</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Dawat AI runs on Alexa+ — your recipes, spoken aloud on every Alexa device.
              </p>
              <div className="mt-6 flex flex-wrap items-start justify-center gap-4">
                <div className="flex w-28 flex-col items-center gap-2 rounded-2xl border border-border bg-secondary p-4">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gradient-alexa text-alexa-foreground">
                    <Mic className="size-6" />
                  </span>
                  <span className="text-sm font-semibold">Alexa</span>
                </div>
                <div className="flex w-28 flex-col items-center gap-2 rounded-2xl border border-border bg-secondary p-4">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gradient-alexa text-alexa-foreground">
                    <Tv className="size-6" />
                  </span>
                  <span className="text-sm font-semibold">Fire TV</span>
                </div>
                <div className="flex w-28 flex-col items-center gap-2 rounded-2xl border border-border bg-secondary p-4">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gradient-alexa text-alexa-foreground">
                    <MonitorSpeaker className="size-6" />
                  </span>
                  <span className="text-sm font-semibold">Echo Show</span>
                </div>
              </div>
              <p className="mt-6 text-base font-medium">
                Say:{" "}
                <span className="rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
                  &ldquo;Alexa, ask Dawat what&apos;s in my fridge?&rdquo;
                </span>
              </p>
            </section>
          </>
        ) : null}
      </main>

      <Dialog open={alexaOpen} onOpenChange={closeAlexa}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-gradient-alexa text-alexa-foreground shadow-lift">
              <Mic className="size-7" />
            </div>
            {alexaRecipe ? (
              <>
                <DialogTitle className="text-center text-xl">
                  Alexa says: {alexaRecipe.name}
                </DialogTitle>
                <DialogDescription asChild>
                  <p className="urdu text-center text-base">{alexaRecipe.nameUrdu}</p>
                </DialogDescription>
                <p className="text-center text-xs font-medium text-muted-foreground">
                  This is Dawat AI on Alexa+
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button
                    type="button"
                    onClick={() => alexaSpeak("ur")}
                    className="rounded-xl bg-gradient-alexa font-semibold text-alexa-foreground"
                  >
                    {alexaLang === "ur" ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                    اردو میں سنو
                  </Button>
                  <Button
                    type="button"
                    onClick={() => alexaSpeak("en")}
                    className="rounded-xl bg-gradient-alexa font-semibold text-alexa-foreground"
                  >
                    {alexaLang === "en" ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                    Speak in English
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setAlexaRecipe(null);
                    setAlexaLang(null);
                  }}
                  className="mx-auto mt-3 text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                >
                  Choose a different recipe
                </button>
              </>
            ) : (
              <>
                <DialogTitle className="text-center text-xl">Alexa is listening…</DialogTitle>
                <DialogDescription className="text-center">
                  Which recipe should Alexa read aloud?
                </DialogDescription>
                <div className="mt-2 flex flex-col gap-2">
                  {scan?.recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => pickAlexaRecipe(recipe)}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
                    >
                      <img
                        src={dishImages[recipe.image] ?? dishImages["karahi"]}
                        alt=""
                        className="size-12 rounded-xl object-cover"
                      />
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{recipe.name}</span>
                        <span className="urdu block text-xs text-muted-foreground">
                          {recipe.nameUrdu}
                        </span>
                      </span>
                      <Volume2 className="size-4 text-primary" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
