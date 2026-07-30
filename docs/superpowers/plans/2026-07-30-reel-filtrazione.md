# Reel Instagram "Filtrazione: differenze" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a third Instagram reel (`FiltrazioneReel`) in the existing Remotion project, in the same pure motion-graphics style as `WaterReel` and `DetrazioneReel`, explaining the difference between microfiltrazione (Carbon Block), ultrafiltrazione and osmosi inversa, ending with a comparative table and a CTA — then render it and publish it as a static asset.

**Architecture:** Single new React/TSX file (`video-reel/src/FiltrazioneReel.tsx`) exporting a `FiltrazioneReel` component built from 7 scene components chained with `@remotion/transitions` `TransitionSeries` + `fade()`, background music only (no voice), registered as a new `Composition` in `video-reel/src/Root.tsx`. No test framework exists in this project (no jest/vitest) — verification is `npm run lint` (`eslint src && tsc`) plus visual review of `remotion still` renders at specific frames.

**Tech Stack:** Remotion 4.0.481, React 19, TypeScript, `@remotion/transitions` (fade), `@remotion/google-fonts` (Oswald 700, Inter 400/600/700), `@remotion/media` `Audio`.

## Global Constraints

- Format 1080×1920 (9:16), 30fps — matches `WaterReel`/`DetrazioneReel`.
- No real video clips, no voice-over — only kinetic typography, gradients, counters, and background music (per approved design spec `docs/superpowers/specs/2026-07-30-reel-filtrazione-design.md`).
- Palette must reuse exactly: `BLUE = "#2596be"`, `GOLD = "#FFB800"`, `GREEN = "#35d07a"`, `RED = "#ff4040"`, `MUTED = "#8090b0"`.
- Music track: `go-beyond.mp3` (the only one of the three in `video-reel/public/` not already used by `WaterReel` or `DetrazioneReel`), `volume={0.28}`.
- Transitions: `fade()` with `linearTiming({ durationInFrames: 15 })` between every scene (`TRANS_DUR = 15`), same as both existing reels.
- **`video-reel/tsconfig.json` has `"noUnusedLocals": true`, and `eslint` (via `@typescript-eslint/no-unused-vars`) also fails the build on any top-level const/component/import that is declared but never referenced anywhere in the file.** This was verified empirically while drafting this plan: a first draft that front-loaded all shared helpers/components in Task 1 (before any scene used them) failed `npm run lint` with 6 errors (`fade`, `Divider`, `FilterRow`, `TableHeader`, `TableRow`, `timing` all "defined but never used"). **Consequence for every task below: only introduce a shared constant/type/component/import in the task whose scene is the first to actually reference it.** Do not front-load anything "for later use."
- Total composition duration is **915 frames** (scene durations 150+150+150+165+180+120+90 = 1005, minus 6 transitions × 15 = 90). This number must end up in `Root.tsx`'s final `durationInFrames` for `FiltrazioneReel`.

---

## Task 1: Scaffold file, Scene 1 (HOOK) only

**Files:**
- Create: `video-reel/src/FiltrazioneReel.tsx`
- Modify: `video-reel/src/Root.tsx`

**Interfaces:**
- Produces: consts `MUTED = "#8090b0"`, `RED = "#ff4040"` (strings); functions `fi(frame: number, start: number, dur = 18): number`, `su(frame: number, start: number, dur = 22, dist = 80): number`, `sc(frame: number, start: number, dur = 22, from = 0.6): number`; component `Scene1: React.FC` (no props); exported component `FiltrazioneReel: React.FC` (no props), rendering `Scene1` inside a `TransitionSeries` with a single `Sequence` (no `Transition` yet — there is only one scene).
- Consumes: nothing (first task). Note: `BLUE`, `GOLD`, `GREEN` are **not** declared yet — Scene1 doesn't use them, and per the Global Constraints they must not be added until a later task's scene uses them (Task 2).

- [ ] **Step 1: Create `video-reel/src/FiltrazioneReel.tsx`**

Write this exact content:

