import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  random,
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

// ─── Palette ──────────────────────────────────────────────────────────────────

const BLUE = "#2596be";
const GOLD = "#FFB800";
const GREEN = "#35d07a";
const RED = "#ff4040";
const MUTED = "#8f9bbd";
const WHITE = "#ffffff";

// ─── Timing (cuts locked to the music beat) ───────────────────────────────────

// solutions-that-work.mp3: the drop hits at 124.11s. We trim the track so the
// drop lands on frame 36, where the "NO." stamp slams in.
const MUSIC_TRIM = 3689;
const DROP = 36;
const BEAT = 29.06; // two beats at ~124 BPM, in frames
const onBeat = (n: number) => Math.round(DROP + n * BEAT);

// Each scene holds ~1.5 beats after its last animation so there is time to read.
const CUTS = [
  0,
  onBeat(4.5),
  onBeat(9),
  onBeat(14),
  onBeat(18.5),
  onBeat(23),
  onBeat(30),
];
export const CLORO_DURATION = onBeat(30) + 170;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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

const fmtDec = (n: number, digits: number) =>
  n.toFixed(digits).replace(".", ",");

// ─── Kinetic text ─────────────────────────────────────────────────────────────

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

const Kicker: React.FC<{
  at: number;
  color?: string;
  children: React.ReactNode;
}> = ({ at, color = GOLD, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 10], [0, 1], CLAMP);
  const track = interpolate(frame, [at, at + 24], [0.5, 0.22], CLAMP);
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
      }}
    >
      {children}
    </div>
  );
};

