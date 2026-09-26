import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export type DawatRecipe = {
  id: string;
  name: string;
  nameUrdu: string;
  minutes: number;
  difficulty: string;
  description: string;
  image: "karahi" | "pulao" | "keema";
  ingredients: { en: string; ur: string }[];
  steps: { en: string; ur: string }[];
};

export type DawatScan = {
  ingredients: string[];
  recipes: DawatRecipe[];
};

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function createRunIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) {
      headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
    }
    const response = await fetch(input, { ...init, headers });
    runId ??= response.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
    return response;
  };
}

const PROMPT = `You are Dawat AI, a Pakistani home-cooking assistant.
Look at the photo of a fridge / leftover food and:
1. List every edible ingredient you can confidently see (simple names like "Chicken", "Rice", "Tomato").
2. Suggest exactly 3 authentic Pakistani/desi recipes that can mostly be made from those ingredients.

Reply with ONLY raw JSON (no markdown fences) in this shape:
{
  "ingredients": ["Chicken", "Tomato"],
  "recipes": [
    {
      "id": "kebab-slug",
      "name": "Chicken Karahi",
      "nameUrdu": "چکن کڑاہی",
      "minutes": 35,
      "difficulty": "Easy",
      "description": "One short appetising line in English.",
      "image": "karahi",
      "ingredients": [{ "en": "500g chicken", "ur": "آدھا کلو چکن" }],
      "steps": [{ "en": "Heat oil and fry onions.", "ur": "تیل گرم کریں اور پیاز بھونیں۔" }]
    }
  ]
}
Rules: "image" must be one of "karahi", "pulao", "keema" (pick the closest dish type; curries/meat->karahi, rice dishes->pulao, mince/potato/veg->keema).
Give 6-10 ingredients and 5-8 steps per recipe. Urdu must be natural Urdu script.
If the photo has no food at all, return "ingredients": [] and "recipes": [].`;

export const analyzeFridge = createServerFn({ method: "POST" })
  .inputValidator((input: { imageDataUrl: string }) => {
    if (!input?.imageDataUrl?.startsWith("data:image/")) {
      throw new Error("Please upload a valid image of your fridge.");
    }
    return input;
  })
  .handler(async ({ data }): Promise<DawatScan> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project yet.");

    const openai = createOpenAI({
      apiKey,
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: {
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      fetch: createRunIdFetch(),
    });

    const result = streamText({
      model: openai.responses("openai/gpt-6-astra"),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            { type: "image", image: data.imageDataUrl },
          ],
        },
      ],
    });

    const text = await result.text;
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    let parsed: DawatScan;
    try {
      parsed = JSON.parse(cleaned) as DawatScan;
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Could not read the recipes. Please try another photo.");
      parsed = JSON.parse(match[0]) as DawatScan;
    }

    const allowed = ["karahi", "pulao", "keema"] as const;
    return {
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.slice(0, 16) : [],
      recipes: (Array.isArray(parsed.recipes) ? parsed.recipes : [])
        .slice(0, 3)
        .map((r, i) => ({
          ...r,
          id: r.id || `recipe-${i + 1}`,
          image: allowed.includes(r.image) ? r.image : allowed[i % 3]!,
          ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
          steps: Array.isArray(r.steps) ? r.steps : [],
        })),
    };
  });
