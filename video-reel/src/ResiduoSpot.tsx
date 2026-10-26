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

// One continuous, unedited ElevenLabs v4 take ("Elena"), as in CloroSpot:
// scenes are cut mid-pause on the take's own silences (silencedetect), word
// starts are seconds into the whole take (faster-whisper medium) and the
// words are the authored script, so captions never show transcription slips.
type Word = [string, number];
type Line = {
  start: number;
  clip: string;
  clipDur: number;
  words: Word[];
};

const VO_FILE = "vo-residuo/elena-take.mp3";
const VO_DUR = 48.04;

const LINES: Line[] = [
  {
    start: 0,
    clip: "clip-residuo/r1.mp4",
    clipDur: 4,
    words: [
      ["Più", 0],
      ["un'acqua", 0.38],
      ["è", 0.72],
      ["minerale,", 1.0],
      ["più", 1.64],
      ["fa", 1.8],
      ["bene?", 1.98],
      ["Falso.", 2.8],
    ],
  },
  {
    start: 3.58,
    clip: "clip-residuo/r2.mp4",
    clipDur: 8,
    words: [
      ["Sull'etichetta", 3.84],
      ["lo", 4.56],
      ["trovi", 4.72],
      ["come", 5.02],
      ["residuo", 5.32],
      ["fisso.", 5.94],
      ["Sono", 6.78],
      ["i", 6.96],
      ["sali", 7.1],
      ["minerali", 7.4],
      ["che", 7.86],
      ["restano", 8.06],
      ["dopo", 8.56],
      ["aver", 8.82],
      ["fatto", 9.02],
      ["evaporare", 9.32],
      ["un", 9.9],
      ["litro", 10.08],
      ["d'acqua.", 10.3],
    ],
  },
  {
    start: 10.94,
    clip: "clip-residuo/r3.mp4",
    clipDur: 6,
    words: [
      ["E", 11.08],
      ["cambia", 11.3],
      ["moltissimo", 11.56],
      ["da", 12.24],
      ["una", 12.44],
      ["marca", 12.6],
      ["all'altra.", 12.8],
      ["Da", 13.7],
      ["14", 13.88],
      ["milligrammi", 14.52],
      ["per", 15.08],
      ["litro,", 15.3],
      ["a", 15.74],
      ["oltre", 15.96],
      ["mille.", 16.36],
    ],
  },
  {
    start: 16.88,
    clip: "clip-residuo/r4.mp4",
    clipDur: 9,
    words: [
      ["Ma", 17.06],
      ["quel", 17.22],
      ["numero", 17.38],
      ["non", 17.7],
      ["dice", 17.98],
      ["se", 18.24],
      ["un'acqua", 18.44],
      ["è", 18.78],
      ["buona.", 18.96],
      ["Con", 19.56],
      ["lo", 19.74],
      ["stesso", 19.94],
      ["residuo", 20.16],
      ["fisso,", 20.64],
      ["una", 21.32],
      ["può", 21.44],
      ["essere", 21.62],
      ["ricca", 22.0],
      ["di", 22.26],
      ["calcio", 22.5],
      ["e", 22.8],
      ["magnesio,", 22.9],
      ["l'altra", 23.7],
      ["di", 24.18],
      ["sodio.", 24.52],
    ],
  },
  {
    start: 25.01,
    clip: "clip-residuo/r5.mp4",
    clipDur: 5,
    words: [
      ["E", 25.2],
      ["i", 25.32],
      ["minerali", 25.52],
      ["li", 26.0],
      ["prendiamo", 26.2],
      ["soprattutto", 26.66],
      ["dal", 27.26],
      ["cibo.", 27.48],
      ["Non", 28.24],
      ["dall'acqua.", 28.46],
    ],
  },
  {
    start: 29.19,
    clip: "clip-residuo/r6.mp4",
    clipDur: 6,
    words: [
      ["Vuoi", 29.4],
      ["conoscere", 29.64],
      ["il", 30.1],
      ["residuo", 30.3],
      ["fisso", 30.7],
      ["del", 31.0],
      ["tuo", 31.14],
      ["rubinetto?", 31.28],
      ["Basta", 32.26],
      ["un", 32.52],
      ["piccolo", 32.72],
      ["misuratore", 33.06],
      ["da", 33.6],
      ["pochi", 33.82],
      ["euro.", 34.12],
    ],
  },
  {
    start: 34.61,
    clip: "clip-residuo/r7.mp4",
    clipDur: 10,
    words: [
      ["Con", 34.78],
      ["l'osmosi", 34.96],
      ["inversa,", 35.48],
      ["il", 36.22],
      ["residuo", 36.36],
      ["fisso", 36.7],
      ["si", 37.06],
      ["abbassa", 37.28],
      ["anche", 37.66],
      ["del", 37.96],
      ["90%.", 38.2],
      ["E", 39.54],
      ["con", 39.7],
      ["il", 39.88],
      ["miscelatore,", 40.0],
      ["lo", 40.68],
      ["scegli", 40.96],
      ["tu.", 41.24],
      ["Senza", 41.86],
      ["casse,", 42.26],
      ["senza", 42.88],
      ["plastica.", 43.06],
    ],
  },
  {
    start: 43.81,
    clip: "clip-residuo/r8.mp4",
    clipDur: 7,
    words: [
      ["Vuoi", 44.1],
      ["misurare", 44.22],
      ["la", 44.74],
      ["tua", 44.84],
      ["acqua?", 44.96],
      ["Scrivici,", 45.82],
      ["la", 46.48],
      ["consulenza", 46.76],
      ["è", 47.2],
      ["gratuita.", 47.4],
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
export const RESIDUO_SPOT_DURATION = CUTS[CUTS.length - 1];

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
      at={at(0, "un'acqua")}
      style={{
        fontFamily: oswald,
        fontSize: 124,
        lineHeight: 1.02,
        color: WHITE,
        textAlign: "center",
        textShadow: BIG_SHADOW,
      }}
    >
      PIÙ MINERALE
    </Pop>
    <Pop
      at={at(0, "fa")}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 70,
        color: GOLD,
        marginTop: 8,
        textShadow: BIG_SHADOW,
      }}
    >
      = più sana?
    </Pop>
    <div style={{ height: 50 }} />
    <Pop at={at(0, "Falso.")} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 180,
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
        FALSO.
      </div>
    </Pop>
  </Shell>
);

