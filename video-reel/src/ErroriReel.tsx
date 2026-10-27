import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: oswald } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

// Reel "8 errori prima di comprare un depuratore", dall'articolo del blog.
// Solo musica (niente voce): gli sfondi sono clip b-roll già generate per gli
// spot cloro, filtri e residuo, riusate a costo zero.

// ─── Palette ──────────────────────────────────────────────────────────────────

const GOLD = "#FFB800";
const GREEN = "#35d07a";
const RED = "#ff4040";
const WHITE = "#ffffff";

// ─── Timing (cuts locked to the music beat) ───────────────────────────────────

// solutions-that-work.mp3 trimmed so the drop lands on frame 36, as in CloroReel.
const MUSIC_TRIM = 3689;
const DROP = 36;
const BEAT = 29.06; // two beats at ~124 BPM, in frames
const onBeat = (n: number) => Math.round(DROP + n * BEAT);

// Four beats per error: number, title and the "fai così" line, then ~2 s to read.
const HOOK_BEATS = 4.5;
const ERROR_BEATS = 4;

type Errore = { titolo: string; fix: string; clip: string };

const ERRORI: Errore[] = [
  {
    titolo: "Non analizzare l'acqua",
    fix: "Guarda i dati del tuo Comune o fai un test",
    clip: "clip-cloro/c4.mp4",
  },
  {
    titolo: "Confondere i filtri",
    fix: "Il carbone toglie il cloro. L'osmosi anche nitrati e PFAS",
    clip: "clip-filtri/f2.mp4",
  },
  {
    titolo: "Guardare solo il prezzo",
    fix: "Chiedi quanto costano i filtri ogni anno",
    clip: "clip-residuo/r4.mp4",
  },
  {
    titolo: "Impianto troppo piccolo",
    fix: "Sceglilo sui consumi di tutta la famiglia",
    clip: "clip-filtri/f8.mp4",
  },
  {
    titolo: "Saltare la manutenzione",
    fix: "Un filtro esaurito peggiora l'acqua",
    clip: "clip-filtri/f5.mp4",
  },
  {
    titolo: "Ignorare la pressione",
    fix: "Sotto i 3 bar l'osmosi inversa rende poco",
    clip: "clip-cloro/c7.mp4",
  },
  {
    titolo: "Installatore improvvisato",
    fix: "Chiedi chi installa e che garanzia dà",
    clip: "clip-cloro/c6.mp4",
  },
  {
    titolo: "Fidarsi della pubblicità",
    fix: "Chiedi le certificazioni NSF/ANSI",
    clip: "clip-residuo/r2.mp4",
  },
];

const CUTS = [
  0,
  ...ERRORI.map((_, i) => onBeat(HOOK_BEATS + i * ERROR_BEATS)),
  onBeat(HOOK_BEATS + ERRORI.length * ERROR_BEATS),
];
export const ERRORI_DURATION = CUTS[CUTS.length - 1] + 210;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const SHADOW = "0 6px 30px rgba(0,0,0,0.75), 0 2px 4px rgba(0,0,0,0.6)";

// ─── Motion helpers ───────────────────────────────────────────────────────────

const usePop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number, stiff = 210, damping = 13) =>
    frame < at
      ? 0
      : spring({
          frame: frame - at,
          fps,
          config: { stiffness: stiff, damping, mass: 0.7 },
        });
};

const shake = (frame: number, at: number, dur = 14, amp = 22) => {
  if (frame < at || frame > at + dur) return { x: 0, y: 0 };
  const t = frame - at;
  const k = 1 - t / dur;
  return { x: Math.sin(t * 2.7) * amp * k, y: Math.cos(t * 3.4) * amp * k };
};

type PopMode = "up" | "scale" | "stamp";