```tsx
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: oswald } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

// ─── Palette ──────────────────────────────────────────────────────────────────

const RED = "#ff4040";
const MUTED = "#8090b0";

// ─── Animation helpers ────────────────────────────────────────────────────────

const SPRING = Easing.bezier(0.16, 1, 0.3, 1);

function fi(frame: number, start: number, dur = 18): number {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SPRING,
  });
}

function su(frame: number, start: number, dur = 22, dist = 80): number {
  return interpolate(frame, [start, start + dur], [dist, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SPRING,
  });
}

function sc(frame: number, start: number, dur = 22, from = 0.6): number {
  return interpolate(frame, [start, start + dur], [from, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SPRING,
  });
}

// ─── Scene 1: HOOK ────────────────────────────────────────────────────────────

const Scene1: React.FC = () => {
  const f = useCurrentFrame();

  const glow = interpolate(f, [90, 140], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #06060f 0%, #0c0c20 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 70px",
        gap: 10,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 60,
          fontWeight: 700,
          color: MUTED,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        MICROFILTRAZIONE.
      </div>

      <div
        style={{
          opacity: fi(f, 18),
          transform: `translateY(${su(f, 18)}px)`,
          fontFamily: oswald,
          fontSize: 60,
          fontWeight: 700,
          color: MUTED,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        ULTRAFILTRAZIONE.
      </div>

      <div
        style={{
          opacity: fi(f, 36),
          transform: `translateY(${su(f, 36)}px)`,
          fontFamily: oswald,
          fontSize: 60,
          fontWeight: 700,
          color: MUTED,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 26,
        }}
      >
        OSMOSI INVERSA.
      </div>

      <div
        style={{
          opacity: fi(f, 64),
          transform: `translateY(${su(f, 64)}px)`,
          fontFamily: inter,
          fontSize: 42,
          fontWeight: 600,
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        Sembrano la stessa cosa?
      </div>

      <div
        style={{
          opacity: fi(f, 90, 20),
          transform: `scale(${sc(f, 90, 22, 0.5)})`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 640,
            height: 300,
            background: `radial-gradient(ellipse, rgba(255,64,64,${glow}) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontFamily: oswald,
            fontSize: 104,
            fontWeight: 700,
            color: RED,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: "0 0 80px rgba(255,64,64,0.55)",
            position: "relative",
            lineHeight: 1.05,
          }}
        >
          NON LO SONO
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

export const FiltrazioneReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("go-beyond.mp3")} volume={0.28} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Register the composition in `Root.tsx`**

Replace the full content of `video-reel/src/Root.tsx` with:

```tsx
import "./index.css";
import { Composition } from "remotion";
import { WaterReel } from "./Composition";
import { DetrazioneReel } from "./DetrazioneReel";
import { FiltrazioneReel } from "./FiltrazioneReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WaterReel"
        component={WaterReel}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DetrazioneReel"
        component={DetrazioneReel}
        durationInFrames={825}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="FiltrazioneReel"
        component={FiltrazioneReel}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
```

(`durationInFrames={150}` is temporary — matches the single-scene composition from Step 1. It will be bumped in every later task.)

- [ ] **Step 3: Lint**

Run: `cd video-reel && npm run lint`
Expected: no errors (eslint + `tsc` both clean). This exact file was verified lint-clean while drafting this plan.

- [ ] **Step 4: Visual check**

Run: `cd video-reel && npx remotion still src/index.ts FiltrazioneReel out/qa-scene1.png --frame=120`
Then Read `video-reel/out/qa-scene1.png`.
Expected: dark navy vertical frame showing "MICROFILTRAZIONE. / ULTRAFILTRAZIONE. / OSMOSI INVERSA." stacked in muted blue-grey, "Sembrano la stessa cosa?" in white below, and "NON LO SONO" in large red glowing text at the bottom — all fully visible (frame 120 is past every fade-in in the scene).

- [ ] **Step 5: Commit**

```bash
git add video-reel/src/FiltrazioneReel.tsx video-reel/src/Root.tsx
git commit -m "$(cat <<'EOF'
feat: scaffold reel "Filtrazione" con scena hook

Primo passo del terzo reel Remotion (dopo WaterReel e DetrazioneReel):
helper di animazione condivisi e la scena 1 (hook) con i tre termini
tecnici a confronto.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Shared checklist components + Scene 2 (MICROFILTRAZIONE)

**Files:**
- Modify: `video-reel/src/FiltrazioneReel.tsx`
- Modify: `video-reel/src/Root.tsx`

**Interfaces:**
- Consumes: `fi`, `su`, `MUTED`, `oswald`, `inter` from Task 1.
- Produces: consts `BLUE = "#2596be"`, `GOLD = "#FFB800"`, `GREEN = "#35d07a"`; type `Level = "yes" | "partial" | "no"`; consts `SYMBOL: Record<Level, string>`, `LEVEL_COLOR: Record<Level, string>`; component `Divider: React.FC<{ opacity: number; color?: string }>`; component `FilterRow: React.FC<{ text: string; level: Level; delay: number; frame: number }>`; component `Scene2: React.FC` (no props); consts `TRANS_DUR = 15`, `timing` (from `linearTiming`), wired as the first `TransitionSeries.Transition` (between `Scene1` and `Scene2`).

- [ ] **Step 1: Add the palette additions and shared components**

In `video-reel/src/FiltrazioneReel.tsx`, replace this block:

```tsx
// ─── Palette ──────────────────────────────────────────────────────────────────

