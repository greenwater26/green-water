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

// bold-statement.mp3: the drop hits at 12.05s. We trim the track so the drop
// lands on frame 36, where the "ERRORE." stamp slams in.
const MUSIC_TRIM = 326;
const DROP = 36;
const BEAT = 23.7; // two beats at ~152 BPM, in frames
const onBeat = (n: number) => Math.round(DROP + n * BEAT);

// Each scene holds ~1.5 beats after its last animation so there is time to read.
const CUTS = [
  0,
  onBeat(5.5),
  onBeat(11),
  onBeat(17.5),
  onBeat(23),
  onBeat(28.5),
  onBeat(37),
];
export const PFAS_V2_DURATION = onBeat(37) + 170;

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

const fmtIt = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

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

const Molecule: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 70], [1, 0], CLAMP);
  const n = 9;
  const pts = new Array(n).fill(0).map((_, i) => ({
    x: 60 + i * 120,
    y: 960 + (i % 2 === 0 ? -55 : 55),
  }));
  return (
    <AbsoluteFill
      style={{
        opacity: 0.16,
        transform: `rotate(-14deg) scale(1.45) translateX(${-frame * 0.8}px)`,
      }}
    >
      <svg width={1080} height={1920}>
        <polyline
          points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={GOLD}
          strokeWidth={6}
          strokeDasharray={1200}
          strokeDashoffset={1200 * draw}
        />
        {pts.map((p, i) => {
          const dir = i % 2 === 0 ? -1 : 1;
          const o = interpolate(frame, [i * 6, i * 6 + 10], [0, 1], CLAMP);
          return (
            <g key={i} opacity={o}>
              <line
                x1={p.x}
                y1={p.y}
                x2={p.x - 40}
                y2={p.y + dir * 95}
                stroke={WHITE}
                strokeWidth={4}
              />
              <line
                x1={p.x}
                y1={p.y}
                x2={p.x + 40}
                y2={p.y + dir * 95}
                stroke={WHITE}
                strokeWidth={4}
              />
              <circle cx={p.x} cy={p.y} r={22} fill={GOLD} />
              <circle cx={p.x - 40} cy={p.y + dir * 95} r={17} fill={RED} />
              <circle cx={p.x + 40} cy={p.y + dir * 95} r={17} fill={RED} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const PeopleGrid: React.FC<{ progress: number }> = ({ progress }) => {
  const cols = 22;
  const rows = 39;
  const gap = 49;
  return (
    <AbsoluteFill style={{ opacity: 0.32 }}>
      <svg width={1080} height={1920}>
        {new Array(cols * rows).fill(0).map((_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const lit = random(`p${i}`) < progress;
          return (
            <circle
              key={i}
              cx={25 + c * gap}
              cy={20 + r * gap}
              r={lit ? 9 : 5}
              fill={lit ? RED : "rgba(255,255,255,0.35)"}
            />
          );
        })}
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
      bg="radial-gradient(ellipse at 50% 40%, #2a0f16 0%, #0b0608 70%)"
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
            text="FAI BOLLIRE L'ACQUA"
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
            text="per sicurezza?"
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
                  fontSize: 210,
                  lineHeight: 1,
                  color: RED,
                  border: `10px solid ${RED}`,
                  borderRadius: 26,
                  padding: "6px 44px 16px",
                  textShadow: "0 0 70px rgba(255,64,64,0.6)",
                  boxShadow: "0 0 70px rgba(255,64,64,0.35)",
                }}
              >
                ERRORE.
              </div>
            </Pop>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 1030,
            left: 0,
            right: 0,
            padding: "0 80px",
          }}
        >
          <Words
            text="Con i PFAS è inutile."
            at={DROP + 22}
            stagger={3}
            style={{
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 60,
              color: WHITE,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "baseline",
              gap: 26,
              marginTop: 30,
            }}
          >
            <Pop
              at={DROP + 44}
              style={{
                fontFamily: inter,
                fontWeight: 800,
                fontSize: 58,
                color: WHITE,
                whiteSpace: "nowrap",
              }}
            >
              Anzi, li
            </Pop>
            <Pop at={DROP + 52} mode="scale">
              <span
                style={{
                  fontFamily: oswald,
                  fontSize: 118,
                  color: "#1a0d00",
                  background: GOLD,
                  padding: "0 22px",
                  borderRadius: 14,
                  display: "inline-block",
                  transform: "rotate(-2deg)",
                }}
              >
                CONCENTRA.
              </span>
            </Pop>
          </div>
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

// ─── Scene 2: COSA SONO ───────────────────────────────────────────────────────

const SceneWhat: React.FC = () => {
  const frame = useCurrentFrame();
  const count = interpolate(frame, [30, 56], [0, 4700], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  return (
    <Shell
      bg="radial-gradient(ellipse at 50% 35%, #1d1030 0%, #0a0812 75%)"
      overlay={<Molecule />}
    >
      <div style={{ display: "flex", gap: 6 }}>
        {"PFAS".split("").map((l, i) => (
          <Pop
            key={i}
            at={i * 3}
            mode="scale"
            style={{
              fontFamily: oswald,
              fontSize: 290,
              lineHeight: 0.95,
              color: WHITE,
            }}
          >
            {l}
          </Pop>
        ))}
      </div>
      <Kicker at={12}>Forever chemicals</Kicker>

      <div style={{ height: 60 }} />

      <Pop at={28} mode="scale">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 160,
            lineHeight: 1,
            color: BLUE,
            textShadow: "0 0 60px rgba(37,150,190,0.55)",
          }}
        >
          {fmtIt(count)}+
        </div>
      </Pop>
      <Words
        text="sostanze chimiche sintetiche"
        at={36}
        stagger={3}
        style={{
          fontFamily: inter,
          fontWeight: 700,
          fontSize: 48,
          color: MUTED,
          marginTop: 8,
        }}
      />

      <div style={{ height: 50 }} />

      <div style={{ display: "flex", gap: 22, alignItems: "baseline" }}>
        <Words
          text="Non si degradano."
          at={62}
          stagger={3}
          style={{
            fontFamily: inter,
            fontWeight: 800,
            fontSize: 60,
            color: WHITE,
          }}
        />
        <Pop
          at={74}
          mode="stamp"
          style={{ fontFamily: oswald, fontSize: 92, color: RED }}
        >
          MAI.
        </Pop>
      </div>
    </Shell>
  );
};

// ─── Scene 3: PFAS VALLEY ─────────────────────────────────────────────────────

const SceneValley: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [18, 60], [0, 1], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 2.4),
  });

  return (
    <Shell
      bg="radial-gradient(ellipse at 50% 45%, #22080e 0%, #090507 75%)"
      overlay={<PeopleGrid progress={progress * 0.55} />}
    >
      <Kicker at={0}>Italia · Veneto</Kicker>
      <Pop
        at={4}
        mode="scale"
        style={{
          fontFamily: oswald,
          fontSize: 140,
          lineHeight: 1.05,
          color: RED,
          textShadow: "0 0 80px rgba(255,64,64,0.6)",
        }}
      >
        PFAS VALLEY
      </Pop>

      <div style={{ height: 40 }} />

      <Pop at={16} mode="scale">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 196,
            lineHeight: 1,
            color: WHITE,
            textShadow: "0 8px 40px rgba(0,0,0,0.8)",
          }}
        >
          {fmtIt(300000 * progress)}+
        </div>
      </Pop>
      <Pop
        at={22}
        style={{
          fontFamily: inter,
          fontWeight: 800,
          fontSize: 56,
          color: WHITE,
        }}
      >
        persone
      </Pop>

      <div style={{ height: 40 }} />

      <Words
        text="hanno bevuto acqua contaminata"
        at={64}
        stagger={3}
        style={{
          fontFamily: inter,
          fontWeight: 700,
          fontSize: 52,
          color: WHITE,
        }}
      />
      <Words
        text="per decenni. Senza saperlo."
        at={80}
        stagger={4}
        style={{
          fontFamily: inter,
          fontWeight: 800,
          fontSize: 52,
          color: RED,
          marginTop: 10,
        }}
      />

      <div style={{ height: 50 }} />
      <Source at={90}>Fonte: analisi ARPA Veneto</Source>
    </Shell>
  );
};

