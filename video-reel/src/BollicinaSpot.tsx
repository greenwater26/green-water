import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: playfair } = loadPlayfair("italic", {
  weights: ["500"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin"],
});

// ─── Palette ──────────────────────────────────────────────────────────────────

const WHITE = "#ffffff";
const INK = "#0d2a33";
const AQUA = "#2596be";
const SAGE = "#35d07a";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = 30;

// ─── Timing ───────────────────────────────────────────────────────────────────

// go-beyond.mp3: the build-up peaks at 43.98s. We trim the track so that hit
// lands on DROP, the cut from the product hero to Sofia.
const DROP = 60;
const MUSIC_TRIM = Math.round(43.98 * FPS) - DROP;
const BEAT = 31.8; // two beats at ~113 BPM, in frames
const onBeat = (n: number) => Math.round(DROP + n * BEAT);

// Hero runs into the drop plus two beats, each b-roll scene holds six beats,
// the end card eight.
const CUTS = [
  0,
  onBeat(2),
  onBeat(5),
  onBeat(8),
  onBeat(11),
  onBeat(14),
  onBeat(17),
  onBeat(21),
];
export const BOLLICINA_SPOT_DURATION = CUTS[CUTS.length - 1];

// ─── Motion helpers ───────────────────────────────────────────────────────────

// Soft rise + unblur, slower and calmer than the reels' pop.
const Reveal: React.FC<{
  at: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s =
    frame < at
      ? 0
      : spring({
          frame: frame - at,
          fps,
          config: { stiffness: 70, damping: 18, mass: 1 },
        });
  return (
    <div
      style={{
        opacity: s,
        filter: s < 0.98 ? `blur(${(1 - s) * 14}px)` : undefined,
        transform: `translateY(${(1 - s) * 40}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const TEXT_SHADOW = "0 4px 30px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)";

const Kicker: React.FC<{ at: number; children: React.ReactNode }> = ({
  at,
  children,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 18], [0, 1], CLAMP);
  const track = interpolate(frame, [at, at + 40], [0.6, 0.35], CLAMP);
  return (
    <div
      style={{
        opacity: o,
        fontFamily: inter,
        fontWeight: 600,
        fontSize: 30,
        letterSpacing: `${track}em`,
        color: WHITE,
        textTransform: "uppercase",
        textAlign: "center",
        textShadow: TEXT_SHADOW,
      }}
    >
      {children}
    </div>
  );
};

const Headline: React.FC<{ at: number; children: React.ReactNode }> = ({
  at,
  children,
}) => (
  <Reveal
    at={at}
    style={{
      fontFamily: playfair,
      fontStyle: "italic",
      fontWeight: 500,
      fontSize: 96,
      lineHeight: 1.05,
      color: WHITE,
      textAlign: "center",
      textShadow: TEXT_SHADOW,
    }}
  >
    {children}
  </Reveal>
);

// ─── Scene shell: b-roll clip, slow drift, soft grade ────────────────────────

const Shell: React.FC<{
  clip: string;
  rate?: number;
  textAt?: "top" | "bottom";
  children?: React.ReactNode;
}> = ({ clip, rate = 0.85, textAt = "bottom", children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.06, 1.0], CLAMP);
  const fadeIn = interpolate(frame, [0, 8], [0, 1], CLAMP);
  const shade =
    textAt === "bottom"
      ? "linear-gradient(180deg, transparent 50%, rgba(5,20,26,0.55) 82%, rgba(5,20,26,0.7) 100%)"
      : "linear-gradient(180deg, rgba(5,20,26,0.6) 0%, rgba(5,20,26,0.35) 25%, transparent 45%)";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, opacity: fadeIn }}>
        <OffthreadVideo
          src={staticFile(clip)}
          playbackRate={rate}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: shade }} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 90% 75% at 50% 45%, transparent 60%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: textAt === "bottom" ? "flex-end" : "flex-start",
          flexDirection: "column",
          gap: 22,
          padding: textAt === "bottom" ? "0 70px 300px" : "260px 70px 0",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scenes ───────────────────────────────────────────────────────────────────

const SceneHero: React.FC = () => (
  <Shell clip="clip-bollicina/b0.mp4" rate={0.8} textAt="top">
    <Kicker at={14}>Bollicina Baby</Kicker>
    <Headline at={DROP - 18}>Acqua buona, a casa tua.</Headline>
  </Shell>
);

const SceneGlass: React.FC = () => (
  <Shell clip="clip-bollicina/b1.mp4">
    <Headline at={10}>Niente più casse d'acqua.</Headline>
  </Shell>
);

const ScenePour: React.FC = () => (
  <Shell clip="clip-bollicina/b2.mp4" textAt="top">
    <Kicker at={6}>Un tocco</Kicker>
    <Headline at={14}>Naturale…</Headline>
  </Shell>
);

const SceneBubbles: React.FC = () => (
  <Shell clip="clip-bollicina/b3.mp4" rate={0.7} textAt="top">
    <Headline at={8}>…o frizzante.</Headline>
  </Shell>
);

const SceneBottle: React.FC = () => (
  <Shell clip="clip-bollicina/b4.mp4">
    <Headline at={10}>Fresca, quando vuoi.</Headline>
  </Shell>
);

const SceneDrink: React.FC = () => (
  <Shell clip="clip-bollicina/b5.mp4" rate={0.8}>
    <Kicker at={8}>Osmosi inversa</Kicker>
    <Headline at={18}>Pura, ogni giorno.</Headline>
  </Shell>
);

const SceneEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, 14], [0, 1], CLAMP);
  const lift = spring({ frame, fps, config: { stiffness: 60, damping: 16 } });
  const float = Math.sin(frame / 22) * 6;
  return (
    <AbsoluteFill
      style={{
        opacity: fade,
        background:
          "radial-gradient(ellipse 80% 55% at 50% 42%, #ffffff 0%, #eef7f8 55%, #d7ecef 100%)",
        alignItems: "center",
        flexDirection: "column",
        paddingTop: 210,
      }}
    >
      <Img
        src={staticFile("logo-gw.png")}
        style={{
          height: 120,
          opacity: interpolate(frame, [6, 22], [0, 1], CLAMP),
        }}
      />
      <Img
        src={staticFile("bollicina-baby-senza-logo.png")}
        style={{
          height: 820,
          marginTop: 40,
          mixBlendMode: "multiply",
          transform: `translateY(${(1 - lift) * 80 + float}px) scale(${0.92 + 0.08 * lift})`,
          opacity: lift,
        }}
      />
      <Reveal
        at={18}
        style={{
          fontFamily: playfair,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 84,
          color: INK,
          marginTop: 34,
        }}
      >
        Bollicina Baby
      </Reveal>
      <Reveal
        at={28}
        style={{
          fontFamily: inter,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.32em",
          color: AQUA,
          textTransform: "uppercase",
          marginTop: 10,
        }}
      >
        Naturale · Frizzante · Fresca
      </Reveal>
      <Reveal at={44} style={{ marginTop: 50 }}>
        <div
          style={{
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 40,
            color: WHITE,
            background: `linear-gradient(90deg, ${AQUA}, ${SAGE})`,
            borderRadius: 999,
            padding: "20px 52px",
            boxShadow: "0 14px 40px rgba(37,150,190,0.35)",
          }}
        >
          CONSULENZA GRATUITA →
        </div>
      </Reveal>
      <Reveal
        at={54}
        style={{
          fontFamily: inter,
          fontWeight: 600,
          fontSize: 38,
          color: INK,
          marginTop: 24,
        }}
      >
        greenwateritalia.it
      </Reveal>
    </AbsoluteFill>
  );
};

// ─── Global overlays ──────────────────────────────────────────────────────────

const Bug: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [10, 26], [0, 0.95], CLAMP);
  if (frame >= CUTS[CUTS.length - 2]) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          borderRadius: 14,
          padding: "6px 12px",
        }}
      >
        <Img
          src={staticFile("logo-gw.png")}
          style={{ height: 46, display: "block" }}
        />
      </div>
    </div>
  );
};

// Soft white bloom on each cut instead of the reels' hard flash.
const CutBloom: React.FC = () => {
  const frame = useCurrentFrame();
  const bloom = CUTS.slice(1, -1).reduce(
    (acc, c) =>
      Math.max(acc, interpolate(frame, [c - 3, c, c + 10], [0, 0.35, 0], CLAMP)),
    0,
  );
  return (
    <AbsoluteFill
      style={{ background: WHITE, opacity: bloom, pointerEvents: "none" }}
    />
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.06,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        backgroundPosition: `${(frame * 37) % 160}px ${(frame * 53) % 160}px`,
      }}
    />
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

const SCENES = [
  SceneHero,
  SceneGlass,
  ScenePour,
  SceneBubbles,
  SceneBottle,
  SceneDrink,
  SceneEnd,
];

export const BollicinaSpot: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio
        src={staticFile("go-beyond.mp3")}
        trimBefore={MUSIC_TRIM}
        volume={(f) =>
          interpolate(
            f,
            [0, 12, durationInFrames - 40, durationInFrames],
            [0, 0.9, 0.9, 0],
            CLAMP,
          )
        }
      />
      <Sequence from={DROP - 9} durationInFrames={30} layout="none">
        <Audio src={staticFile("sfx-whoosh.wav")} volume={() => 0.3} />
      </Sequence>

      {SCENES.map((Scene, i) => (
        <Sequence
          key={i}
          from={CUTS[i]}
          durationInFrames={CUTS[i + 1] - CUTS[i]}
        >
          <Scene />
        </Sequence>
      ))}

      <Bug />
      <CutBloom />
      <Grain />
    </AbsoluteFill>
  );
};
