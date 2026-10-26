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
import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: oswald } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: inter } = loadInter("normal", {
  weights: ["500", "700", "800", "900"],
  subsets: ["latin"],
});

// ─── Palette ──────────────────────────────────────────────────────────────────

const BLUE = "#2596be";
const GOLD = "#FFB800";
const GREEN = "#35d07a";
const RED = "#ff4040";
const MUTED = "#c3cbe0";
const WHITE = "#ffffff";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FPS = 30;

// ─── Voiceover script ─────────────────────────────────────────────────────────

// One continuous, unedited ElevenLabs v4 take ("Elena"). Separate short takes
// drifted towards an English accent, and trimming the pauses made the reading
// sound like it stumbled, so the scenes are cut on the take's own pauses.
// `start` is where each scene begins in the take (mid-pause, seconds) and the
// word starts are seconds into the whole take, from faster-whisper; the words
// are the authored script, so the captions never show transcription mistakes.
type Word = [string, number];
type Line = {
  start: number;
  clip: string;
  clipDur: number;
  words: Word[];
};

const VO_FILE = "vo-cloro/elena-take.mp3";
const VO_DUR = 48.93;

const LINES: Line[] = [
  {
    start: 0,
    clip: "clip-cloro/c1.mp4",
    clipDur: 6,
    words: [
      ["Il", 0],
      ["cloro", 0.28],
      ["nell'acqua", 0.62],
      ["del", 1.08],
      ["rubinetto", 1.22],
      ["fa", 1.84],
      ["male?", 2.06],
      ["No.", 2.9],
      ["Il", 3.66],
      ["problema", 3.86],
      ["è", 4.12],
      ["un", 4.32],
      ["altro.", 4.5],
    ],
  },
  {
    start: 5,
    clip: "clip-cloro/c2.mp4",
    clipDur: 6,
    words: [
      ["In", 5.24],
      ["Italia,", 5.4],
      ["al", 6.04],
      ["rubinetto,", 6.14],
      ["il", 7.06],
      ["cloro", 7.24],
      ["è", 7.42],
      ["pochissimo.", 7.68],
      ["Molto", 8.76],
      ["meno", 9.12],
      ["che", 9.3],
      ["in", 9.42],
      ["piscina.", 9.56],
    ],
  },
  {
    start: 10.28,
    clip: "clip-cloro/c3.mp4",
    clipDur: 10,
    words: [
      ["Il", 10.52],
      ["vero", 10.68],
      ["problema", 11.14],
      ["nasce", 11.48],
      ["quando", 11.92],
      ["il", 12.16],
      ["cloro", 12.42],
      ["reagisce", 12.68],
      ["con", 13.2],
      ["la", 13.42],
      ["materia", 13.58],
      ["organica,", 13.82],
      ["e", 14.48],
      ["si", 14.9],
      ["formano", 15.14],
      ["i", 15.44],
      ["trialometani.", 15.64],
      ["E", 16.72],
      ["con", 16.94],
      ["il", 17.14],
      ["caldo,", 17.36],
      ["d'estate,", 17.86],
      ["ancora", 18.84],
      ["di", 19.04],
      ["più.", 19.26],
    ],
  },
  {
    start: 19.62,
    clip: "clip-cloro/c4.mp4",
    clipDur: 9,
    words: [
      ["Il", 19.86],
      ["più", 20.06],
      ["diffuso", 20.24],
      ["è", 20.72],
      ["il", 20.92],
      ["cloroformio,", 21.12],
      ["classificato", 22.18],
      ["come", 22.82],
      ["possibile", 23.1],
      ["cancerogeno.", 23.64],
      ["Conta", 24.98],
      ["l'esposizione", 25.22],
      ["di", 25.94],
      ["ogni", 26.2],
      ["giorno,", 26.42],
      ["per", 27],
      ["anni.", 27.28],
    ],
  },
  {
    start: 27.87,
    clip: "clip-cloro/c5.mp4",
    clipDur: 8,
    words: [
      ["Per", 28.12],
      ["questo", 28.28],
      ["in", 28.58],
      ["Italia", 28.82],
      ["il", 29.18],
      ["limite", 29.54],
      ["è", 29.84],
      ["di", 30.12],
      ["trenta", 30.32],
      ["microgrammi", 30.62],
      ["per", 31.26],
      ["litro.", 31.5],
      ["Oltre", 32.44],
      ["tre", 32.72],
      ["volte", 32.94],
      ["più", 33.24],
      ["severo", 33.5],
      ["dell'Europa.", 33.9],
    ],
  },
  {
    start: 34.75,
    clip: "clip-cloro/c6.mp4",
    clipDur: 10,
    words: [
      ["Lasciarla", 35.12],
      ["riposare", 35.46],
      ["in", 35.94],
      ["caraffa", 36.08],
      ["non", 36.5],
      ["basta.", 36.72],
      ["Il", 37.66],
      ["carbone", 37.86],
      ["attivo", 38.18],
      ["toglie", 38.58],
      ["cloro", 38.96],
      ["e", 39.38],
      ["sapore.", 39.66],
      ["Per", 40.54],
      ["eliminare", 40.68],
      ["anche", 41.22],
      ["i", 41.44],
      ["trialometani", 41.66],
      ["serve", 42.42],
      ["l'osmosi", 42.78],
      ["inversa.", 43.46],
    ],
  },
  {
    start: 44.15,
    clip: "clip-cloro/c7.mp4",
    clipDur: 5.04,
    words: [
      ["Vuoi", 44.46],
      ["sapere", 44.6],
      ["cosa", 44.92],
      ["c'è", 45.14],
      ["nella", 45.36],
      ["tua", 45.54],
      ["acqua?", 45.7],
      ["Scrivici,", 46.6],
      ["la", 47.36],
      ["consulenza", 47.64],
      ["è", 48.08],
      ["gratuita.", 48.28],
    ],
  },
];