// ─── Scene 4: CANCEROGENO ─────────────────────────────────────────────────────

const SceneCancer: React.FC = () => (
  <Shell
    bg="radial-gradient(ellipse at 50% 45%, #1e0a10 0%, #08050a 75%)"
    impacts={[22]}
  >
    <Kicker at={0}>IARC · luglio 2023</Kicker>
    <Pop
      at={4}
      mode="scale"
      style={{ fontFamily: oswald, fontSize: 250, lineHeight: 1, color: WHITE }}
    >
      PFOA
    </Pop>
    <div style={{ height: 36 }} />
    <Pop at={22} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 118,
          lineHeight: 1,
          color: WHITE,
          background: RED,
          borderRadius: 18,
          padding: "14px 36px 22px",
          boxShadow: "0 0 90px rgba(255,64,64,0.55)",
        }}
      >
        CANCEROGENO
      </div>
    </Pop>
    <div style={{ height: 50 }} />
    <Words
      text="Gruppo 1: la stessa classe di amianto e fumo di tabacco."
      at={46}
      stagger={2}
      highlight={{ amianto: GOLD, fumo: GOLD, "tabacco.": GOLD }}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 50,
        color: WHITE,
        lineHeight: 1.25,
      }}
    />
  </Shell>
);

// ─── Scene 5: LIMITE UE ───────────────────────────────────────────────────────