// ─── Scene 2: COS'È ───────────────────────────────────────────────────────────

const SceneWhat: React.FC = () => (
  <Shell i={1}>
    <Kicker at={LEAD} color={WHITE}>
      Sull'etichetta
    </Kicker>
    <div style={{ height: 14 }} />
    <Pop
      at={at(1, "residuo")}
      mode="scale"
      style={{
        fontFamily: oswald,
        fontSize: 150,
        lineHeight: 1,
        color: WHITE,
        textAlign: "center",
        textShadow: BIG_SHADOW,
      }}
    >
      RESIDUO FISSO
    </Pop>
    <Pop
      at={at(1, "fisso.")}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 48,
        color: GOLD,
        marginTop: 10,
        textShadow: BIG_SHADOW,
      }}
    >
      a 180 °C · in mg/L
    </Pop>
    <div style={{ height: 50 }} />
    <Pop at={at(1, "sali")} mode="scale">
      <div
        style={{
          fontFamily: inter,
          fontWeight: 900,
          fontSize: 50,
          color: WHITE,
          background: "rgba(4,10,16,0.72)",
          border: `4px solid ${BLUE}`,
          borderRadius: 22,
          padding: "16px 34px",
          textAlign: "center",
          boxShadow: "0 0 50px rgba(37,150,190,0.4)",
        }}
      >
        = SALI MINERALI DISCIOLTI
      </div>
    </Pop>
    <div style={{ height: 22 }} />
    <Pop at={at(1, "evaporare")} mode="scale">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontFamily: inter,
          fontWeight: 800,
          fontSize: 40,
          color: "#1a0d00",
          background: GOLD,
          borderRadius: 999,
          padding: "12px 34px",
          whiteSpace: "nowrap",
        }}
      >
        1 LITRO EVAPORA → RESTANO I SALI
      </div>
    </Pop>
  </Shell>
);

