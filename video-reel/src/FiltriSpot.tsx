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
// words are the authored script. The take spells PFAS "Pfas": "PFAS" and
// "pìfas" both came out with a vowel after the P ("pi-fas").
type Word = [string, number];
type Line = {
  start: number;
  clip: string;
  clipDur: number;
  words: Word[];
};

const VO_FILE = "vo-filtri/elena-take.mp3";
const VO_DUR = 55.72;

const LINES: Line[] = [
  {
    start: 0,
    clip: "clip-filtri/f1.mp4",
    clipDur: 5,
    words: [
      ["Hai", 0.0],
      ["un", 0.26],
      ["filtro", 0.5],
      ["per", 0.8],
      ["l'acqua", 0.98],
      ["di", 1.2],
      ["casa?", 1.4],
      ["Forse", 2.24],
      ["non", 2.58],
      ["toglie", 2.8],
      ["quello", 3.14],
      ["che", 3.32],
      ["pensi.", 3.6],
    ],
  },
  {
    start: 4.16,
    clip: "clip-filtri/f2.mp4",
    clipDur: 6,
    words: [
      ["I", 4.36],
      ["filtri", 4.54],
      ["non", 4.94],
      ["sono", 5.24],
      ["tutti", 5.52],
      ["uguali.", 5.76],
      ["Ci", 6.6],
      ["sono", 6.76],
      ["tre", 7.08],
      ["tecnologie,", 7.32],
      ["e", 8.08],
      ["fanno", 8.44],
      ["cose", 8.66],
      ["molto", 8.96],
      ["diverse.", 9.42],
    ],
  },
  {
    start: 10.12,
    clip: "clip-filtri/f3.mp4",
    clipDur: 9,
    words: [
      ["Il", 10.32],
      ["carbone", 10.56],
      ["attivo", 10.86],
      ["toglie", 11.38],
      ["il", 11.7],
      ["cloro,", 11.96],
      ["e", 12.3],
      ["migliora", 12.7],
      ["odore", 13.08],
      ["e", 13.54],
      ["sapore.", 13.82],
      ["Ma", 14.66],
      ["i", 14.8],
      ["metalli", 14.96],
      ["pesanti", 15.28],
      ["restano.", 15.72],
      ["E", 16.48],
      ["i", 16.72],
      ["PFAS,", 16.88],
      ["solo", 17.52],
      ["in", 17.84],
      ["parte.", 18.1],
    ],
  },
  {
    start: 18.6,
    clip: "clip-filtri/f4.mp4",
    clipDur: 9,
    words: [
      ["L'ultrafiltrazione", 18.86],
      ["va", 19.98],
      ["oltre.", 20.2],
      ["La", 21.04],
      ["sua", 21.22],
      ["membrana", 21.36],
      ["ferma", 21.86],
      ["batteri", 22.26],
      ["e", 22.88],
      ["virus.", 23.1],
      ["Ma", 24.02],
      ["i", 24.2],
      ["sali", 24.4],
      ["e", 24.68],
      ["i", 24.76],
      ["metalli", 24.94],
      ["disciolti", 25.24],
      ["la", 25.86],
      ["attraversano.", 26.12],
    ],
  },
  {
    start: 26.97,
    clip: "clip-filtri/f5.mp4",
    clipDur: 11,
    words: [
      ["L'osmosi", 27.17],
      ["inversa", 27.76],
      ["usa", 28.32],
      ["la", 28.56],
      ["pressione,", 28.78],
      ["e", 29.38],
      ["una", 29.66],
      ["membrana", 29.82],
      ["con", 30.32],
      ["pori", 30.56],
      ["migliaia", 30.84],
      ["di", 31.46],
      ["volte", 31.64],
      ["più", 31.84],
      ["piccoli.", 32.14],
      ["Trattiene", 33.02],
      ["metalli", 33.42],
      ["pesanti,", 33.88],
      ["PFAS,", 34.7],
      ["nitrati.", 35.54],
      ["E", 36.14],
      ["gran", 36.5],
      ["parte", 36.7],
      ["dei", 36.98],
      ["sali.", 37.2],
    ],
  },
  {
    start: 37.77,
    clip: "clip-filtri/f6.mp4",
    clipDur: 6,
    words: [
      ["Quindi", 37.98],
      ["la", 38.3],
      ["domanda", 38.52],
      ["giusta", 38.86],
      ["non", 39.36],
      ["è", 39.62],
      ["quale", 39.86],
      ["filtro", 40.12],
      ["costa", 40.5],
      ["meno.", 40.88],
      ["È", 41.5],
      ["cosa", 41.74],
      ["vuoi", 42.02],
      ["togliere", 42.28],
      ["dalla", 42.74],
      ["tua", 42.9],
      ["acqua.", 43.1],
    ],
  },
  {
    start: 43.67,
    clip: "clip-filtri/f7.mp4",
    clipDur: 9,
    words: [
      ["Solo", 43.96],
      ["il", 44.16],
      ["sapore", 44.36],
      ["del", 44.56],
      ["cloro?", 44.8],
      ["Basta", 45.58],
      ["il", 45.82],
      ["carbone.", 46.04],
      ["I", 46.8],
      ["batteri?", 46.96],
      ["Ultrafiltrazione.", 47.75],
      ["Tutto", 49.32],
      ["il", 49.52],
      ["resto?", 49.66],
      ["Osmosi", 50.42],
      ["inversa.", 50.98],
    ],
  },
  {
    start: 51.64,
    clip: "clip-filtri/f8.mp4",
    clipDur: 7,
    words: [
      ["Non", 51.9],
      ["sai", 52.08],
      ["quale", 52.28],
      ["fa", 52.48],
      ["per", 52.62],
      ["te?", 52.88],
      ["Scrivici,", 53.5],
      ["la", 54.18],
      ["consulenza", 54.46],
      ["è", 54.88],
      ["gratuita.", 55.1],
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
export const FILTRI_SPOT_DURATION = CUTS[CUTS.length - 1];

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

// ─── Shared pieces ────────────────────────────────────────────────────────────

type Level = "yes" | "partial" | "no";
const LEVEL_COLOR: Record<Level, string> = {
  yes: GREEN,
  partial: GOLD,
  no: RED,
};
const LEVEL_SYMBOL: Record<Level, string> = { yes: "✓", partial: "~", no: "✗" };

const Badge: React.FC<{ level: Level; size?: number }> = ({
  level,
  size = 64,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: LEVEL_COLOR[level],
      color: "#06120c",
      fontFamily: inter,
      fontWeight: 900,
      fontSize: size * 0.62,
      lineHeight: `${size}px`,
      textAlign: "center",
      flexShrink: 0,
    }}
  >
    {LEVEL_SYMBOL[level]}
  </div>
);

const CheckRow: React.FC<{
  label: string;
  note?: string;
  level: Level;
  at: number;
}> = ({ label, note, level, at: from }) => (
  <Pop at={from} style={{ width: "100%" }}>
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "16px 22px",
        borderRadius: 22,
        background: "rgba(4,12,18,0.8)",
        border: `3px solid ${LEVEL_COLOR[level]}`,
        boxShadow: `0 0 40px ${LEVEL_COLOR[level]}44`,
      }}
    >
      <Badge level={level} />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 46,
            lineHeight: 1.05,
            color: WHITE,
          }}
        >
          {label}
        </div>
        {note ? (
          <div
            style={{
              fontFamily: inter,
              fontWeight: 700,
              fontSize: 30,
              color: LEVEL_COLOR[level],
              marginTop: 4,
            }}
          >
            {note}
          </div>
        ) : null}
      </div>
    </div>
  </Pop>
);