// The take starts VO_AT frames into the video; LEAD is when each scene's
// kicker appears; the end card holds END_HOLD seconds after the take ends.
const VO_AT = 6;
const LEAD = 6;
const END_HOLD = 2.6;
const toFrame = (sec: number) => VO_AT + Math.round(sec * FPS);

const CUTS = [
  0,
  ...LINES.slice(1).map((l) => toFrame(l.start)),
  toFrame(VO_DUR + END_HOLD),
];
const SCENE_FRAMES = LINES.map((_, i) => CUTS[i + 1] - CUTS[i]);
export const CLORO_SPOT_DURATION = CUTS[CUTS.length - 1];

// Frame (inside scene i) at which word `w` of line i starts.
const at = (i: number, w: string, nth = 0) => {
  const hits = LINES[i].words.filter(([t]) => t === w);
  return toFrame(hits[nth][1]) - CUTS[i];
};

// ─── Motion helpers ───────────────────────────────────────────────────────────

const usePop = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (from: number, stiff = 210, damping = 13) =>
    frame < from
      ? 0
      : spring({
          frame: frame - from,
          fps,
          config: { stiffness: stiff, damping, mass: 0.7 },
        });
};

type PopMode = "up" | "scale" | "stamp";

const Pop: React.FC<{
  at: number;
  mode?: PopMode;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at: from, mode = "up", style, children }) => {
  const pop = usePop();
  const s = mode === "stamp" ? pop(from, 320, 16) : pop(from);
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

const Kicker: React.FC<{
  at: number;
  color?: string;
  children: React.ReactNode;
}> = ({ at: from, color = GOLD, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 10], [0, 1], CLAMP);
  const track = interpolate(frame, [from, from + 24], [0.5, 0.22], CLAMP);
  return (
    <div
      style={{
        opacity: o,
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: `${track}em`,
        color,
        textTransform: "uppercase",
        textAlign: "center",
        textShadow: "0 2px 12px rgba(0,0,0,0.8)",
      }}
    >
      {children}
    </div>
  );
};

const Source: React.FC<{ at: number; children: React.ReactNode }> = ({
  at: from,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: interpolate(frame, [from, from + 12], [0, 0.85], CLAMP),
        fontFamily: inter,
        fontWeight: 500,
        fontSize: 26,
        color: MUTED,
        textAlign: "center",
        textShadow: "0 2px 10px rgba(0,0,0,0.9)",
      }}
    >
      {children}
    </div>
  );
};

const BIG_SHADOW = "0 6px 30px rgba(0,0,0,0.75), 0 2px 4px rgba(0,0,0,0.6)";

// ─── Scene shell: b-roll clip, punch-in, gradients ───────────────────────────

