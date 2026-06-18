<div align="center">

# 🧼 CodeWash

**Blast source code off a code editor with a realistic pressure washer.**

A premium, physics-driven interactive web experience. Hold the mouse button and
watch a high-pressure water stream erode real code into tumbling debris — letter
by letter — until the editor is spotless.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ Overview

CodeWash loads straight into the experience — no login, no onboarding. You see a
realistic React codebase in a dark editor, and the cursor is replaced by a
pressure-washer nozzle. Hold the left mouse button to fire a water jet. Where the
stream lands, characters weaken, fragment, detach, and fall away as physically
simulated debris. A live counter tracks how much of the codebase you've cleaned.

It's built to feel **premium, smooth, and handcrafted** — the kind of interaction
that makes people ask *"how was this built?"*

## 🎮 How to use

1. Move the mouse — the nozzle follows with natural lag and rotational tracking.
2. **Hold the left mouse button** to fire the pressure washer.
3. Sweep across the code to erode it. Debris flies off and settles at the bottom.
4. Clean ~97% of the code to reveal the **"Codebase Cleaned"** state, then restart.

## 🧩 Features

- **Realistic editor** — a ~160-line React codebase with syntax highlighting and
  gutter line numbers, where every character is an independent destructible glyph.
- **Pressure-washer nozzle** — replaces the cursor; eased motion lag and
  shortest-arc rotational tracking toward your movement direction.
- **Water physics** — a high-pressure spray cone of pooled particles with
  velocity, mass, gravity, lifetime, and additive glow.
- **Code-destruction engine** — water erodes per-glyph integrity; glyphs fade,
  jitter, then detach and tumble away as gravity-driven debris.
- **Splash & mist** — impact bursts and drifting mist on every hit.
- **Spatial partitioning** — a static hash grid keeps water-vs-glyph collision
  lookups O(1) so thousands of particles stay at 60fps.
- **Object pooling** — particles are recycled to avoid GC churn.
- **Polish** — subtle camera shake on heavy impacts, water glow, and an elegant
  completion state with replay.
- **Live metrics** — minimal "Code Cleaned %" HUD. No gamification.

## 🛠️ Tech stack

| Layer        | Tech                                   |
| ------------ | -------------------------------------- |
| Framework    | Next.js 15 (App Router)                |
| UI           | React 19, TypeScript                   |
| Styling      | Tailwind CSS                           |
| Animation    | Framer Motion                          |
| Rendering    | HTML5 Canvas 2D                        |
| State        | Zustand                                |

## 🚀 Getting started

```bash
# install dependencies
npm install

# run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# production build
npm run build && npm start

# type-check
npm run typecheck
```

## 📁 Project structure

```
app/            Next.js routes, layout, global styles
components/     React UI — Experience, Nozzle, HUD, CompletionOverlay
hooks/          usePointer (smoothed nozzle), useAudio
lib/            sample source code + syntax highlighter
canvas/         Engine (rAF loop) + CodeRenderer (glyph layout & draw)
physics/        integrator (Euler step) + SpatialGrid (broad-phase)
particles/      ParticlePool (pooling) + emitters (stream / splash / debris)
store/          Zustand store (metrics, mute, completion)
types/          shared TypeScript types
public/         static assets
```

### Architecture at a glance

- **`Engine`** owns the `requestAnimationFrame` loop. Each frame it reads the
  smoothed nozzle, emits the water stream, resolves water-vs-glyph impacts via
  the spatial grid, spawns debris, integrates all particles, and renders.
- **`CodeRenderer`** tokenizes the source, lays it out into a glyph grid, and
  draws intact glyphs (fading/jittering as their integrity drops).
- **`ParticlePool`** + **`emitters`** handle allocation-free particle lifecycles
  for the stream, splash, mist, and debris.
- **`usePointer`** eases the nozzle toward the cursor and derives its angle from
  travel direction, decoupled from React renders.

## 🌐 Deployment

Zero-config deploy to **Vercel**, **Netlify**, or **Cloudflare Pages**.

```bash
# Vercel
vercel

# or push to GitHub and import the repo in your platform of choice
```

## 🗺️ Roadmap

- [ ] Audio layer (pressure-washer loop, water impacts, ambient hum)
- [ ] Touch tuning for tablets
- [ ] Selectable codebases / paste-your-own

## 📄 License

MIT © Gaurav

---

<div align="center">
<sub>Built as a premium interactive product — not a tutorial project.</sub>
</div>