const Source: React.FC<{ at: number; children: React.ReactNode }> = ({
  at,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: interpolate(frame, [at, at + 12], [0, 0.75], CLAMP),
        fontFamily: inter,
        fontWeight: 500,
        fontSize: 26,
        color: MUTED,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
};

// ─── Scene shell: punch-in, slow drift, camera shake, vignette ───────────────

const Shell: React.FC<{
  bg: string;
  impacts?: number[];
  children: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({ bg, impacts = [], children, overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = spring({ frame, fps, config: { stiffness: 140, damping: 20 } });
  const scale = 1.1 - 0.1 * punch + frame * 0.00035;
  const sh = impacts.reduce(
    (acc, at) => {
      const s = shake(frame, at);
      return { x: acc.x + s.x, y: acc.y + s.y };
    },
    { x: 0, y: 0 },
  );

  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      {overlay}
      <AbsoluteFill
        style={{
          transform: `translate(${sh.x}px, ${sh.y}px) scale(${scale})`,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "0 90px",
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 48%, transparent 45%, rgba(0,0,0,0.65) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Backgrounds ──────────────────────────────────────────────────────────────

const Bubbles: React.FC<{ redAt: number }> = ({ redAt }) => {
  const frame = useCurrentFrame();
  const heat = interpolate(frame, [0, redAt], [0.6, 1.8], CLAMP);
  const red = interpolate(frame, [redAt, redAt + 6], [0, 1], CLAMP);
  return (
    <AbsoluteFill>
      {new Array(34).fill(0).map((_, i) => {
        const size = 10 + random(`s${i}`) * 46;
        const speed = (5 + random(`v${i}`) * 9) * heat;
        const x = random(`x${i}`) * 1080 + Math.sin(frame / 9 + i) * 10;
        const y = 1980 - ((random(`o${i}`) * 2100 + frame * speed) % 2100);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              border: `2px solid rgba(${red > 0.5 ? "255,64,64" : "120,190,230"},${0.18 + 0.15 * red})`,
              background: `rgba(${red > 0.5 ? "255,64,64" : "120,190,230"},0.05)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Pool-water light: soft drifting caustic blobs.
const Caustics: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.22, filter: "blur(28px)" }}>
      {new Array(14).fill(0).map((_, i) => {
        const x = random(`cx${i}`) * 1080 + Math.sin(frame / 23 + i) * 60;
        const y = random(`cy${i}`) * 1920 + Math.cos(frame / 29 + i * 2) * 60;
        const r = 120 + random(`cr${i}`) * 180;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 0.9,
              borderRadius: "50%",
              background: "rgba(120,220,255,0.55)",
              transform: `rotate(${i * 25 + frame * 0.3}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Trihalomethane: one carbon, three halogens, one hydrogen, slowly spinning.
const ThmMolecule: React.FC = () => {
  const frame = useCurrentFrame();
  const rot = frame * 0.6;
  const arms = [
    { a: -90, c: RED, r: 34 },
    { a: 30, c: RED, r: 34 },
    { a: 150, c: RED, r: 34 },
    { a: 90, c: WHITE, r: 18 },
  ];
  const appear = interpolate(frame, [30, 44], [0, 1], CLAMP);
  return (
    <AbsoluteFill
      style={{
        opacity: 0.16 * appear,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={900}
        height={900}
        style={{ transform: `rotate(${rot}deg) scale(${0.8 + 0.2 * appear})` }}
      >
        {arms.map((p, i) => {
          const x = 450 + Math.cos((p.a * Math.PI) / 180) * 260;
          const y = 450 + Math.sin((p.a * Math.PI) / 180) * 260;
          return (
            <g key={i}>
              <line
                x1={450}
                y1={450}
                x2={x}
                y2={y}
                stroke={WHITE}
                strokeWidth={10}
              />
              <circle cx={x} cy={y} r={p.r * 2.4} fill={p.c} />
            </g>
          );
        })}
        <circle cx={450} cy={450} r={70} fill={GOLD} />
      </svg>
    </AbsoluteFill>
  );
};

// ─── Scene 1: HOOK ────────────────────────────────────────────────────────────

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const qScale = interpolate(frame, [DROP - 4, DROP + 8], [1, 0.62], CLAMP);
  const qTop = interpolate(frame, [DROP - 4, DROP + 8], [640, 300], CLAMP);
  const qDim = interpolate(frame, [DROP - 4, DROP + 8], [1, 0.55], CLAMP);
  const glow = interpolate(
    frame,
    [DROP, DROP + 10, DROP + 40],
    [0, 1, 0.55],
    CLAMP,
  );

  return (
    <Shell
      bg="radial-gradient(ellipse at 50% 40%, #0c2a36 0%, #05090c 70%)"
      impacts={[DROP]}
      overlay={<Bubbles redAt={DROP} />}
    >
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: qTop,
            left: 0,
            right: 0,
            transform: `scale(${qScale})`,
            transformOrigin: "50% 0%",
            opacity: qDim,
            padding: "0 80px",
          }}
        >
          <Words
            text="IL CLORO NELL'ACQUA"
            at={0}
            stagger={5}
            style={{
              fontFamily: oswald,
              fontSize: 138,
              lineHeight: 1.02,
              color: WHITE,
              textTransform: "uppercase",
            }}
          />
          <Words
            text="fa male?"
            at={16}
            style={{
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 64,
              color: MUTED,
              marginTop: 18,
            }}
          />
        </div>

        {frame >= DROP && (
          <div
            style={{
              position: "absolute",
              top: 690,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 900,
                height: 420,
                top: -80,
                background: `radial-gradient(ellipse, rgba(255,64,64,${0.55 * glow}) 0%, transparent 65%)`,
              }}
            />
            <Pop at={DROP} mode="stamp">
              <div
                style={{
                  fontFamily: oswald,
                  fontSize: 230,
                  lineHeight: 1,
                  color: RED,
                  border: `10px solid ${RED}`,
                  borderRadius: 26,
                  padding: "6px 60px 16px",
                  textShadow: "0 0 70px rgba(255,64,64,0.6)",
                  boxShadow: "0 0 70px rgba(255,64,64,0.35)",
                }}
              >
                NO.
              </div>
            </Pop>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 1050,
            left: 0,
            right: 0,
            padding: "0 80px",
          }}
        >
          <Words
            text="Non ai livelli del rubinetto."
            at={DROP + 22}
            stagger={3}
            style={{
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 58,
              color: WHITE,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              marginTop: 30,
            }}
          >
            <Pop
              at={DROP + 46}
              style={{
                fontFamily: inter,
                fontWeight: 800,
                fontSize: 58,
                color: WHITE,
                whiteSpace: "nowrap",
              }}
            >
              Il problema è
            </Pop>
            <Pop at={DROP + 56} mode="scale">
              <span
                style={{
                  fontFamily: oswald,
                  fontSize: 118,
                  color: "#1a0d00",
                  background: GOLD,
                  padding: "0 22px",
                  borderRadius: 14,
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  transform: "rotate(-2deg)",
                }}
              >
                UN ALTRO.
              </span>
            </Pop>
          </div>
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

// ─── Scene 2: QUANTO CLORO ────────────────────────────────────────────────────

const ScaleRow: React.FC<{
  label: string;
  value: string;
  max: number; // mg/L, on a 0–5 scale
  color: string;
  at: number;
}> = ({ label, value, max, color, at }) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [at + 4, at + 22], [0, 1], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <Pop at={at} style={{ width: "100%" }}>
      <div style={{ width: "100%" }}>
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
              fontSize: 42,
              color: WHITE,
            }}
          >
            {label}
          </span>
          <span style={{ fontFamily: oswald, fontSize: 56, color }}>
            {value}
          </span>
        </div>
        <div
          style={{
            height: 24,
            marginTop: 10,
            borderRadius: 12,
            background: "rgba(255,255,255,0.09)",
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
  const t = interpolate(frame, [8, 30], [0, 1], {
    ...CLAMP,
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });

  return (
    <Shell
      bg="radial-gradient(ellipse at 50% 35%, #0b2a3a 0%, #04090d 75%)"
      overlay={<Caustics />}
    >
      <Kicker at={0} color={BLUE}>
        Cloro nel rubinetto italiano
      </Kicker>
      <div style={{ height: 14 }} />
      <Pop at={6} mode="scale">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 200,
            lineHeight: 1,
            color: WHITE,
            textShadow: "0 0 70px rgba(37,150,190,0.7)",
          }}
        >
          {fmtDec(0.05 * t, 2)}–{fmtDec(0.3 * t, 1)}
        </div>
      </Pop>
      <Pop
        at={14}
        style={{ fontFamily: oswald, fontSize: 70, color: BLUE, lineHeight: 1 }}
      >
        mg/L
      </Pop>

      <div style={{ height: 56 }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 30,
          width: "100%",
        }}
      >
        <ScaleRow
          label="Rubinetto"
          value="0,05–0,3"
          max={0.3}
          color={GREEN}
          at={30}
        />
        <ScaleRow
          label="Piscina"
          value="1–2"
          max={2}
          color={GOLD}
          at={46}
        />
        <ScaleRow
          label="Linea guida OMS"
          value="5"
          max={5}
          color={RED}
          at={62}
        />
      </div>

      <div style={{ height: 40 }} />
      <Source at={84}>
        D.Lgs. 18/2023: valore consigliato 0,2 mg/L · Milano (MM): &lt;0,01
      </Source>
    </Shell>
  );
};

// ─── Scene 3: IL VERO PROBLEMA ────────────────────────────────────────────────

const Chip: React.FC<{ at: number; color: string; children: string }> = ({
  at,
  color,
  children,
}) => (
  <Pop at={at} mode="scale">
    <div
      style={{
        fontFamily: oswald,
        fontSize: 76,
        lineHeight: 1,
        color: WHITE,
        border: `5px solid ${color}`,
        background: `${color}22`,
        borderRadius: 20,
        padding: "16px 34px 20px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  </Pop>
);

const SceneThm: React.FC = () => (
  <Shell
    bg="radial-gradient(ellipse at 50% 45%, #22080e 0%, #090507 75%)"
    impacts={[40]}
    overlay={<ThmMolecule />}
  >
    <Kicker at={0} color={RED}>
      Il vero problema
    </Kicker>
    <div style={{ height: 40 }} />
    <Chip at={4} color={BLUE}>
      CLORO
    </Chip>
    <Pop
      at={10}
      mode="scale"
      style={{ fontFamily: oswald, fontSize: 90, color: MUTED, margin: "6px 0" }}
    >
      +
    </Pop>
    <Chip at={14} color={GREEN}>
      MATERIA ORGANICA
    </Chip>
    <Pop
      at={28}
      mode="scale"
      style={{ fontFamily: oswald, fontSize: 90, color: MUTED, margin: "6px 0" }}
    >
      =
    </Pop>
    <Pop at={40} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 200,
          lineHeight: 1,
          color: WHITE,
          background: RED,
          borderRadius: 22,
          padding: "10px 50px 22px",
          boxShadow: "0 0 90px rgba(255,64,64,0.55)",
        }}
      >
        THM
      </div>
    </Pop>
    <div style={{ height: 18 }} />
    <Pop
      at={50}
      style={{ fontFamily: inter, fontWeight: 800, fontSize: 52, color: WHITE }}
    >
      trialometani
    </Pop>
    <div style={{ height: 50 }} />
    <Words
      text="Con il caldo d'estate se ne formano di più."
      at={74}
      stagger={3}
      highlight={{ caldo: GOLD, "d'estate": GOLD }}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 48,
        color: WHITE,
        lineHeight: 1.25,
      }}
    />
  </Shell>
);

// ─── Scene 4: CLOROFORMIO ─────────────────────────────────────────────────────

const SceneChloroform: React.FC = () => (
  <Shell
    bg="radial-gradient(ellipse at 50% 45%, #1e0a10 0%, #08050a 75%)"
    impacts={[34]}
  >
    <Kicker at={0}>Il THM più diffuso</Kicker>
    <div style={{ height: 14 }} />
    <Pop
      at={4}
      mode="scale"
      style={{ fontFamily: oswald, fontSize: 168, lineHeight: 1, color: WHITE }}
    >
      CLOROFORMIO
    </Pop>
    <div style={{ height: 44 }} />
    <Pop at={34} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 84,
          lineHeight: 1.05,
          color: WHITE,
          background: RED,
          borderRadius: 18,
          padding: "14px 36px 22px",
          boxShadow: "0 0 90px rgba(255,64,64,0.55)",
          textAlign: "center",
        }}
      >
        POSSIBILE CANCEROGENO
      </div>
    </Pop>
    <div style={{ height: 22 }} />
    <Pop
      at={48}
      style={{ fontFamily: inter, fontWeight: 800, fontSize: 50, color: GOLD }}
    >
      IARC · Gruppo 2B
    </Pop>
    <div style={{ height: 50 }} />
    <Words
      text="Conta l'esposizione di ogni giorno, per anni."
      at={68}
      stagger={2}
      highlight={{ ogni: GOLD, giorno: GOLD, "anni.": GOLD }}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 48,
        color: WHITE,
        lineHeight: 1.25,
      }}
    />
  </Shell>
);

// ─── Scene 5: LIMITE ──────────────────────────────────────────────────────────

const SceneLimit: React.FC = () => {
  const frame = useCurrentFrame();
  const n = interpolate(frame, [6, 26], [0, 30], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <Shell bg="radial-gradient(ellipse at 50% 40%, #0b2234 0%, #050b12 75%)">
      <Kicker at={0} color={BLUE}>
        Limite THM in Italia
      </Kicker>
      <div style={{ height: 20 }} />
      <Pop at={6} mode="scale">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 250,
            lineHeight: 1,
            color: WHITE,
            textShadow: "0 0 80px rgba(37,150,190,0.7)",
          }}
        >
          {Math.round(n)}
          <span style={{ fontSize: 86, color: BLUE, marginLeft: 18 }}>
            µg/L
          </span>
        </div>
      </Pop>

      <div style={{ height: 40 }} />

      <Pop at={32} mode="up">
        <div
          style={{
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 50,
            color: MUTED,
          }}
        >
          Direttiva UE:{" "}
          <span style={{ textDecoration: "line-through", color: MUTED }}>
            100 µg/L
          </span>
        </div>
      </Pop>

      <div style={{ height: 50 }} />

      <Words
        text="Oltre 3 volte più severo"
        at={50}
        stagger={4}
        highlight={{ "3": GOLD, volte: GOLD }}
        style={{ fontFamily: oswald, fontSize: 96, color: WHITE, lineHeight: 1 }}
      />

      <div style={{ height: 50 }} />
      <Source at={70}>D.Lgs. 18/2023 · Direttiva UE 2020/2184</Source>
    </Shell>
  );
};

// ─── Scene 6: COSA FUNZIONA ───────────────────────────────────────────────────

type Level = "good" | "mid" | "bad";
const LEVEL_COLOR: Record<Level, string> = { good: GREEN, mid: GOLD, bad: RED };

const Cell: React.FC<{ value: string; level: Level }> = ({ value, level }) => (
  <div
    style={{
      width: 230,
      textAlign: "center",
      fontFamily: oswald,
      fontSize: 52,
      lineHeight: 1,
      padding: "12px 0 16px",
      borderRadius: 14,
      color: LEVEL_COLOR[level],
      background: `${LEVEL_COLOR[level]}1f`,
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
}> = ({ label, cloro, thm, at, dimAt, winner }) => {
  const frame = useCurrentFrame();
  const dim =
    dimAt === undefined
      ? 1
      : interpolate(frame, [dimAt, dimAt + 8], [1, 0.35], CLAMP);
  const pulse = winner
    ? 1 +
      0.025 *
        Math.max(0, Math.sin((frame - at) / 5)) *
        (frame > at + 24 ? 1 : 0)
    : 1;
  return (
    <div style={{ width: "100%", opacity: dim }}>
      <Pop at={at} style={{ width: "100%" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 24px",
            borderRadius: 22,
            background: winner
              ? "rgba(53,208,122,0.12)"
              : "rgba(255,255,255,0.05)",
            border: `3px solid ${winner ? GREEN : "rgba(255,255,255,0.08)"}`,
            boxShadow: winner ? "0 0 60px rgba(53,208,122,0.35)" : undefined,
            transform: `scale(${pulse})`,
          }}
        >
          <span
            style={{
              flex: 1,
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 40,
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

const SceneFilters: React.FC = () => (
  <Shell
    bg="radial-gradient(ellipse at 50% 40%, #0a1d24 0%, #04090c 75%)"
    impacts={[74]}
  >
    <Words
      text="COSA LI TOGLIE DAVVERO?"
      at={0}
      stagger={3}
      highlight={{ "DAVVERO?": GREEN }}
      style={{
        fontFamily: oswald,
        fontSize: 104,
        color: WHITE,
        lineHeight: 1.02,
      }}
    />
    <div style={{ height: 40 }} />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        width: "100%",
      }}
    >
      <Pop at={12} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: "0 27px",
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: "0.18em",
            color: MUTED,
          }}
        >
          <span style={{ flex: 1 }} />
          <span style={{ width: 230, textAlign: "center" }}>CLORO</span>
          <span style={{ width: 230, textAlign: "center" }}>THM</span>
        </div>
      </Pop>
      <MethodRow
        label="Caraffa a riposo"
        cloro={["50-80%", "mid"]}
        thm={["NO", "bad"]}
        at={18}
        dimAt={104}
      />
      <MethodRow
        label="Carbone attivo"
        cloro={[">99%", "good"]}
        thm={["PARZIALE", "mid"]}
        at={46}
        dimAt={104}
      />
      <MethodRow
        label="Osmosi inversa"
        cloro={[">99%", "good"]}
        thm={[">90%", "good"]}
        at={74}
        winner
      />
    </div>
    <div style={{ height: 40 }} />
    <Words
      text="Solo il sapore? Basta il carbone attivo."
      at={110}
      stagger={2}
      highlight={{ carbone: GOLD, "attivo.": GOLD }}
      style={{ fontFamily: inter, fontWeight: 800, fontSize: 44, color: WHITE }}
    />
    <div style={{ height: 14 }} />
    <Words
      text="Anche i THM? Osmosi inversa."
      at={134}
      stagger={2}
      style={{ fontFamily: inter, fontWeight: 800, fontSize: 44, color: GREEN }}
    />
    <div style={{ height: 22 }} />
    <Source at={150}>Rese di rimozione indicative</Source>
  </Shell>
);

// ─── Scene 7: CTA ─────────────────────────────────────────────────────────────

const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse =
    1 + 0.035 * Math.max(0, Math.sin((frame - 70) / 6)) * (frame > 70 ? 1 : 0);
  const sweep = interpolate(frame, [80, 110], [-120, 220], CLAMP);

  return (
    <Shell bg="linear-gradient(180deg, #0e3a52 0%, #1d84a8 55%, #145f7a 100%)">
      <Words
        text="SAI COSA C'È"
        at={0}
        stagger={4}
        style={{
          fontFamily: oswald,
          fontSize: 124,
          color: WHITE,
          lineHeight: 1,
        }}
      />
      <Words
        text="NELLA TUA ACQUA?"
        at={10}
        stagger={4}
        highlight={{ TUA: GOLD }}
        style={{
          fontFamily: oswald,
          fontSize: 124,
          color: WHITE,
          lineHeight: 1.05,
        }}
      />

      <div style={{ height: 44 }} />

      <Words
        text="Salvalo e mandalo a chi beve acqua del rubinetto."
        at={30}
        stagger={2}
        style={{
          fontFamily: inter,
          fontWeight: 700,
          fontSize: 46,
          color: "rgba(255,255,255,0.9)",
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
          color: "rgba(255,255,255,0.85)",
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
          fontSize: 34,
          color: "rgba(255,255,255,0.8)",
        }}
      >
        Carbone attivo certificato NSF/ANSI 42
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
        interpolate(frame, [c, c + 6], [0.45, 0], CLAMP) * (frame >= c ? 1 : 0),
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
  { at: DROP + 56, src: "sfx-pop.wav", volume: 0.6 },
  // counter ticks on 0,05–0,3
  ...[8, 12, 16, 20, 24, 28].map((t) => ({
    at: CUTS[1] + t,
    src: "sfx-tick.wav",
    volume: 0.35,
  })),
  ...[30, 46, 62].map((t) => ({
    at: CUTS[1] + t,
    src: "sfx-pop.wav",
    volume: 0.45,
  })),
  { at: CUTS[2] + 4, src: "sfx-pop.wav", volume: 0.5 },
  { at: CUTS[2] + 14, src: "sfx-pop.wav", volume: 0.5 },
  { at: CUTS[2] + 40, src: "sfx-impact.wav", volume: 0.5 },
  { at: CUTS[3] + 34, src: "sfx-impact.wav", volume: 0.5 },
  // counter ticks on 30 µg/L
  ...[6, 10, 14, 18, 22, 26].map((t) => ({
    at: CUTS[4] + t,
    src: "sfx-tick.wav",
    volume: 0.3,
  })),
  { at: CUTS[4] + 50, src: "sfx-pop.wav", volume: 0.55 },
  ...[18, 46].map((t) => ({
    at: CUTS[5] + t,
    src: "sfx-pop.wav",
    volume: 0.45,
  })),
  { at: CUTS[5] + 74, src: "sfx-impact.wav", volume: 0.45 },
  { at: CUTS[6] + 66, src: "sfx-pop.wav", volume: 0.6 },
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

export const CloroReel: React.FC = () => {
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