// ─── Scene 3: LE MARCHE ───────────────────────────────────────────────────────

type Cat = "min" | "oligo" | "medio";
const CAT_COLOR: Record<Cat, string> = { min: GREEN, oligo: BLUE, medio: GOLD };

// Label values from the blog article (residuo fisso a 180 °C), kept in sync
// with residuo-fisso-acque-in-bottiglia.html. Never take them from the PDF.
const BRANDS: [string, number, Cat][] = [
  ["Lauretana", 14, "min"],
  ["Sant'Anna", 22, "min"],
  ["Levissima", 80, "oligo"],
  ["Acqua Panna", 141, "oligo"],
  ["Evian", 345, "oligo"],
  ["S.Pellegrino", 950, "medio"],
  ["Ferrarelle", 1300, "medio"],
];
const BRAND_MAX = 1300;

const BrandBar: React.FC<{
  name: string;
  value: number;
  cat: Cat;
  at: number;
}> = ({ name, value, cat, at: from }) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [from + 2, from + 20], [0, 1], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const color = CAT_COLOR[cat];
  return (
    <Pop at={from} style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "rgba(4,12,18,0.72)",
          borderRadius: 16,
          padding: "10px 18px",
        }}
      >
        <span
          style={{
            width: 270,
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 34,
            color: WHITE,
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>
        <div
          style={{
            flex: 1,
            height: 26,
            borderRadius: 13,
            background: "rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.max(2, (value / BRAND_MAX) * 100) * fill}%`,
              background: color,
              boxShadow: `0 0 20px ${color}`,
            }}
          />
        </div>
        <span
          style={{
            width: 150,
            textAlign: "right",
            fontFamily: oswald,
            fontSize: 44,
            color,
          }}
        >
          {Math.round(value * fill).toLocaleString("it-IT")}
        </span>
      </div>
    </Pop>
  );
};

const Legend: React.FC<{ at: number }> = ({ at: from }) => {
  const frame = useCurrentFrame();
  const items: [string, Cat][] = [
    ["< 50 minimamente min.", "min"],
    ["50–500 oligominerale", "oligo"],
    ["500–1.500 mediominerale", "medio"],
  ];
  return (
    <div
      style={{
        opacity: interpolate(frame, [from, from + 12], [0, 1], CLAMP),
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "6px 22px",
        fontFamily: inter,
        fontWeight: 700,
        fontSize: 26,
        color: WHITE,
        textShadow: "0 2px 10px rgba(0,0,0,0.9)",
      }}
    >
      {items.map(([t, c]) => (
        <span key={c} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              background: CAT_COLOR[c],
            }}
          />
          {t}
        </span>
      ))}
    </div>
  );
};

const SceneBrands: React.FC = () => {
  const first = at(2, "moltissimo");
  const step = Math.round((at(2, "mille.") - first) / (BRANDS.length - 1));
  return (
    <Shell i={2} topShade={0.85}>
      <Kicker at={LEAD} color={WHITE}>
        Residuo fisso in etichetta · mg/L
      </Kicker>
      <div style={{ height: 22 }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
        }}
      >
        {BRANDS.map(([name, value, cat], k) => (
          <BrandBar
            key={name}
            name={name}
            value={value}
            cat={cat}
            at={first + k * step}
          />
        ))}
      </div>
      <div style={{ height: 20 }} />
      <Legend at={at(2, "mille.")} />
      <div style={{ height: 10 }} />
      <Source at={at(2, "mille.") + 6}>
        Valori da etichetta · classi D.Lgs. 176/2011
      </Source>
    </Shell>
  );
};

// ─── Scene 4: STESSO NUMERO, ACQUE DIVERSE ────────────────────────────────────