const Shell: React.FC<{
  i: number;
  topShade?: number;
  children: React.ReactNode;
}> = ({ i, topShade = 0.7, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = spring({ frame, fps, config: { stiffness: 140, damping: 20 } });
  const scale = 1.1 - 0.1 * punch + frame * 0.0003;
  const line = LINES[i];
  // Slow the clip down only when it is shorter than the scene.
  const rate = Math.min(1, (line.clipDur * FPS) / SCENE_FRAMES[i]);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(line.clip)}
          playbackRate={rate}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(4,10,16,${topShade}) 0%, rgba(4,10,16,${topShade * 0.6}) 38%, transparent 58%, rgba(4,10,16,0.55) 100%)`,
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
          alignItems: "center",
          justifyContent: "flex-start",
          flexDirection: "column",
          padding: "250px 80px 0",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 1: HOOK ────────────────────────────────────────────────────────────

const SceneHook: React.FC = () => (
  <Shell i={0}>
    <Pop
      at={at(0, "cloro")}
      style={{
        fontFamily: oswald,
        fontSize: 112,
        lineHeight: 1.02,
        color: WHITE,
        textAlign: "center",
        textShadow: BIG_SHADOW,
      }}
    >
      IL CLORO NELL'ACQUA
    </Pop>
    <Pop
      at={at(0, "fa")}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 64,
        color: GOLD,
        marginTop: 8,
        textShadow: BIG_SHADOW,
      }}
    >
      fa male?
    </Pop>
    <div style={{ height: 40 }} />
    <Pop at={at(0, "No.")} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 190,
          lineHeight: 1,
          color: RED,
          border: `10px solid ${RED}`,
          borderRadius: 26,
          padding: "4px 54px 14px",
          background: "rgba(10,4,6,0.55)",
          textShadow: "0 0 60px rgba(255,64,64,0.6)",
          boxShadow: "0 0 70px rgba(255,64,64,0.35)",
        }}
      >
        NO.
      </div>
    </Pop>
    <div style={{ height: 40 }} />
    <Pop at={at(0, "altro.")} mode="scale">
      <span
        style={{
          fontFamily: oswald,
          fontSize: 72,
          color: "#1a0d00",
          background: GOLD,
          padding: "0 26px 6px",
          borderRadius: 14,
          display: "inline-block",
          whiteSpace: "nowrap",
          transform: "rotate(-2deg)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        IL PROBLEMA È UN ALTRO
      </span>
    </Pop>
  </Shell>
);

// ─── Scene 2: QUANTO CLORO ────────────────────────────────────────────────────

const ScaleRow: React.FC<{
  label: string;
  value: string;
  max: number; // mg/L, on a 0–5 scale
  color: string;
  at: number;
}> = ({ label, value, max, color, at: from }) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [from + 4, from + 22], [0, 1], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <Pop at={from} style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          background: "rgba(4,14,22,0.6)",
          borderRadius: 18,
          padding: "14px 22px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 40,
              color: WHITE,
            }}
          >
            {label}
          </span>
          <span style={{ fontFamily: oswald, fontSize: 52, color }}>
            {value}
          </span>
        </div>
        <div
          style={{
            height: 22,
            marginTop: 8,
            borderRadius: 11,
            background: "rgba(255,255,255,0.15)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.max(1.5, (max / 5) * 100) * fill}%`,
              background: color,
              boxShadow: `0 0 24px ${color}`,
            }}
          />
        </div>
      </div>
    </Pop>
  );
};

const SceneHowMuch: React.FC = () => {
  const frame = useCurrentFrame();
  const from = at(1, "rubinetto,");
  const t = interpolate(frame, [from, from + 22], [0, 1], {
    ...CLAMP,
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const molto = at(1, "Molto");
  return (
    <Shell i={1}>
      <Kicker at={LEAD} color={WHITE}>
        Cloro nel rubinetto italiano
      </Kicker>
      <div style={{ height: 10 }} />
      <Pop at={from} mode="scale">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 170,
            lineHeight: 1,
            color: WHITE,
            textShadow: BIG_SHADOW,
          }}
        >
          {(0.05 * t).toFixed(2).replace(".", ",")}–
          {(0.3 * t).toFixed(1).replace(".", ",")}
          <span style={{ fontSize: 64, color: WHITE, marginLeft: 14 }}>
            mg/L
          </span>
        </div>
      </Pop>
      <div style={{ height: 36 }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
        }}
      >
        <ScaleRow
          label="Rubinetto"
          value="0,05–0,3"
          max={0.3}
          color={GREEN}
          at={molto}
        />
        <ScaleRow
          label="Piscina"
          value="1–2"
          max={2}
          color={GOLD}
          at={molto + 10}
        />
        <ScaleRow
          label="Linea guida OMS"
          value="5"
          max={5}
          color={RED}
          at={molto + 20}
        />
      </div>
      <div style={{ height: 18 }} />
      <Source at={molto + 30}>
        D.Lgs. 18/2023: valore consigliato 0,2 mg/L
      </Source>
    </Shell>
  );
};