const TechTitle: React.FC<{ n: number; at: number; children: string }> = ({
  n,
  at: from,
  children,
}) => (
  <Pop at={from} mode="scale">
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          background: GOLD,
          color: "#1a0d00",
          fontFamily: oswald,
          fontSize: 64,
          lineHeight: "92px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontFamily: oswald,
          fontSize: 100,
          lineHeight: 1,
          color: WHITE,
          textShadow: BIG_SHADOW,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    </div>
  </Pop>
);

const Rows: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      width: "100%",
    }}
  >
    {children}
  </div>
);

// ─── Scene 1: HOOK ────────────────────────────────────────────────────────────

const SceneHook: React.FC = () => (
  <Shell i={0}>
    <Pop
      at={at(0, "filtro")}
      style={{
        fontFamily: oswald,
        fontSize: 130,
        lineHeight: 1.02,
        color: WHITE,
        textAlign: "center",
        textShadow: BIG_SHADOW,
      }}
    >
      HAI UN FILTRO?
    </Pop>
    <div style={{ height: 30 }} />
    <Pop
      at={at(0, "Forse")}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 64,
        color: GOLD,
        textShadow: BIG_SHADOW,
      }}
    >
      Forse non toglie
    </Pop>
    <div style={{ height: 22 }} />
    <Pop at={at(0, "quello")} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 92,
          lineHeight: 1.05,
          color: RED,
          border: `8px solid ${RED}`,
          borderRadius: 24,
          padding: "6px 40px 14px",
          background: "rgba(10,4,6,0.6)",
          textAlign: "center",
          textShadow: "0 0 50px rgba(255,64,64,0.6)",
          boxShadow: "0 0 70px rgba(255,64,64,0.35)",
          whiteSpace: "nowrap",
        }}
      >
        QUELLO CHE PENSI
      </div>
    </Pop>
  </Shell>
);