const Twin: React.FC<{
  at: number;
  labelAt: number;
  label: string;
  color: string;
}> = ({ at: from, labelAt, label, color }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
    }}
  >
    <Pop at={from} mode="scale" style={{ width: "100%" }}>
      <div
        style={{
          background: "rgba(4,12,18,0.75)",
          border: "3px solid rgba(255,255,255,0.25)",
          borderRadius: 24,
          padding: "14px 0 18px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: oswald,
            fontSize: 120,
            lineHeight: 1,
            color: WHITE,
          }}
        >
          200
        </div>
        <div
          style={{
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 34,
            color: MUTED,
          }}
        >
          mg/L
        </div>
      </div>
    </Pop>
    <Pop at={labelAt} mode="stamp" style={{ width: "100%" }}>
      <div
        style={{
          fontFamily: oswald,
          fontSize: 50,
          lineHeight: 1.05,
          color: "#06120c",
          background: color,
          borderRadius: 18,
          padding: "10px 12px 14px",
          textAlign: "center",
          boxShadow: `0 0 50px ${color}88`,
        }}
      >
        {label}
      </div>
    </Pop>
  </div>
);

const SceneSame: React.FC = () => (
  <Shell i={3}>
    <Pop at={at(3, "non")} mode="scale">
      <span
        style={{
          fontFamily: oswald,
          fontSize: 76,
          color: "#1a0d00",
          background: GOLD,
          padding: "0 26px 8px",
          borderRadius: 14,
          display: "inline-block",
          whiteSpace: "nowrap",
          transform: "rotate(-2deg)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        IL NUMERO NON BASTA
      </span>
    </Pop>
    <div style={{ height: 50 }} />
    <Kicker at={at(3, "stesso")} color={WHITE}>
      Stesso residuo fisso
    </Kicker>
    <div style={{ height: 18 }} />
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
        width: "100%",
      }}
    >
      <Twin
        at={at(3, "stesso")}
        labelAt={at(3, "calcio")}
        label={"CALCIO + MAGNESIO"}
        color={GREEN}
      />
      <Pop
        at={at(3, "residuo")}
        mode="scale"
        style={{
          fontFamily: oswald,
          fontSize: 100,
          color: WHITE,
          marginTop: 30,
          textShadow: BIG_SHADOW,
        }}
      >
        =
      </Pop>
      <Twin
        at={at(3, "stesso") + 4}
        labelAt={at(3, "sodio.")}
        label={"RICCA DI SODIO"}
        color={GOLD}
      />
    </div>
  </Shell>
);

// ─── Scene 5: CIBO ────────────────────────────────────────────────────────────

const SceneFood: React.FC = () => (
  <Shell i={4} topShade={0.75}>
    <Kicker at={LEAD} color={WHITE}>
      I minerali li prendiamo
    </Kicker>
    <div style={{ height: 20 }} />
    <Pop
      at={at(4, "soprattutto")}
      mode="scale"
      style={{
        fontFamily: oswald,
        fontSize: 132,
        lineHeight: 1,
        color: WHITE,
        textAlign: "center",
        textShadow: BIG_SHADOW,
      }}
    >
      SOPRATTUTTO
    </Pop>
    <Pop at={at(4, "cibo.")} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 150,
          lineHeight: 1,
          color: "#06120c",
          background: GREEN,
          borderRadius: 22,
          padding: "8px 44px 18px",
          marginTop: 16,
          boxShadow: "0 0 90px rgba(53,208,122,0.55)",
        }}
      >
        DAL CIBO
      </div>
    </Pop>
    <div style={{ height: 30 }} />
    <Pop
      at={at(4, "Non")}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 54,
        color: WHITE,
        background: "rgba(4,10,16,0.65)",
        borderRadius: 16,
        padding: "8px 28px",
      }}
    >
      non dall'acqua
    </Pop>
  </Shell>
);

// ─── Scene 6: MISURALO ────────────────────────────────────────────────────────