const RED = "#ff4040";
const MUTED = "#8090b0";
```

with:

```tsx
// ─── Palette ──────────────────────────────────────────────────────────────────

const BLUE = "#2596be";
const GOLD = "#FFB800";
const GREEN = "#35d07a";
const RED = "#ff4040";
const MUTED = "#8090b0";
```

Then, immediately before the `// ─── Scene 1: HOOK ──` comment, insert:

```tsx
// ─── Shared elements ──────────────────────────────────────────────────────────

const Divider: React.FC<{ opacity: number; color?: string }> = ({
  opacity,
  color = BLUE,
}) => (
  <div
    style={{
      width: "100%",
      height: 3,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      opacity,
      margin: "8px 0",
    }}
  />
);

type Level = "yes" | "partial" | "no";

const SYMBOL: Record<Level, string> = { yes: "✓", partial: "~", no: "✗" };
const LEVEL_COLOR: Record<Level, string> = {
  yes: GREEN,
  partial: GOLD,
  no: RED,
};

const FilterRow: React.FC<{
  text: string;
  level: Level;
  delay: number;
  frame: number;
}> = ({ text, level, delay, frame }) => (
  <div
    style={{
      opacity: fi(frame, delay),
      transform: `translateY(${su(frame, delay, 20)}px)`,
      display: "flex",
      alignItems: "center",
      gap: 22,
      width: "100%",
    }}
  >
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: "50%",
        background: `${LEVEL_COLOR[level]}22`,
        border: `2.5px solid ${LEVEL_COLOR[level]}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: inter,
        fontSize: 26,
        fontWeight: 700,
        color: LEVEL_COLOR[level],
      }}
    >
      {SYMBOL[level]}
    </div>
    <div
      style={{
        fontFamily: inter,
        fontSize: 34,
        fontWeight: 600,
        color: "#ffffff",
      }}
    >
      {text}
    </div>
  </div>
);

```

- [ ] **Step 2: Add `Scene2` immediately before `// ─── Main composition` comment**

Insert this block right after the closing `};` of `Scene1`:

```tsx
// ─── Scene 2: MICROFILTRAZIONE ─────────────────────────────────────────────────

const Scene2: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0c0c20 0%, #08131a 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 22,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 66,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "center",
        }}
      >
        MICROFILTRAZIONE
      </div>

      <div
        style={{
          opacity: fi(f, 14),
          fontFamily: inter,
          fontSize: 30,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Carbon Block
      </div>

      <Divider opacity={fi(f, 26)} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: "100%",
          marginTop: 8,
        }}
      >
        <FilterRow frame={f} delay={42} text="Cloro e odore" level="yes" />
        <FilterRow
          frame={f}
          delay={62}
          text="Alcuni batteri (parziale)"
          level="partial"
        />
        <FilterRow frame={f} delay={82} text="Metalli pesanti" level="no" />
        <FilterRow frame={f} delay={102} text="PFAS" level="no" />
        <FilterRow frame={f} delay={122} text="Residuo fisso" level="no" />
      </div>
    </AbsoluteFill>
  );
};

```

- [ ] **Step 3: Add transition imports/consts and wire `Scene2` into the `TransitionSeries`**

Replace this import block:

```tsx
import { TransitionSeries } from "@remotion/transitions";
```

with:

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
```

Then replace the `export const FiltrazioneReel` block with:

```tsx
const TRANS_DUR = 15;
const timing = linearTiming({ durationInFrames: TRANS_DUR });

export const FiltrazioneReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("go-beyond.mp3")} volume={0.28} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 4: Bump duration in `Root.tsx`**

In `video-reel/src/Root.tsx`, change the `FiltrazioneReel` composition's `durationInFrames={150}` to `durationInFrames={285}` (150 + 150 − 15 transition overlap).

- [ ] **Step 5: Lint**