// ─── Scene 2: TRE TECNOLOGIE ──────────────────────────────────────────────────

const TECHS = ["CARBONE ATTIVO", "ULTRAFILTRAZIONE", "OSMOSI INVERSA"];

const SceneThree: React.FC = () => {
  const first = at(1, "tre");
  return (
    <Shell i={1} topShade={0.75}>
      <Pop at={at(1, "filtri")} mode="scale">
        <span
          style={{
            fontFamily: oswald,
            fontSize: 74,
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
          NON SONO TUTTI UGUALI
        </span>
      </Pop>
      <div style={{ height: 50 }} />
      <Rows>
        {TECHS.map((t, k) => (
          <Pop key={t} at={first + k * 8} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "16px 26px",
                borderRadius: 22,
                background: "rgba(4,12,18,0.8)",
                border: "3px solid rgba(255,255,255,0.2)",
              }}
            >
              <span style={{ fontFamily: oswald, fontSize: 70, color: GOLD }}>
                {k + 1}
              </span>
              <span style={{ fontFamily: oswald, fontSize: 70, color: WHITE }}>
                {t}
              </span>
            </div>
          </Pop>
        ))}
      </Rows>
    </Shell>
  );
};

// ─── Scene 3: CARBONE ATTIVO ──────────────────────────────────────────────────

const SceneCarbon: React.FC = () => (
  <Shell i={2} topShade={0.8}>
    <TechTitle n={1} at={at(2, "carbone")}>
      CARBONE ATTIVO
    </TechTitle>
    <div style={{ height: 40 }} />
    <Rows>
      <CheckRow
        label="Cloro, odore, sapore"
        level="yes"
        at={at(2, "cloro,")}
      />
      <CheckRow label="Metalli pesanti" level="no" at={at(2, "metalli")} />
      <CheckRow
        label="PFAS"
        note="solo in parte"
        level="partial"
        at={at(2, "PFAS,")}
      />
    </Rows>
  </Shell>
);

// ─── Scene 4: ULTRAFILTRAZIONE ────────────────────────────────────────────────

const SceneUltra: React.FC = () => (
  <Shell i={3} topShade={0.8}>
    <TechTitle n={2} at={at(3, "L'ultrafiltrazione")}>
      ULTRAFILTRAZIONE
    </TechTitle>
    <div style={{ height: 40 }} />
    <Rows>
      <CheckRow label="Batteri e virus" level="yes" at={at(3, "batteri")} />
      <CheckRow
        label="Sali disciolti"
        note="residuo fisso invariato"
        level="no"
        at={at(3, "sali")}
      />
      <CheckRow label="Metalli pesanti" level="no" at={at(3, "metalli")} />
    </Rows>
  </Shell>
);

// ─── Scene 5: OSMOSI INVERSA ──────────────────────────────────────────────────