const SceneMeter: React.FC = () => {
  const frame = useCurrentFrame();
  const from = at(5, "misuratore");
  const n = interpolate(frame, [from, from + 26], [0, 400], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <Shell i={5}>
      <Pop at={at(5, "conoscere")} mode="scale">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 96,
            lineHeight: 1.02,
            color: WHITE,
            textAlign: "center",
            textShadow: BIG_SHADOW,
          }}
        >
          E IL TUO <span style={{ color: GOLD }}>RUBINETTO?</span>
        </div>
      </Pop>
      <div style={{ height: 40 }} />
      <Pop at={from} mode="scale">
        <div
          style={{
            width: 560,
            background: "linear-gradient(180deg, #f4f7fa, #d9e1e8)",
            borderRadius: 40,
            padding: "26px 30px 30px",
            boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              background: "#0d1a14",
              borderRadius: 20,
              padding: "14px 24px 18px",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              boxShadow: "inset 0 0 30px rgba(53,208,122,0.25)",
            }}
          >
            <span
              style={{
                fontFamily: inter,
                fontWeight: 800,
                fontSize: 34,
                color: GREEN,
                letterSpacing: "0.1em",
              }}
            >
              TDS
            </span>
            <span
              style={{
                fontFamily: oswald,
                fontSize: 130,
                lineHeight: 1,
                color: GREEN,
                textShadow: "0 0 24px rgba(53,208,122,0.6)",
              }}
            >
              {Math.round(n)}
            </span>
            <span
              style={{
                fontFamily: inter,
                fontWeight: 800,
                fontSize: 30,
                color: GREEN,
              }}
            >
              mg/L
            </span>
          </div>
        </div>
      </Pop>
      <div style={{ height: 30 }} />
      <Pop at={at(5, "pochi")} mode="scale">
        <div
          style={{
            fontFamily: inter,
            fontWeight: 900,
            fontSize: 44,
            color: "#1a0d00",
            background: GOLD,
            borderRadius: 999,
            padding: "12px 34px",
            whiteSpace: "nowrap",
          }}
        >
          MISURATORE TDS · 10–20 €
        </div>
      </Pop>
      <div style={{ height: 16 }} />
      <Source at={at(5, "pochi") + 8}>Valore di esempio</Source>
    </Shell>
  );
};

// ─── Scene 7: OSMOSI + MISCELATORE ────────────────────────────────────────────