const Pop: React.FC<{
  at: number;
  mode?: PopMode;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, mode = "up", style, children }) => {
  const pop = usePop();
  const s = mode === "stamp" ? pop(at, 320, 16) : pop(at);
  const opacity = Math.min(1, s * 1.6);
  const blur = Math.max(0, (1 - s) * 12);
  let transform = "";
  if (mode === "up")
    transform = `translateY(${(1 - s) * 70}px) scale(${0.85 + 0.15 * s})`;
  if (mode === "scale") transform = `scale(${0.4 + 0.6 * s})`;
  if (mode === "stamp") transform = `scale(${2.6 - 1.6 * s}) rotate(-5deg)`;
  return (
    <div
      style={{
        display: "inline-block",
        opacity,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        transform,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Word-by-word reveal, the "editor caption" look.
const Words: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  style?: React.CSSProperties;
  highlight?: Record<string, string>;
}> = ({ text, at, stagger = 4, style, highlight = {} }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      columnGap: "0.26em",
      ...style,
    }}
  >
    {text.split(" ").map((w, i) => (
      <Pop
        key={i}
        at={at + i * stagger}
        style={highlight[w] ? { color: highlight[w] } : undefined}
      >
        {w}
      </Pop>
    ))}
  </div>
);

// ─── Scene shell: b-roll clip, punch-in, shade for legibility ─────────────────

const Shell: React.FC<{
  clip: string;
  impacts?: number[];
  shade?: number;
  justify?: "flex-start" | "center";
  children: React.ReactNode;
}> = ({ clip, impacts = [], shade = 0.72, justify = "flex-start", children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = spring({ frame, fps, config: { stiffness: 140, damping: 20 } });
  const scale = 1.1 - 0.1 * punch + frame * 0.0003;
  const sh = impacts.reduce(
    (acc, at) => {
      const s = shake(frame, at);
      return { x: acc.x + s.x, y: acc.y + s.y };
    },
    { x: 0, y: 0 },
  );

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(clip)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(4,10,16,${shade}) 0%, rgba(4,10,16,${shade * 0.75}) 45%, rgba(4,10,16,${shade * 0.35}) 68%, rgba(4,10,16,0.6) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          transform: `translate(${sh.x}px, ${sh.y}px)`,
          alignItems: "center",
          justifyContent: justify,
          flexDirection: "column",
          padding: justify === "flex-start" ? "300px 80px 0" : "0 80px",
          textShadow: SHADOW,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 0: HOOK ────────────────────────────────────────────────────────────

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(
    frame,
    [DROP, DROP + 10, DROP + 40],
    [0, 1, 0.55],
    CLAMP,
  );
  return (
    <Shell clip="clip-cloro/c1.mp4" impacts={[DROP]} justify="center" shade={0.62}>
      <Words
        text="STAI PER COMPRARE UN DEPURATORE?"
        at={0}
        stagger={4}
        highlight={{ "DEPURATORE?": GOLD }}
        style={{
          fontFamily: oswald,
          fontSize: 112,
          lineHeight: 1.04,
          color: WHITE,
        }}
      />
      <div style={{ height: 70 }} />
      {frame >= DROP && (
        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              width: 900,
              height: 420,
              top: -110,
              background: `radial-gradient(ellipse, rgba(255,64,64,${0.5 * glow}) 0%, transparent 65%)`,
            }}
          />
          <Pop at={DROP} mode="stamp">
            <div
              style={{
                fontFamily: oswald,
                fontSize: 190,
                lineHeight: 1,
                color: WHITE,
                background: RED,
                borderRadius: 26,
                padding: "8px 56px 20px",
                boxShadow: "0 0 80px rgba(255,64,64,0.5)",
                textShadow: "none",
              }}
            >
              8 ERRORI
            </div>
          </Pop>
        </div>
      )}
      <div style={{ height: 50 }} />
      <Words
        text="da evitare prima di firmare."
        at={DROP + 22}
        stagger={3}
        style={{
          fontFamily: inter,
          fontWeight: 800,
          fontSize: 60,
          color: WHITE,
        }}
      />
    </Shell>
  );
};

// ─── Scenes 1–8: one error each ───────────────────────────────────────────────

const SceneErrore: React.FC<{ n: number }> = ({ n }) => {
  const e = ERRORI[n];
  const frame = useCurrentFrame();
  const bar = interpolate(frame, [30, 44], [0, 1], CLAMP);
  return (
    <Shell clip={e.clip} impacts={[2]}>
      <Pop at={0} mode="scale">
        <div
          style={{
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 36,
            letterSpacing: "0.22em",
            color: GOLD,
            textTransform: "uppercase",
          }}
        >
          Errore {n + 1}/8
        </div>
      </Pop>
      <div style={{ height: 10 }} />
      <Pop at={2} mode="stamp">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 250,
            lineHeight: 1,
            color: WHITE,
            textShadow: "0 0 60px rgba(255,64,64,0.55), 0 6px 30px rgba(0,0,0,0.75)",
          }}
        >
          {String(n + 1).padStart(2, "0")}
        </div>
      </Pop>
      <div style={{ height: 26 }} />
      <Words
        text={e.titolo.toUpperCase()}
        at={8}
        stagger={3}
        style={{
          fontFamily: oswald,
          fontSize: 108,
          lineHeight: 1.04,
          color: WHITE,
        }}
      />
      <div style={{ height: 56 }} />
      <Pop at={30} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 22,
            background: "rgba(6,14,20,0.78)",
            border: `3px solid ${GREEN}`,
            borderRadius: 26,
            padding: "26px 32px",
            boxShadow: `0 0 50px rgba(53,208,122,${0.3 * bar})`,
            textShadow: "none",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: "0.14em",
              color: "#062012",
              background: GREEN,
              borderRadius: 12,
              padding: "8px 14px",
              marginTop: 6,
            }}
          >
            FAI COSÌ
          </div>
          <div
            style={{
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 50,
              lineHeight: 1.22,
              color: WHITE,
            }}
          >
            {e.fix}
          </div>
        </div>
      </Pop>
    </Shell>
  );
};

// ─── CTA ──────────────────────────────────────────────────────────────────────