// ─── Scene 3: IL VERO PROBLEMA ────────────────────────────────────────────────

const Chip: React.FC<{ at: number; color: string; children: string }> = ({
  at: from,
  color,
  children,
}) => (
  <Pop at={from} mode="scale">
    <div
      style={{
        fontFamily: oswald,
        fontSize: 70,
        lineHeight: 1,
        color: WHITE,
        border: `5px solid ${color}`,
        background: "rgba(4,10,16,0.7)",
        borderRadius: 20,
        padding: "14px 32px 18px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  </Pop>
);

const SceneThm: React.FC = () => (
  <Shell i={2}>
    <Kicker at={LEAD} color={RED}>
      Il vero problema
    </Kicker>
    <div style={{ height: 26 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <Chip at={at(2, "cloro")} color={BLUE}>
        CLORO
      </Chip>
      <Pop
        at={at(2, "materia") - 4}
        mode="scale"
        style={{
          fontFamily: oswald,
          fontSize: 80,
          color: WHITE,
          textShadow: BIG_SHADOW,
        }}
      >
        +
      </Pop>
    </div>
    <div style={{ height: 14 }} />
    <Chip at={at(2, "materia")} color={GREEN}>
      MATERIA ORGANICA
    </Chip>
    <Pop
      at={at(2, "formano")}
      mode="scale"
      style={{
        fontFamily: oswald,
        fontSize: 80,
        color: WHITE,
        margin: "4px 0",
        textShadow: BIG_SHADOW,
      }}
    >
      =
    </Pop>
    <Pop at={at(2, "trialometani.")} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 150,
          lineHeight: 1,
          color: WHITE,
          background: RED,
          borderRadius: 22,
          padding: "8px 44px 18px",
          boxShadow: "0 0 90px rgba(255,64,64,0.55)",
        }}
      >
        THM
      </div>
    </Pop>
    <Pop
      at={at(2, "trialometani.") + 8}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 46,
        color: WHITE,
        marginTop: 10,
        textShadow: BIG_SHADOW,
      }}
    >
      trialometani
    </Pop>
    <div style={{ height: 26 }} />
    <Pop at={at(2, "caldo,")} mode="scale">
      <div
        style={{
          fontFamily: inter,
          fontWeight: 900,
          fontSize: 44,
          color: "#1a0d00",
          background: GOLD,
          borderRadius: 999,
          padding: "12px 34px",
        }}
      >
        ☀ D'ESTATE SE NE FORMANO DI PIÙ
      </div>
    </Pop>
  </Shell>
);

// ─── Scene 4: CLOROFORMIO ─────────────────────────────────────────────────────

const SceneChloroform: React.FC = () => (
  <Shell i={3}>
    <Kicker at={LEAD}>Il THM più diffuso</Kicker>
    <div style={{ height: 10 }} />
    <Pop
      at={at(3, "cloroformio,")}
      mode="scale"
      style={{
        fontFamily: oswald,
        fontSize: 150,
        lineHeight: 1,
        color: WHITE,
        textShadow: BIG_SHADOW,
      }}
    >
      CLOROFORMIO
    </Pop>
    <div style={{ height: 34 }} />
    <Pop at={at(3, "possibile")} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 78,
          lineHeight: 1.05,
          color: WHITE,
          background: RED,
          borderRadius: 18,
          padding: "12px 34px 20px",
          boxShadow: "0 0 90px rgba(255,64,64,0.55)",
          textAlign: "center",
        }}
      >
        POSSIBILE CANCEROGENO
      </div>
    </Pop>
    <div style={{ height: 18 }} />
    <Pop
      at={at(3, "cancerogeno.")}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 46,
        color: GOLD,
        textShadow: BIG_SHADOW,
      }}
    >
      IARC · Gruppo 2B
    </Pop>
    <div style={{ height: 34 }} />
    <Pop at={at(3, "ogni")} mode="scale">
      <div
        style={{
          fontFamily: inter,
          fontWeight: 900,
          fontSize: 46,
          color: WHITE,
          background: "rgba(4,10,16,0.7)",
          border: `3px solid ${GOLD}`,
          borderRadius: 999,
          padding: "12px 34px",
        }}
      >
        OGNI GIORNO, PER ANNI
      </div>
    </Pop>
  </Shell>
);

