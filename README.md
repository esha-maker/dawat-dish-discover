# Dawat AI — Fridge to Recipe 🍲

Snap a photo of your fridge or leftovers, and Dawat AI detects the ingredients and suggests Pakistani recipes you can cook right now — with steps in **Urdu and English**.

## How it works

1. **Snap Your Fridge** — take or upload a photo from the home screen.
2. **Ingredient detection** — the AI lists what it sees (e.g. "Chicken, Rice, Tomato, Yogurt").
3. **Recipe suggestions** — 3 recipe cards with cook time and a **Banao** button.
4. **Full recipe** — ingredients and step-by-step instructions in Urdu (نستعلیق script) and English.
5. **Go Pro** — free users get **2 scans per day**; Pro unlocks unlimited scans, priority AI detection, and all recipes.

## Features

- 📷 Camera + photo upload (mobile-friendly, images resized before upload)
- 🥕 AI ingredient detection powered by the Lovable AI Gateway
- 🍛 3 Pakistani recipe suggestions per scan (karahi, pulao, keema and more)
- 🇵🇰 Bilingual recipes — Urdu + English ingredients and steps
- 💳 Pro subscription via RevenueCat (Monthly & Yearly plans, free tier: 2 scans/day)
- 📱 Responsive, modern green-and-white fresh food theme

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, server functions)
- Tailwind CSS v4
- Lovable AI Gateway (GPT model for vision + recipe generation)
- RevenueCat Web Billing (`@revenuecat/purchases-js`)
- Vite

## Development

```sh
npm install
npm run dev
```

Then open the local dev server URL shown in the terminal.

## Configuration

Create a `.env` file in the project root:

```
VITE_REVENUECAT_API_KEY=your_revenuecat_web_public_key
```

Your RevenueCat project needs:

- An entitlement named **`pro`**
- A current offering with **Monthly** and **Yearly** packages

## Project structure

```
src/
├── routes/
│   ├── index.tsx        # Home — Snap Your Fridge
│   ├── results.tsx      # Detected ingredients + 3 recipe cards
│   ├── recipe.$id.tsx   # Full bilingual recipe page
│   └── pro.tsx          # Pricing / RevenueCat paywall
├── lib/
│   ├── dawat.functions.ts  # AI analysis server function
│   ├── dawat-store.ts      # Scan limits & local state
│   └── revenuecat.ts       # RevenueCat integration
└── components/          # Header, Footer
```

---

Made with Esha by Dawat AI