const SceneOsmosis: React.FC = () => (
  <Shell i={4} topShade={0.8}>
    <TechTitle n={3} at={at(4, "L'osmosi")}>
      OSMOSI INVERSA
    </TechTitle>
    <div style={{ height: 24 }} />
    <Pop at={at(4, "migliaia")} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 50,
          lineHeight: 1.05,
          color: "#06120c",
          background: GREEN,
          borderRadius: 16,
          padding: "8px 30px 12px",
          textAlign: "center",
          boxShadow: "0 0 60px rgba(53,208,122,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        PORI MIGLIAIA DI VOLTE PIÙ PICCOLI
      </div>
    </Pop>
    <div style={{ height: 30 }} />
    <Rows>
      <CheckRow label="Metalli pesanti" level="yes" at={at(4, "metalli")} />
      <CheckRow label="PFAS" level="yes" at={at(4, "PFAS,")} />
      <CheckRow label="Nitrati" level="yes" at={at(4, "nitrati.")} />
      <CheckRow
        label="Sali"
        note="residuo fisso −90/95%"
        level="yes"
        at={at(4, "sali.")}
      />
    </Rows>
  </Shell>
);

// ─── Scene 6: TABELLA ─────────────────────────────────────────────────────────

const TABLE: [string, Level, Level, Level][] = [
  ["Cloro / odori", "yes", "yes", "yes"],
  ["Batteri e virus", "partial", "yes", "yes"],
  ["Metalli pesanti", "no", "no", "yes"],
  ["PFAS", "partial", "partial", "yes"],
  ["Residuo fisso", "no", "no", "yes"],
];
const COL = 150;

const SceneTable: React.FC = () => {
  const frame = useCurrentFrame();
  const first = at(5, "Quindi");
  const hl = at(5, "togliere");
  const glow = interpolate(frame, [hl, hl + 10], [0, 1], CLAMP);
  return (
    <Shell i={5} topShade={0.85}>
      <Pop at={first} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            padding: "0 20px",
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 26,
            lineHeight: 1.1,
            letterSpacing: "0.04em",
            color: WHITE,
            textAlign: "center",
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          <span style={{ flex: 1 }} />
          <span style={{ width: COL }}>CARBONE</span>
          <span style={{ width: COL }}>ULTRA&shy;FILTRAZ.</span>
          <span style={{ width: COL, color: GREEN }}>OSMOSI</span>
        </div>
      </Pop>
      <div style={{ height: 10 }} />
      <Rows>
        {TABLE.map(([label, c, u, o], k) => (
          <Pop key={label} at={first + 4 + k * 5} style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                borderRadius: 18,
                background: "rgba(4,12,18,0.82)",
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontFamily: inter,
                  fontWeight: 800,
                  fontSize: 36,
                  color: WHITE,
                }}
              >
                {label}
              </span>
              {[c, u, o].map((l, j) => (
                <div
                  key={j}
                  style={{
                    width: COL,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      borderRadius: 40,
                      boxShadow:
                        j === 2 ? `0 0 ${30 * glow}px ${GREEN}` : undefined,
                    }}
                  >
                    <Badge level={l} size={56} />
                  </div>
                </div>
              ))}
            </div>
          </Pop>
        ))}
      </Rows>
      <div style={{ height: 30 }} />
      <Pop at={hl} mode="stamp">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 68,
            lineHeight: 1,
            color: "#1a0d00",
            background: GOLD,
            borderRadius: 16,
            padding: "8px 30px 14px",
            whiteSpace: "nowrap",
          }}
        >
          COSA VUOI TOGLIERE?
        </div>
      </Pop>
      <div style={{ height: 14 }} />
      <Source at={hl + 6}>✓ rimosso · ~ in parte · ✗ non rimosso</Source>
    </Shell>
  );
};

// ─── Scene 7: QUALE SCEGLIERE ─────────────────────────────────────────────────

const Choice: React.FC<{
  q: string;
  a: string;
  qAt: number;
  aAt: number;
  winner?: boolean;
}> = ({ q, a, qAt, aAt, winner }) => {
  const frame = useCurrentFrame();
  const pulse = winner
    ? 1 +
      0.025 *
        Math.max(0, Math.sin((frame - aAt) / 5)) *
        (frame > aAt + 14 ? 1 : 0)
    : 1;
  return (
    <Pop at={qAt} style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          padding: "18px 26px 22px",
          borderRadius: 24,
          background: winner ? "rgba(10,60,36,0.88)" : "rgba(4,12,18,0.8)",
          border: `3px solid ${winner ? GREEN : "rgba(255,255,255,0.18)"}`,
          boxShadow: winner ? "0 0 60px rgba(53,208,122,0.45)" : undefined,
          transform: `scale(${pulse})`,
        }}
      >
        <div
          style={{
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 38,
            color: MUTED,
          }}
        >
          {q}
        </div>
        <Pop at={aAt} mode="up">
          <div
            style={{
              fontFamily: oswald,
              fontSize: 76,
              lineHeight: 1.05,
              color: winner ? GREEN : WHITE,
            }}
          >
            → {a}
          </div>
        </Pop>
      </div>
    </Pop>
  );
};