// ─── Scene 5: LIMITE ──────────────────────────────────────────────────────────

const SceneLimit: React.FC = () => {
  const frame = useCurrentFrame();
  const from = at(4, "trenta");
  const n = interpolate(frame, [from, from + 20], [0, 30], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <Shell i={4}>
      <Kicker at={LEAD} color={WHITE}>
        Limite THM in Italia
      </Kicker>
      <div style={{ height: 10 }} />
      <Pop at={from} mode="scale">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 220,
            lineHeight: 1,
            color: WHITE,
            textShadow: BIG_SHADOW,
          }}
        >
          {Math.round(n)}
          <span style={{ fontSize: 80, marginLeft: 16 }}>µg/L</span>
        </div>
      </Pop>
      <div style={{ height: 24 }} />
      <Pop at={at(4, "Oltre")}>
        <div
          style={{
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 46,
            color: WHITE,
            background: "rgba(4,10,16,0.65)",
            borderRadius: 16,
            padding: "10px 26px",
          }}
        >
          Direttiva UE:{" "}
          <span style={{ textDecoration: "line-through", color: MUTED }}>
            100 µg/L
          </span>
        </div>
      </Pop>
      <div style={{ height: 30 }} />
      <Pop at={at(4, "tre")} mode="stamp">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 72,
            lineHeight: 1,
            color: "#1a0d00",
            background: GOLD,
            borderRadius: 16,
            padding: "8px 30px 14px",
            whiteSpace: "nowrap",
          }}
        >
          OLTRE 3 VOLTE PIÙ SEVERO
        </div>
      </Pop>
      <div style={{ height: 22 }} />
      <Source at={at(4, "severo")}>
        D.Lgs. 18/2023 · Direttiva UE 2020/2184
      </Source>
    </Shell>
  );
};

// ─── Scene 6: COSA FUNZIONA ───────────────────────────────────────────────────

type Level = "good" | "mid" | "bad";
const LEVEL_COLOR: Record<Level, string> = { good: GREEN, mid: GOLD, bad: RED };

const Cell: React.FC<{ value: string; level: Level }> = ({ value, level }) => (
  <div
    style={{
      width: 210,
      textAlign: "center",
      fontFamily: oswald,
      fontSize: 48,
      lineHeight: 1,
      padding: "12px 0 16px",
      borderRadius: 14,
      color: LEVEL_COLOR[level],
      background: "rgba(0,0,0,0.45)",
    }}
  >
    {value}
  </div>
);

const MethodRow: React.FC<{
  label: string;
  cloro: [string, Level];
  thm: [string, Level];
  at: number;
  dimAt?: number;
  winner?: boolean;
}> = ({ label, cloro, thm, at: from, dimAt, winner }) => {
  const frame = useCurrentFrame();
  const dim =
    dimAt === undefined
      ? 1
      : interpolate(frame, [dimAt, dimAt + 8], [1, 0.45], CLAMP);
  const pulse = winner
    ? 1 +
      0.025 *
        Math.max(0, Math.sin((frame - from) / 5)) *
        (frame > from + 24 ? 1 : 0)
    : 1;
  return (
    <div style={{ width: "100%", opacity: dim }}>
      <Pop at={from} style={{ width: "100%" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 20px",
            borderRadius: 22,
            background: winner ? "rgba(10,60,36,0.85)" : "rgba(4,12,18,0.78)",
            border: `3px solid ${winner ? GREEN : "rgba(255,255,255,0.15)"}`,
            boxShadow: winner ? "0 0 60px rgba(53,208,122,0.45)" : undefined,
            transform: `scale(${pulse})`,
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 38,
              lineHeight: 1.1,
              color: WHITE,
            }}
          >
            {label}
          </span>
          <Cell value={cloro[0]} level={cloro[1]} />
          <Cell value={thm[0]} level={thm[1]} />
        </div>
      </Pop>
    </div>
  );
};