Run: `cd video-reel && npm run lint`
Expected: clean. `BLUE`, `GOLD`, `GREEN` are now referenced (by `Divider`'s default and `LEVEL_COLOR`), `Divider`/`FilterRow`/`SYMBOL`/`LEVEL_COLOR`/`Level` are referenced by `Scene2`, `fade`/`timing` are referenced by the new `Transition`.

- [ ] **Step 6: Visual check**

Run: `cd video-reel && npx remotion still src/index.ts FiltrazioneReel out/qa-scene2.png --frame=280`
Then Read `video-reel/out/qa-scene2.png`.
Expected: "MICROFILTRAZIONE" title, "Carbon Block" subtitle, a horizontal divider, and 5 rows fully visible with colored circles: green ✓ "Cloro e odore", gold ~ "Alcuni batteri (parziale)", red ✗ "Metalli pesanti", red ✗ "PFAS", red ✗ "Residuo fisso".

- [ ] **Step 7: Commit**

```bash
git add video-reel/src/FiltrazioneReel.tsx video-reel/src/Root.tsx
git commit -m "$(cat <<'EOF'
feat: aggiungi scena Microfiltrazione al reel Filtrazione

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Scene 3 (ULTRAFILTRAZIONE)

**Files:**
- Modify: `video-reel/src/FiltrazioneReel.tsx`
- Modify: `video-reel/src/Root.tsx`

**Interfaces:**
- Consumes: `fi`, `su`, `Divider`, `FilterRow`, `BLUE`, `MUTED`, `oswald`, `inter` from Tasks 1-2. No new shared declarations in this task.
- Produces: component `Scene3: React.FC` (no props), wired after `Scene2`.

- [ ] **Step 1: Add `Scene3` immediately before `// ─── Main composition` comment**

Insert this block right after the closing `};` of `Scene2`:

```tsx
// ─── Scene 3: ULTRAFILTRAZIONE ─────────────────────────────────────────────────

const Scene3: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #08131a 0%, #090912 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 22,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 62,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "center",
        }}
      >
        ULTRAFILTRAZIONE
      </div>

      <div
        style={{
          opacity: fi(f, 14),
          fontFamily: inter,
          fontSize: 30,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Sistema a 3 stadi
      </div>

      <Divider opacity={fi(f, 26)} color={BLUE} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: "100%",
          marginTop: 8,
        }}
      >
        <FilterRow
          frame={f}
          delay={42}
          text="Cloro e monocloramina"
          level="yes"
        />
        <FilterRow frame={f} delay={62} text="Batteri e virus" level="yes" />
        <FilterRow frame={f} delay={82} text="Metalli pesanti" level="no" />
        <FilterRow
          frame={f}
          delay={102}
          text="PFAS (solo parziale)"
          level="partial"
        />
        <FilterRow frame={f} delay={122} text="Residuo fisso" level="no" />
      </div>
    </AbsoluteFill>
  );
};

```

- [ ] **Step 2: Wire `Scene3` into the `TransitionSeries`**

Replace the `export const FiltrazioneReel` block with:

```tsx
export const FiltrazioneReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("go-beyond.mp3")} volume={0.28} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Bump duration in `Root.tsx`**

Change `durationInFrames={285}` to `durationInFrames={420}` (285 + 150 − 15).

- [ ] **Step 4: Lint**

Run: `cd video-reel && npm run lint` — expect clean.

- [ ] **Step 5: Visual check**

Run: `cd video-reel && npx remotion still src/index.ts FiltrazioneReel out/qa-scene3.png --frame=415`
Then Read `video-reel/out/qa-scene3.png`.
Expected: "ULTRAFILTRAZIONE" title, "Sistema a 3 stadi" subtitle, blue divider, 5 rows: green ✓ "Cloro e monocloramina", green ✓ "Batteri e virus", red ✗ "Metalli pesanti", gold ~ "PFAS (solo parziale)", red ✗ "Residuo fisso".

- [ ] **Step 6: Commit**

```bash
git add video-reel/src/FiltrazioneReel.tsx video-reel/src/Root.tsx
git commit -m "$(cat <<'EOF'
feat: aggiungi scena Ultrafiltrazione al reel Filtrazione

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Scene 4 (OSMOSI INVERSA, con counter residuo fisso)

**Files:**
- Modify: `video-reel/src/FiltrazioneReel.tsx`
- Modify: `video-reel/src/Root.tsx`

**Interfaces:**
- Consumes: `fi`, `su`, `sc`, `Divider`, `GREEN`, `BLUE`, `GOLD`, `MUTED`, `Easing`, `interpolate`, `oswald`, `inter` from Tasks 1-2. No new shared declarations in this task.
- Produces: component `Scene4: React.FC` (no props), wired after `Scene3`.

- [ ] **Step 1: Add `Scene4` immediately before `// ─── Main composition` comment**

Insert this block right after the closing `};` of `Scene3`:

```tsx
// ─── Scene 4: OSMOSI INVERSA ────────────────────────────────────────────────────

const Scene4: React.FC = () => {
  const f = useCurrentFrame();

  const residuo = Math.round(
    interpolate(f, [80, 145], [300, 20], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    })
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #090912 0%, #061620 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 16,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 66,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "center",
        }}
      >
        OSMOSI INVERSA
      </div>

      <div
        style={{
          opacity: fi(f, 16),
          fontFamily: inter,
          fontSize: 28,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        Membrana 0,001 micron — 1000 volte più fitta
      </div>

      <Divider opacity={fi(f, 34)} color={GREEN} />

      <div
        style={{
          opacity: fi(f, 44),
          transform: `translateY(${su(f, 44)}px)`,
          fontFamily: inter,
          fontSize: 34,
          fontWeight: 700,
          color: GREEN,
          textAlign: "center",
          marginTop: 4,
        }}
      >
        Rimuove tutto: cloro, batteri, virus,
        <br />
        metalli pesanti, PFAS
      </div>

      <div
        style={{ position: "relative", margin: "18px 0 0", opacity: fi(f, 74) }}
      >
        <div
          style={{
            fontFamily: inter,
            fontSize: 28,
            fontWeight: 600,
            color: MUTED,
            textAlign: "center",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Residuo fisso
        </div>
        <div
          style={{
            fontFamily: oswald,
            fontSize: 150,
            fontWeight: 700,
            color: BLUE,
            lineHeight: 1,
            textAlign: "center",
            textShadow: "0 0 70px rgba(37,150,190,0.5)",
          }}
        >
          {residuo} <span style={{ fontSize: 60 }}>mg/L</span>
        </div>
      </div>

      <div
        style={{
          opacity: fi(f, 150, 15),
          transform: `scale(${sc(f, 150, 15, 0.6)})`,
          fontFamily: oswald,
          fontSize: 56,
          fontWeight: 700,
          color: GOLD,
          textAlign: "center",
          marginTop: 10,
          textShadow: "0 0 50px rgba(255,184,0,0.5)",
        }}
      >
        −93%
      </div>
    </AbsoluteFill>
  );
};

```

- [ ] **Step 2: Wire `Scene4` into the `TransitionSeries`**

Replace the `export const FiltrazioneReel` block with:

```tsx
export const FiltrazioneReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("go-beyond.mp3")} volume={0.28} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={165}>
          <Scene4 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Bump duration in `Root.tsx`**

Change `durationInFrames={420}` to `durationInFrames={570}` (420 + 165 − 15).

- [ ] **Step 4: Lint**

Run: `cd video-reel && npm run lint` — expect clean.

- [ ] **Step 5: Visual check**

Run: `cd video-reel && npx remotion still src/index.ts FiltrazioneReel out/qa-scene4.png --frame=565`
Then Read `video-reel/out/qa-scene4.png`.
Expected: "OSMOSI INVERSA" title, membrane subtitle, green divider, green "Rimuove tutto..." line, "Residuo fisso" label with a large blue number close to 20 mg/L, and a gold "−93%" badge below it.

- [ ] **Step 6: Commit**

```bash
git add video-reel/src/FiltrazioneReel.tsx video-reel/src/Root.tsx
git commit -m "$(cat <<'EOF'
feat: aggiungi scena Osmosi Inversa al reel Filtrazione

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Comparison table components + Scene 5 (TABELLA COMPARATIVA)

**Files:**
- Modify: `video-reel/src/FiltrazioneReel.tsx`
- Modify: `video-reel/src/Root.tsx`

**Interfaces:**
- Consumes: `fi`, `su`, `Level`, `SYMBOL`, `LEVEL_COLOR`, `BLUE`, `MUTED`, `oswald`, `inter` from Tasks 1-2.
- Produces: component `TableCell: React.FC<{ level: Level }>`; component `TableHeader: React.FC<{ frame: number }>`; component `TableRow: React.FC<{ label: string; carbon: Level; ultra: Level; osmosi: Level; delay: number; frame: number }>`; component `Scene5: React.FC` (no props), wired after `Scene4`.

- [ ] **Step 1: Add `TableCell`, `TableHeader`, `TableRow` right after the `FilterRow` component**

In `video-reel/src/FiltrazioneReel.tsx`, insert this block immediately after the closing `);` of `FilterRow` (still inside the `// ─── Shared elements ──` section, before `// ─── Scene 1: HOOK ──`):

```tsx

const TableCell: React.FC<{ level: Level }> = ({ level }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: `${LEVEL_COLOR[level]}22`,
        border: `2.5px solid ${LEVEL_COLOR[level]}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: inter,
        fontSize: 20,
        fontWeight: 700,
        color: LEVEL_COLOR[level],
      }}
    >
      {SYMBOL[level]}
    </div>
  </div>
);