const SceneChoose: React.FC = () => (
  <Shell i={6} topShade={0.8}>
    <Kicker at={LEAD} color={WHITE}>
      Quale scegliere
    </Kicker>
    <div style={{ height: 24 }} />
    <Rows>
      <Choice
        q="Solo il sapore del cloro?"
        a="CARBONE ATTIVO"
        qAt={at(6, "Solo")}
        aAt={at(6, "carbone.")}
      />
      <Choice
        q="Batteri e virus?"
        a="ULTRAFILTRAZIONE"
        qAt={at(6, "batteri?")}
        aAt={at(6, "Ultrafiltrazione.")}
      />
      <Choice
        q="Metalli, PFAS, nitrati, sali?"
        a="OSMOSI INVERSA"
        qAt={at(6, "resto?")}
        aAt={at(6, "Osmosi")}
        winner
      />
    </Rows>
  </Shell>
);

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
    <Shell i={7} topShade={0.5}>
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
        at={at(7, "quale")}
        style={{
          fontFamily: oswald,
          fontSize: 96,
          lineHeight: 1.02,
          color: WHITE,
          textAlign: "center",
          textShadow: BIG_SHADOW,
        }}
      >
        QUALE FA PER <span style={{ color: GOLD }}>TE</span>?
      </Pop>
      <div style={{ height: 14 }} />
      <Pop
        at={at(7, "te?")}
        style={{
          fontFamily: inter,
          fontWeight: 800,
          fontSize: 40,
          color: WHITE,
          textShadow: BIG_SHADOW,
        }}
      >
        Analizziamo la tua acqua con il test TDS
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

const sfx = (i: number, w: string, src: string, volume: number): Sfx => ({
  at: CUTS[i] + at(i, w),
  src,
  volume,
});

const SFX: Sfx[] = [
  ...CUTS.slice(1, -1).map((c) => ({
    at: c - 9,
    src: "sfx-whoosh.wav",
    volume: 0.35,
  })),
  sfx(0, "quello", "sfx-impact.wav", 0.45),
  ...[0, 1, 2].map((k) => ({
    at: CUTS[1] + at(1, "tre") + k * 8,
    src: "sfx-tick.wav",
    volume: 0.3,
  })),
  sfx(2, "cloro,", "sfx-pop.wav", 0.4),
  sfx(2, "metalli", "sfx-pop.wav", 0.4),
  sfx(2, "PFAS,", "sfx-pop.wav", 0.4),
  sfx(3, "batteri", "sfx-pop.wav", 0.4),
  sfx(3, "sali", "sfx-pop.wav", 0.4),
  sfx(3, "metalli", "sfx-pop.wav", 0.4),
  sfx(4, "migliaia", "sfx-impact.wav", 0.4),
  sfx(4, "metalli", "sfx-tick.wav", 0.35),
  sfx(4, "PFAS,", "sfx-tick.wav", 0.35),
  sfx(4, "nitrati.", "sfx-tick.wav", 0.35),
  sfx(4, "sali.", "sfx-tick.wav", 0.35),
  sfx(5, "togliere", "sfx-impact.wav", 0.4),
  sfx(6, "carbone.", "sfx-pop.wav", 0.4),
  sfx(6, "Ultrafiltrazione.", "sfx-pop.wav", 0.4),
  sfx(6, "Osmosi", "sfx-impact.wav", 0.45),
  sfx(7, "consulenza", "sfx-pop.wav", 0.5),
];

// ─── Main composition ─────────────────────────────────────────────────────────

const SCENES = [
  SceneHook,
  SceneThree,
  SceneCarbon,
  SceneUltra,
  SceneOsmosis,
  SceneTable,
  SceneChoose,
  SceneCta,
];

export const FiltriSpot: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio
        src={staticFile("go-beyond.mp3")}
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