const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse =
    1 + 0.035 * Math.max(0, Math.sin((frame - 70) / 6)) * (frame > 70 ? 1 : 0);
  const sweep = interpolate(frame, [80, 110], [-120, 220], CLAMP);

  return (
    <Shell clip="clip-filtri/f6.mp4" justify="center" shade={0.7}>
      <Words
        text="SAI COSA C'È"
        at={0}
        stagger={4}
        style={{ fontFamily: oswald, fontSize: 124, color: WHITE, lineHeight: 1 }}
      />
      <Words
        text="NELLA TUA ACQUA?"
        at={10}
        stagger={4}
        highlight={{ TUA: GOLD }}
        style={{ fontFamily: oswald, fontSize: 124, color: WHITE, lineHeight: 1.05 }}
      />
      <div style={{ height: 44 }} />
      <Words
        text="Salvalo e mandalo a chi sta per comprare un depuratore."
        at={30}
        stagger={2}
        style={{
          fontFamily: inter,
          fontWeight: 700,
          fontSize: 46,
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1.3,
        }}
      />
      <div style={{ height: 70 }} />
      <Pop
        at={58}
        style={{
          fontFamily: oswald,
          fontSize: 58,
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.9)",
        }}
      >
        GREEN WATER ITALIA
      </Pop>
      <div style={{ height: 22 }} />
      <Pop at={66} mode="scale">
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            transform: `scale(${pulse})`,
            background: WHITE,
            color: "#0e3a52",
            borderRadius: 999,
            padding: "24px 64px",
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 56,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            textShadow: "none",
          }}
        >
          greenwateritalia.it
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${sweep}%`,
              width: "30%",
              background:
                "linear-gradient(90deg, transparent, rgba(37,150,190,0.35), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
        </div>
      </Pop>
      <div style={{ height: 26 }} />
      <Pop
        at={78}
        style={{
          fontFamily: inter,
          fontWeight: 700,
          fontSize: 36,
          color: "rgba(255,255,255,0.88)",
        }}
      >
        Consulenza gratuita con test del residuo fisso
      </Pop>
    </Shell>
  );
};

// ─── Global overlays ──────────────────────────────────────────────────────────

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 10,
        width: `${(frame / (durationInFrames - 1)) * 100}%`,
        background: `linear-gradient(90deg, ${RED}, ${GOLD}, ${GREEN})`,
        boxShadow: "0 0 20px rgba(255,184,0,0.6)",
      }}
    />
  );
};

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = [...CUTS.slice(1), DROP].reduce(
    (acc, c) =>
      Math.max(
        acc,
        interpolate(frame, [c, c + 6], [0.4, 0], CLAMP) * (frame >= c ? 1 : 0),
      ),
    0,
  );
  return (
    <AbsoluteFill
      style={{ background: WHITE, opacity: flash, pointerEvents: "none" }}
    />
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ opacity: 0.07, mixBlendMode: "overlay", pointerEvents: "none" }}
    >
      <svg width={1080} height={1920}>
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={frame % 12}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

// ─── Sound design ─────────────────────────────────────────────────────────────

type Sfx = { at: number; src: string; volume: number };

const SFX: Sfx[] = [
  // whooshes lead into every cut (peak ~9 frames after start)
  ...CUTS.slice(1).map((c) => ({
    at: c - 9,
    src: "sfx-whoosh.wav",
    volume: 0.45,
  })),
  { at: DROP, src: "sfx-impact.wav", volume: 0.5 },
  // each error: impact on the number, pop on the "fai così" box
  ...ERRORI.flatMap((_, i) => [
    { at: CUTS[i + 1] + 2, src: "sfx-impact.wav", volume: 0.35 },
    { at: CUTS[i + 1] + 30, src: "sfx-pop.wav", volume: 0.5 },
  ]),
  { at: CUTS[CUTS.length - 1] + 66, src: "sfx-pop.wav", volume: 0.6 },
];

// ─── Main composition ─────────────────────────────────────────────────────────

const SCENES: React.FC[] = [
  SceneHook,
  ...ERRORI.map((_, i) => {
    const S: React.FC = () => <SceneErrore n={i} />;
    S.displayName = `SceneErrore${i + 1}`;
    return S;
  }),
  SceneCta,
];

export const ErroriReel: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio
        src={staticFile("solutions-that-work.mp3")}
        trimBefore={MUSIC_TRIM}
        volume={(f) =>
          interpolate(
            f,
            [0, 4, durationInFrames - 24, durationInFrames],
            [0, 0.62, 0.62, 0],
            CLAMP,
          )
        }
      />
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={30} layout="none">
          <Audio src={staticFile(s.src)} volume={() => s.volume} />
        </Sequence>
      ))}

      {SCENES.map((Scene, i) => {
        const from = CUTS[i];
        const to = i + 1 < CUTS.length ? CUTS[i + 1] : durationInFrames;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <Scene />
          </Sequence>
        );
      })}

      <CutFlash />
      <Grain />
      <ProgressBar />
    </AbsoluteFill>
  );
};