const TableHeader: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      opacity: fi(frame, 14),
      display: "flex",
      alignItems: "flex-end",
      width: "100%",
      padding: "0 12px 10px",
    }}
  >
    <div style={{ flex: 1.5 }} />
    <div
      style={{
        flex: 1,
        fontFamily: inter,
        fontSize: 16,
        fontWeight: 700,
        color: MUTED,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        lineHeight: 1.2,
      }}
    >
      Carbon
      <br />
      Block
    </div>
    <div
      style={{
        flex: 1,
        fontFamily: inter,
        fontSize: 16,
        fontWeight: 700,
        color: MUTED,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        lineHeight: 1.2,
      }}
    >
      Ultra-
      <br />
      filtr.
    </div>
    <div
      style={{
        flex: 1,
        fontFamily: inter,
        fontSize: 16,
        fontWeight: 700,
        color: BLUE,
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: "0.03em",
        lineHeight: 1.2,
      }}
    >
      Osmosi
      <br />
      Inversa
    </div>
  </div>
);

const TableRow: React.FC<{
  label: string;
  carbon: Level;
  ultra: Level;
  osmosi: Level;
  delay: number;
  frame: number;
}> = ({ label, carbon, ultra, osmosi, delay, frame }) => (
  <div
    style={{
      opacity: fi(frame, delay),
      transform: `translateX(${su(frame, delay, 18, 40)}px)`,
      display: "flex",
      alignItems: "center",
      width: "100%",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "14px 12px",
    }}
  >
    <div
      style={{
        flex: 1.5,
        fontFamily: inter,
        fontSize: 24,
        fontWeight: 600,
        color: "#ffffff",
        paddingLeft: 6,
        lineHeight: 1.15,
      }}
    >
      {label}
    </div>
    <TableCell level={carbon} />
    <TableCell level={ultra} />
    <TableCell level={osmosi} />
  </div>
);
```

- [ ] **Step 2: Add `Scene5` immediately before `// ─── Main composition` comment**