const SceneFilters: React.FC = () => {
  const osmosi = at(5, "l'osmosi");
  return (
    <Shell i={5} topShade={0.8}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          width: "100%",
        }}
      >
        <Pop at={LEAD} style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              gap: 14,
              padding: "0 23px",
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: "0.18em",
              color: WHITE,
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            <span style={{ flex: 1 }} />
            <span style={{ width: 210, textAlign: "center" }}>CLORO</span>
            <span style={{ width: 210, textAlign: "center" }}>THM</span>
          </div>
        </Pop>
        <MethodRow
          label="Caraffa a riposo"
          cloro={["50-80%", "mid"]}
          thm={["NO", "bad"]}
          at={at(5, "caraffa")}
          dimAt={osmosi}
        />
        <MethodRow
          label="Carbone attivo"
          cloro={[">99%", "good"]}
          thm={["PARZIALE", "mid"]}
          at={at(5, "carbone")}
          dimAt={osmosi}
        />
        <MethodRow
          label="Osmosi inversa"
          cloro={[">99%", "good"]}
          thm={[">90%", "good"]}
          at={osmosi}
          winner
        />
      </div>
      <div style={{ height: 16 }} />
      <Source at={osmosi + 10}>Rese di rimozione indicative</Source>
    </Shell>
  );
};

// ─── Scene 7: CTA ─────────────────────────────────────────────────────────────

const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = at(6, "consulenza");
  const pulse =
    1 +
    0.035 *
      Math.max(0, Math.sin((frame - btn - 12) / 6)) *
      (frame > btn + 12 ? 1 : 0);
  return (
    <Shell i={6} topShade={0.35}>
      <Pop at={LEAD} mode="scale">
        <div
          style={{
            background: WHITE,
            borderRadius: 44,
            padding: "22px 34px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          }}
        >
          <Img
            src={staticFile("logo-gw.png")}
            style={{ height: 230, display: "block" }}
          />
        </div>
      </Pop>
      <div style={{ height: 36 }} />
      <Pop
        at={at(6, "cosa")}
        style={{
          fontFamily: oswald,
          fontSize: 92,
          lineHeight: 1.02,
          color: WHITE,
          textAlign: "center",
          textShadow: BIG_SHADOW,
        }}
      >
        SAI COSA C'È NELLA <span style={{ color: GOLD }}>TUA</span> ACQUA?
      </Pop>
      <div style={{ height: 36 }} />
      <Pop at={btn} mode="scale">
        <div
          style={{
            transform: `scale(${pulse})`,
            fontFamily: inter,
            fontWeight: 900,
            fontSize: 50,
            color: "#1a0d00",
            background: GOLD,
            borderRadius: 999,
            padding: "18px 48px",
            boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
          }}
        >
          CONSULENZA GRATUITA →
        </div>
      </Pop>
      <div style={{ height: 22 }} />
      <Pop
        at={at(6, "gratuita.")}
        style={{
          fontFamily: inter,
          fontWeight: 800,
          fontSize: 46,
          color: WHITE,
          textShadow: BIG_SHADOW,
        }}
      >
        greenwateritalia.it
      </Pop>
    </Shell>
  );
};

// ─── Global overlays ──────────────────────────────────────────────────────────

// Karaoke captions: groups of up to 3 words, active word in gold.
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  // The end card already shows the CTA, so captions stop before it.
  const scene = CUTS.findIndex((c, i) => frame >= c && frame < CUTS[i + 1]);
  if (scene < 0 || scene >= LINES.length - 1) return null;

  const words = LINES[scene].words.map(([w, s]) => ({ w, f: toFrame(s) }));
  const groups: (typeof words)[] = [];
  let cur: typeof words = [];
  words.forEach((wd) => {
    cur.push(wd);
    if (cur.length === 3 || /[.,?!:]$/.test(wd.w)) {
      groups.push(cur);
      cur = [];
    }
  });
  if (cur.length) groups.push(cur);

  const gi = groups.findIndex((g, i) => {
    const next = groups[i + 1];
    return frame >= g[0].f - 2 && (next ? frame < next[0].f - 2 : true);
  });
  if (gi < 0) return null;
  const g = groups[gi];
  const lastEnd = gi === groups.length - 1 ? CUTS[scene + 1] - 8 : Infinity;
  if (frame > lastEnd) return null;
  const p = Math.min(1, (frame - g[0].f + 2) / 5);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 1360,
          left: 60,
          right: 60,
          textAlign: "center",
          transform: `scale(${0.82 + 0.18 * p})`,
        }}
      >
        {g.map(({ w, f }, k) => {
          const on = frame >= f - 1;
          const nextF = g[k + 1]?.f ?? groups[gi + 1]?.[0].f ?? Infinity;
          const active = on && frame < nextF;
          return (
            <span
              key={k}
              style={{
                display: "inline-block",
                margin: "0 10px",
                fontFamily: inter,
                fontWeight: 900,
                fontSize: 76,
                lineHeight: 1.1,
                textTransform: "uppercase",
                color: active ? GOLD : WHITE,
                opacity: on ? 1 : 0,
                WebkitTextStroke: "10px #000",
                paintOrder: "stroke fill",
                textShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              {w.replace(/[,.:]$/, "")}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Bug: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [8, 20], [0, 1], CLAMP);
  if (frame >= CUTS[LINES.length - 1]) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 56,
        opacity: o,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ background: WHITE, borderRadius: 16, padding: "6px 10px" }}>
        <Img
          src={staticFile("logo-gw.png")}
          style={{ height: 60, display: "block" }}
        />
      </div>
      <span
        style={{
          fontFamily: inter,
          fontWeight: 900,
          fontSize: 26,
          letterSpacing: "0.12em",
          color: WHITE,
          textShadow: "0 2px 10px rgba(0,0,0,0.8)",
        }}
      >
        GREEN WATER ITALIA
      </span>
    </div>
  );
};

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = CUTS.slice(1, -1).reduce(
    (acc, c) =>
      Math.max(
        acc,
        interpolate(frame, [c, c + 5], [0.4, 0], CLAMP) * (frame >= c ? 1 : 0),
      ),
    0,
  );
  return (
    <AbsoluteFill
      style={{ background: WHITE, opacity: flash, pointerEvents: "none" }}
    />
  );
};

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