const SceneLimit: React.FC = () => (
  <Shell bg="radial-gradient(ellipse at 50% 40%, #0b2234 0%, #050b12 75%)">
    <Kicker at={0} color={BLUE}>
      Nuovo limite UE · dal 2026
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
        0,01
        <span style={{ fontSize: 86, color: BLUE, marginLeft: 18 }}>µg/L</span>
      </div>
    </Pop>
    <Pop
      at={16}
      style={{ fontFamily: inter, fontWeight: 700, fontSize: 46, color: MUTED }}
    >
      per singolo PFAS
    </Pop>

    <div style={{ height: 60 }} />

    <Words
      text="= 10 miliardesimi"
      at={36}
      stagger={4}
      style={{ fontFamily: oswald, fontSize: 104, color: GOLD, lineHeight: 1 }}
    />
    <Words
      text="di grammo per litro"
      at={46}
      stagger={3}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 54,
        color: WHITE,
        marginTop: 12,
      }}
    />

    <div style={{ height: 50 }} />
    <Source at={60}>D.Lgs. 18/2023 · tra i limiti più severi al mondo</Source>
  </Shell>
);

// ─── Scene 6: LA GARA DEI FILTRI ──────────────────────────────────────────────

const BarRow: React.FC<{
  label: string;
  value: string;
  low: number;
  high: number;
  color: string;
  at: number;
  dimAt?: number;
  winner?: boolean;
  note?: string;
}> = ({ label, value, low, high, color, at, dimAt, winner, note }) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [at + 4, at + 22], [0, 1], {
    ...CLAMP,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
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
            padding: "22px 28px 26px",
            borderRadius: 22,
            background: winner
              ? "rgba(53,208,122,0.12)"
              : "rgba(255,255,255,0.05)",
            border: `3px solid ${winner ? GREEN : "rgba(255,255,255,0.08)"}`,
            boxShadow: winner ? "0 0 60px rgba(53,208,122,0.35)" : undefined,
            transform: `scale(${pulse})`,
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
                fontSize: 46,
                color: WHITE,
              }}
            >
              {label}
            </span>
            <span
              style={{ fontFamily: oswald, fontSize: 72, lineHeight: 1, color }}
            >
              {value}
            </span>
          </div>
          <div
            style={{
              position: "relative",
              height: 26,
              marginTop: 14,
              borderRadius: 13,
              background: "rgba(255,255,255,0.09)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${low * fill}%`,
                background: color,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${low * fill}%`,
                top: 0,
                bottom: 0,
                width: `${(high - low) * fill}%`,
                background: `repeating-linear-gradient(45deg, ${color}, ${color} 8px, ${color}66 8px, ${color}66 16px)`,
              }}
            />
          </div>
          {note && (
            <div
              style={{
                fontFamily: inter,
                fontWeight: 700,
                fontSize: 32,
                color,
                marginTop: 12,
              }}
            >
              {note}
            </div>
          )}
        </div>
      </Pop>
    </div>
  );
};

const SceneFilters: React.FC = () => (
  <Shell
    bg="radial-gradient(ellipse at 50% 40%, #0a1d24 0%, #04090c 75%)"
    impacts={[96]}
  >
    <Words
      text="COSA LI ELIMINA DAVVERO?"
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
    <div style={{ height: 44 }} />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
      }}
    >
      <BarRow
        label="Bollitura"
        value="0%"
        low={0}
        high={0}
        color={RED}
        at={18}
        dimAt={112}
        note="Li concentra"
      />
      <BarRow
        label="Filtro a brocca"
        value="30-50%"
        low={30}
        high={50}
        color={GOLD}
        at={42}
        dimAt={112}
      />
      <BarRow
        label="Carbone attivo"
        value="70-90%"
        low={70}
        high={90}
        color={GOLD}
        at={66}
        dimAt={112}
      />
      <BarRow
        label="Osmosi inversa"
        value=">95%"
        low={95}
        high={98}
        color={GREEN}
        at={90}
        winner
      />
    </div>
    <div style={{ height: 34 }} />
    <Words
      text="L'unica oltre il 95% su tutti i PFAS."
      at={118}
      stagger={2}
      style={{ fontFamily: inter, fontWeight: 800, fontSize: 46, color: GREEN }}
    />
    <div style={{ height: 18 }} />
    <Source at={128}>Fonte: Environmental Science & Technology, 2020</Source>
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
        Osmosi inversa certificata NSF/ANSI 58
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
  { at: DROP + 52, src: "sfx-pop.wav", volume: 0.6 },
  // counter ticks
  ...[30, 34, 38, 42, 46, 50].map((t) => ({
    at: CUTS[1] + t,
    src: "sfx-tick.wav",
    volume: 0.35,
  })),
  { at: CUTS[1] + 74, src: "sfx-pop.wav", volume: 0.6 },
  ...[18, 22, 26, 30, 34, 38, 42, 46, 52, 58].map((t) => ({
    at: CUTS[2] + t,
    src: "sfx-tick.wav",
    volume: 0.3,
  })),
  { at: CUTS[3] + 22, src: "sfx-impact.wav", volume: 0.5 },
  { at: CUTS[4] + 6, src: "sfx-pop.wav", volume: 0.55 },
  ...[18, 42, 66].map((t) => ({
    at: CUTS[5] + t,
    src: "sfx-pop.wav",
    volume: 0.45,
  })),
  { at: CUTS[5] + 96, src: "sfx-impact.wav", volume: 0.45 },
  { at: CUTS[6] + 66, src: "sfx-pop.wav", volume: 0.6 },
];

// ─── Main composition ─────────────────────────────────────────────────────────

const SCENES = [
  SceneHook,
  SceneWhat,
  SceneValley,
  SceneCancer,
  SceneLimit,
  SceneFilters,
  SceneCta,
];

export const PfasReelV2: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio
        src={staticFile("bold-statement.mp3")}
        trimBefore={MUSIC_TRIM}
        volume={(f) =>
          interpolate(
            f,
            [0, 4, durationInFrames - 24, durationInFrames],
            [0, 0.34, 0.34, 0],
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