Insert this block right after the closing `};` of `Scene4`:

```tsx
// ─── Scene 5: TABELLA COMPARATIVA ──────────────────────────────────────────────

const Scene5: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #061620 0%, #040a12 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 46px",
        gap: 18,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 58,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        IL CONFRONTO
      </div>

      <div style={{ width: "100%" }}>
        <TableHeader frame={f} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "100%",
          }}
        >
          <TableRow
            frame={f}
            delay={30}
            label="Cloro / odori"
            carbon="yes"
            ultra="yes"
            osmosi="yes"
          />
          <TableRow
            frame={f}
            delay={56}
            label="Batteri e virus"
            carbon="partial"
            ultra="yes"
            osmosi="yes"
          />
          <TableRow
            frame={f}
            delay={82}
            label="Metalli pesanti"
            carbon="no"
            ultra="no"
            osmosi="yes"
          />
          <TableRow
            frame={f}
            delay={108}
            label="PFAS"
            carbon="no"
            ultra="partial"
            osmosi="yes"
          />
          <TableRow
            frame={f}
            delay={134}
            label="Residuo fisso"
            carbon="no"
            ultra="no"
            osmosi="yes"
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

```

- [ ] **Step 3: Wire `Scene5` into the `TransitionSeries`**

Replace the `export const FiltrazioneReel` block with:

```tsx
export const FiltrazioneReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("go-beyond.mp3")} volume={0.28} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={165}>
          <Scene4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene5 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 4: Bump duration in `Root.tsx`**

Change `durationInFrames={570}` to `durationInFrames={735}` (570 + 180 − 15).

- [ ] **Step 5: Lint**

Run: `cd video-reel && npm run lint` — expect clean.

- [ ] **Step 6: Visual check**

Run: `cd video-reel && npx remotion still src/index.ts FiltrazioneReel out/qa-scene5.png --frame=725`
Then Read `video-reel/out/qa-scene5.png`.
Expected: "IL CONFRONTO" title, header row with "Carbon Block / Ultra-filtr. / Osmosi Inversa" column labels, and 5 data rows each with a label on the left and 3 colored circles (✓/~/✗) matching: Cloro (✓✓✓), Batteri e virus (~✓✓), Metalli pesanti (✗✗✓), PFAS (✗~✓), Residuo fisso (✗✗✓). All rows must fit within the frame without overflowing left/right edges.

- [ ] **Step 7: Commit**

```bash
git add video-reel/src/FiltrazioneReel.tsx video-reel/src/Root.tsx
git commit -m "$(cat <<'EOF'
feat: aggiungi tabella comparativa al reel Filtrazione

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Scene 6 (VERDETTO)

**Files:**
- Modify: `video-reel/src/FiltrazioneReel.tsx`
- Modify: `video-reel/src/Root.tsx`

**Interfaces:**
- Consumes: `fi`, `su`, `sc`, `Divider`, `GREEN`, `MUTED`, `oswald`, `inter` from Tasks 1-2. No new shared declarations in this task.
- Produces: component `Scene6: React.FC` (no props), wired after `Scene5`.

- [ ] **Step 1: Add `Scene6` immediately before `// ─── Main composition` comment**

Insert this block right after the closing `};` of `Scene5`:

```tsx
// ─── Scene 6: VERDETTO ─────────────────────────────────────────────────────────

const Scene6: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #040a12 0%, #04120e 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 24,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 56,
          fontWeight: 700,
          color: MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          textAlign: "center",
        }}
      >
        VUOI LA SOLUZIONE COMPLETA?
      </div>

      <Divider opacity={fi(f, 20)} color={GREEN} />

      <div
        style={{
          opacity: fi(f, 30, 20),
          transform: `scale(${sc(f, 30, 22, 0.6)})`,
          position: "relative",
          marginTop: 10,
        }}
      >
        <div
          style={{
            fontFamily: oswald,
            fontSize: 100,
            fontWeight: 700,
            color: GREEN,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.01em",
            textShadow: "0 0 80px rgba(53,208,122,0.55)",
            lineHeight: 1.05,
          }}
        >
          OSMOSI INVERSA
        </div>
      </div>

      <div
        style={{
          opacity: fi(f, 70),
          transform: `translateY(${su(f, 70)}px)`,
          fontFamily: inter,
          fontSize: 32,
          fontWeight: 600,
          color: "#ffffff",
          textAlign: "center",
          marginTop: 10,
        }}
      >
        Zero PFAS · Zero metalli pesanti
        <br />
        Acqua leggera e pura
      </div>
    </AbsoluteFill>
  );
};

```

- [ ] **Step 2: Wire `Scene6` into the `TransitionSeries`**

Replace the `export const FiltrazioneReel` block with:

```tsx
export const FiltrazioneReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("go-beyond.mp3")} volume={0.28} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={165}>
          <Scene4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene5 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene6 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Bump duration in `Root.tsx`**

Change `durationInFrames={735}` to `durationInFrames={840}` (735 + 120 − 15).

- [ ] **Step 4: Lint**

Run: `cd video-reel && npm run lint` — expect clean.

- [ ] **Step 5: Visual check**

Run: `cd video-reel && npx remotion still src/index.ts FiltrazioneReel out/qa-scene6.png --frame=830`
Then Read `video-reel/out/qa-scene6.png`.
Expected: "VUOI LA SOLUZIONE COMPLETA?" muted title, green divider, large green "OSMOSI INVERSA" text, and the "Zero PFAS · Zero metalli pesanti / Acqua leggera e pura" line below.

- [ ] **Step 6: Commit**

```bash
git add video-reel/src/FiltrazioneReel.tsx video-reel/src/Root.tsx
git commit -m "$(cat <<'EOF'
feat: aggiungi scena verdetto al reel Filtrazione

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Scene 7 (CTA) — reel completo

**Files:**
- Modify: `video-reel/src/FiltrazioneReel.tsx`
- Modify: `video-reel/src/Root.tsx`

**Interfaces:**
- Consumes: `fi`, `su`, `sc`, `interpolate`, `oswald`, `inter` from Task 1. No new shared declarations in this task.
- Produces: component `Scene7: React.FC` (no props), wired after `Scene6`. This completes `FiltrazioneReel`.

- [ ] **Step 1: Add `Scene7` immediately before `// ─── Main composition` comment**

Insert this block right after the closing `};` of `Scene6`:

```tsx
// ─── Scene 7: CTA ─────────────────────────────────────────────────────────────

const Scene7: React.FC = () => {
  const f = useCurrentFrame();

  const pulse = interpolate(f, [0, 40, 80], [1, 1.02, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #0e3a52 0%, #2596be 55%, #1b7a9c 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 30,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0, 20),
          transform: `scale(${sc(f, 0, 22, 0.85)})`,
          fontFamily: oswald,
          fontSize: 60,
          fontWeight: 700,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        GREEN WATER ITALIA
      </div>

      <div
        style={{
          width: 100,
          height: 4,
          background: "rgba(255,255,255,0.5)",
          borderRadius: 2,
          opacity: fi(f, 18),
        }}
      />

      <div
        style={{
          opacity: fi(f, 28),
          transform: `translateY(${su(f, 28)}px)`,
          fontFamily: oswald,
          fontSize: 68,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          lineHeight: 1.15,
        }}
      >
        SCOPRI QUALE FILTRO
        <br />
        TI SERVE
      </div>

      <div
        style={{
          opacity: fi(f, 48),
          transform: `translateY(${su(f, 48)}px) scale(${pulse})`,
          background: "rgba(255,255,255,0.18)",
          borderRadius: 20,
          padding: "22px 56px",
          fontFamily: inter,
          fontSize: 46,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          border: "2.5px solid rgba(255,255,255,0.35)",
          letterSpacing: "0.02em",
        }}
      >
        greenwateritalia.it
      </div>

      <div
        style={{
          opacity: fi(f, 65),
          fontFamily: inter,
          fontSize: 34,
          fontWeight: 600,
          color: "rgba(255,255,255,0.75)",
          textAlign: "center",
        }}
      >
        Consulenza gratuita · Analisi TDS inclusa
      </div>
    </AbsoluteFill>
  );
};

```

- [ ] **Step 2: Wire `Scene7` into the `TransitionSeries` (final composition)**

Replace the `export const FiltrazioneReel` block with:

```tsx
export const FiltrazioneReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("go-beyond.mp3")} volume={0.28} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={165}>
          <Scene4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene5 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene6 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={90}>
          <Scene7 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Bump duration in `Root.tsx` to its final value**

Change `durationInFrames={840}` to `durationInFrames={915}` (840 + 90 − 15). This is the final duration — it must not change again.

- [ ] **Step 4: Lint**

Run: `cd video-reel && npm run lint` — expect clean.

- [ ] **Step 5: Visual check**

Run: `cd video-reel && npx remotion still src/index.ts FiltrazioneReel out/qa-scene7.png --frame=910`
Then Read `video-reel/out/qa-scene7.png`.
Expected: brand-blue gradient background, "GREEN WATER ITALIA" header, "SCOPRI QUALE FILTRO TI SERVE" headline, a pill button with "greenwateritalia.it", and "Consulenza gratuita · Analisi TDS inclusa" subtitle — same visual family as the CTA scene of the other two reels.

- [ ] **Step 6: Commit**

```bash
git add video-reel/src/FiltrazioneReel.tsx video-reel/src/Root.tsx
git commit -m "$(cat <<'EOF'
feat: completa reel "Filtrazione" con la scena CTA

Reel a 7 scene (915 frame @ 30fps, ~30.5s) completo: hook,
microfiltrazione, ultrafiltrazione, osmosi inversa, tabella
comparativa, verdetto e CTA.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Render finale e pubblicazione come asset statico

**Files:**
- Create (render output, git-ignored): `video-reel/out/FiltrazioneReel.mp4`
- Create (tracked): `video/filtrazione-differenze-reel.mp4`

**Interfaces:**
- Consumes: the completed `FiltrazioneReel` composition from Task 7.
- Produces: a publicly-servable static video asset at `video/filtrazione-differenze-reel.mp4`, following the exact pattern established by `video/detrazione-50-reel.mp4` (see `git show 8c762a2 --stat`).

- [ ] **Step 1: Full render**

Run: `cd video-reel && npx remotion render src/index.ts FiltrazioneReel out/FiltrazioneReel.mp4`
Expected: command completes without error, `video-reel/out/FiltrazioneReel.mp4` exists and is a few MB in size (comparable to `video-reel/out/DetrazioneReel.mp4`).

- [ ] **Step 2: Spot-check the rendered composition**

Run:

```bash
cd video-reel && npx remotion still src/index.ts FiltrazioneReel out/qa-final-mid.png --frame=460
cd video-reel && npx remotion still src/index.ts FiltrazioneReel out/qa-final-end.png --frame=910
```

Read both `video-reel/out/qa-final-mid.png` and `video-reel/out/qa-final-end.png`.
Expected: `qa-final-mid.png` shows Scene4 (Osmosi Inversa) and `qa-final-end.png` shows the CTA — confirming the full composition still renders correctly end-to-end and matches the per-scene checks from Tasks 1-7.

- [ ] **Step 3: Copy the rendered video into the public `video/` folder**

Run: `cp video-reel/out/FiltrazioneReel.mp4 video/filtrazione-differenze-reel.mp4`

- [ ] **Step 4: Verify the file is tracked correctly**

Run: `git status --short video/filtrazione-differenze-reel.mp4`
Expected: shows as a new untracked file (`video-reel/out/` stays untracked/ignored per `video-reel/.gitignore`).

- [ ] **Step 5: Commit the published asset**

```bash
git add video/filtrazione-differenze-reel.mp4
git commit -m "$(cat <<'EOF'
chore: pubblica reel "Filtrazione: differenze" come asset statico

Serve un URL pubblico per la programmazione social via Metricool,
stesso schema del reel Detrazione 50%.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** all 7 scenes from the design spec are present (Task 1-7), the comparison table is Scene 5 (Task 5), the CTA matches the site URL and consulenza-gratuita/TDS messaging from the spec, `go-beyond.mp3` is used per the spec's music choice, palette constants match exactly, final duration (915f) matches the spec's formula.
- **Type consistency:** `Level`/`SYMBOL`/`LEVEL_COLOR` defined once in Task 2 and reused unchanged in Tasks 3, 4, 5; `FilterRow`/`TableRow`/`TableHeader`/`TableCell`/`Divider` prop shapes are identical every time they're used across tasks.
- **Placeholder scan:** no TBD/TODO; every step has full code, not descriptions of code.
- **Lint verified empirically, not assumed:** Task 1's exact file content was written to disk and run through `npm run lint` while drafting this plan — it passed clean. The original draft (which front-loaded `Divider`/`FilterRow`/`TableHeader`/`TableRow`/`fade`/`timing` in Task 1 before any scene used them) failed with 6 `no-unused-vars` errors; the task boundaries above were restructured specifically to fix this, moving each declaration into the task whose scene first references it.