const Slider: React.FC<{ at: number }> = ({ at: from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - from - 10) / fps;
  // Knob sweeps across the range, then settles on a light value.
  const pos =
    frame < from + 10
      ? 0.08
      : interpolate(t, [0, 0.7, 1.4, 2], [0.08, 0.8, 0.3, 0.3], {
          ...CLAMP,
          easing: (x) => 0.5 - 0.5 * Math.cos(Math.PI * x),
        });
  const value = Math.round(14 + pos * (150 - 14));
  return (
    <Pop at={from} style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          background: "rgba(4,12,18,0.78)",
          borderRadius: 24,
          padding: "20px 30px 26px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 32,
            color: MUTED,
          }}
        >
          <span>MISCELATORE</span>
          <span style={{ fontFamily: oswald, fontSize: 56, color: WHITE }}>
            {value} <span style={{ fontSize: 30 }}>mg/L</span>
          </span>
        </div>
        <div
          style={{
            position: "relative",
            height: 22,
            marginTop: 18,
            borderRadius: 11,
            background: `linear-gradient(90deg, ${GREEN}, ${BLUE})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -13,
              left: `calc(${pos * 100}% - 24px)`,
              width: 48,
              height: 48,
              borderRadius: 24,
              background: WHITE,
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 14,
            fontFamily: inter,
            fontWeight: 700,
            fontSize: 26,
            color: MUTED,
          }}
        >
          <span>più leggera</span>
          <span>più minerale</span>
        </div>
      </div>
    </Pop>
  );
};

const SceneOsmosis: React.FC = () => {
  const frame = useCurrentFrame();
  const from = at(6, "abbassa");
  const n = interpolate(frame, [from, from + 30], [400, 40], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <Shell i={6} topShade={0.8}>
      <Kicker at={LEAD} color={GREEN}>
        Con l'osmosi inversa
      </Kicker>
      <div style={{ height: 10 }} />
      <Pop at={at(6, "residuo")} mode="scale">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 26,
            fontFamily: oswald,
            color: WHITE,
            textShadow: BIG_SHADOW,
          }}
        >
          <span style={{ fontSize: 80, color: MUTED }}>400</span>
          <span style={{ fontSize: 70, color: GOLD }}>→</span>
          <span style={{ fontSize: 170, lineHeight: 1 }}>
            {Math.round(n)}
          </span>
          <span style={{ fontSize: 56 }}>mg/L</span>
        </div>
      </Pop>
      <div style={{ height: 14 }} />
      <Pop at={at(6, "90%.")} mode="stamp">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 90,
            lineHeight: 1,
            color: "#06120c",
            background: GREEN,
            borderRadius: 18,
            padding: "6px 36px 14px",
            boxShadow: "0 0 80px rgba(53,208,122,0.5)",
          }}
        >
          FINO A −90%
        </div>
      </Pop>
      <div style={{ height: 34 }} />
      <Slider at={at(6, "miscelatore,")} />
      <div style={{ height: 24 }} />
      <div style={{ display: "flex", gap: 16 }}>
        {(
          [
            ["casse,", "ZERO CASSE"],
            ["plastica.", "ZERO PLASTICA"],
          ] as const
        ).map(([w, label]) => (
          <Pop key={w} at={at(6, w) - 4} mode="scale">
            <div
              style={{
                fontFamily: inter,
                fontWeight: 900,
                fontSize: 40,
                color: WHITE,
                background: "rgba(4,10,16,0.75)",
                border: `3px solid ${GOLD}`,
                borderRadius: 999,
                padding: "10px 30px",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </div>
          </Pop>
        ))}
      </div>
    </Shell>
  );
};

// ─── Scene 8: CTA ─────────────────────────────────────────────────────────────

const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = at(7, "consulenza");
  const pulse =
    1 +
    0.035 *
      Math.max(0, Math.sin((frame - btn - 12) / 6)) *
      (frame > btn + 12 ? 1 : 0);
  return (
    <Shell i={7} topShade={0.45}>
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
        at={at(7, "misurare")}
        style={{
          fontFamily: oswald,
          fontSize: 92,
          lineHeight: 1.02,
          color: WHITE,
          textAlign: "center",
          textShadow: BIG_SHADOW,
        }}
      >
        MISURIAMO LA <span style={{ color: GOLD }}>TUA</span> ACQUA
      </Pop>
      <div style={{ height: 14 }} />
      <Pop
        at={at(7, "acqua?")}
        style={{
          fontFamily: inter,
          fontWeight: 800,
          fontSize: 40,
          color: WHITE,
          textShadow: BIG_SHADOW,
        }}
      >
        Test TDS incluso
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
        at={at(7, "gratuita.")}
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
  { at: CUTS[0] + at(0, "Falso."), src: "sfx-impact.wav", volume: 0.45 },
  { at: CUTS[1] + at(1, "sali"), src: "sfx-pop.wav", volume: 0.45 },
  ...BRANDS.map((_, k) => ({
    at:
      CUTS[2] +
      at(2, "moltissimo") +
      k *
        Math.round(
          (at(2, "mille.") - at(2, "moltissimo")) / (BRANDS.length - 1),
        ),
    src: "sfx-tick.wav",
    volume: 0.3,
  })),
  { at: CUTS[3] + at(3, "calcio"), src: "sfx-pop.wav", volume: 0.45 },
  { at: CUTS[3] + at(3, "sodio."), src: "sfx-pop.wav", volume: 0.45 },
  { at: CUTS[4] + at(4, "cibo."), src: "sfx-impact.wav", volume: 0.4 },
  { at: CUTS[5] + at(5, "misuratore"), src: "sfx-tick.wav", volume: 0.35 },
  { at: CUTS[6] + at(6, "90%."), src: "sfx-impact.wav", volume: 0.4 },
  { at: CUTS[7] + at(7, "consulenza"), src: "sfx-pop.wav", volume: 0.5 },
];

// ─── Main composition ─────────────────────────────────────────────────────────

const SCENES = [
  SceneHook,
  SceneWhat,
  SceneBrands,
  SceneSame,
  SceneFood,
  SceneMeter,
  SceneOsmosis,
  SceneCta,
];

export const ResiduoSpot: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio
        src={staticFile("bold-statement.mp3")}
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