// ─── Sound design ─────────────────────────────────────────────────────────────

type Sfx = { at: number; src: string; volume: number };

const SFX: Sfx[] = [
  ...CUTS.slice(1, -1).map((c) => ({
    at: c - 9,
    src: "sfx-whoosh.wav",
    volume: 0.35,
  })),
  { at: CUTS[0] + at(0, "No."), src: "sfx-impact.wav", volume: 0.45 },
  { at: CUTS[0] + at(0, "altro."), src: "sfx-pop.wav", volume: 0.5 },
  { at: CUTS[2] + at(2, "trialometani."), src: "sfx-impact.wav", volume: 0.45 },
  { at: CUTS[3] + at(3, "possibile"), src: "sfx-impact.wav", volume: 0.4 },
  { at: CUTS[4] + at(4, "tre"), src: "sfx-pop.wav", volume: 0.5 },
  { at: CUTS[5] + at(5, "l'osmosi"), src: "sfx-pop.wav", volume: 0.5 },
  { at: CUTS[6] + at(6, "consulenza"), src: "sfx-pop.wav", volume: 0.5 },
];

// ─── Main composition ─────────────────────────────────────────────────────────

const SCENES = [
  SceneHook,
  SceneHowMuch,
  SceneThm,
  SceneChloroform,
  SceneLimit,
  SceneFilters,
  SceneCta,
];

export const CloroSpot: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio
        src={staticFile("solutions-that-work.mp3")}
        trimBefore={3689}
        volume={(f) =>
          interpolate(
            f,
            [0, 6, durationInFrames - 30, durationInFrames],
            [0, 0.16, 0.16, 0],
            CLAMP,
          )
        }
      />
      <Sequence from={VO_AT} layout="none">
        <Audio src={staticFile(VO_FILE)} volume={() => 1} />
      </Sequence>
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={30} layout="none">
          <Audio src={staticFile(s.src)} volume={() => s.volume} />
        </Sequence>
      ))}

      {SCENES.map((Scene, i) => (
        <Sequence
          key={i}
          from={CUTS[i]}
          durationInFrames={CUTS[i + 1] - CUTS[i]}
        >
          <Scene />
        </Sequence>
      ))}

      <Captions />
      <Bug />
      <CutFlash />
      <ProgressBar />
    </AbsoluteFill>
  );
};
