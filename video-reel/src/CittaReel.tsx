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

// go-beyond.mp3: the build-up peaks at 43.98s. We trim the track so that hit
// lands on frame 36, where the "NO." stamp slams in.
const MUSIC_TRIM = 1283;
const DROP = 36;
const BEAT = 31.8; // two beats at ~113 BPM, in frames
const onBeat = (n: number) => Math.round(DROP + n * BEAT);

// Each scene holds ~1.5 beats after its last animation so there is time to read.
const CUTS = [
  0,
  onBeat(4),
  onBeat(8.5),
  onBeat(13),
  onBeat(17.5),
  onBeat(22),
  onBeat(28),
  onBeat(33),
];
export const CITTA_DURATION = onBeat(33) + 170;

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

const Bubbles: React.FC<{ boostAt: number }> = ({ boostAt }) => {
  const frame = useCurrentFrame();
  const heat = interpolate(frame, [0, boostAt], [0.6, 1.8], CLAMP);
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
              border: "2px solid rgba(120,190,230,0.22)",
              background: "rgba(120,190,230,0.05)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Faint topographic rings, for the "geology" feel of the city scenes.
const Contours: React.FC<{ color?: string }> = ({ color = BLUE }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.14 }}>
      <svg width={1080} height={1920}>
        {new Array(9).fill(0).map((_, i) => (
          <ellipse
            key={i}
            cx={540 + Math.sin(i * 1.7) * 40}
            cy={980}
            rx={140 + i * 95 + frame * 0.4}
            ry={90 + i * 70 + frame * 0.3}
            fill="none"
            stroke={color}
            strokeWidth={3}
            transform={`rotate(${-12 + i * 3} 540 980)`}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ─── Hardness gauge (0–50 °F, dolce / media / dura) ──────────────────────────

type Marker = { value: number; label: string; at: number; color: string };

const GAUGE_W = 900;
const GAUGE_MAX = 50;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const Gauge: React.FC<{ at: number; markers: Marker[] }> = ({
  at,
  markers,
}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [at, at + 14], [0, 1], {
    ...CLAMP,
    easing: ease,
  });
  const x = (v: number) => (v / GAUGE_MAX) * GAUGE_W;
  const zones = [
    { from: 0, to: 15, color: GREEN, label: "dolce" },
    { from: 15, to: 30, color: GOLD, label: "media" },
    { from: 30, to: 50, color: RED, label: "dura" },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: GAUGE_W,
        height: 160,
      }}
    >
      {markers.map((m, i) => {
        const p = interpolate(frame, [m.at, m.at + 22], [0, 1], {
          ...CLAMP,
          easing: ease,
        });
        const o = interpolate(frame, [m.at, m.at + 6], [0, 1], CLAMP);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x(m.value * p),
              top: 0,
              transform: "translateX(-50%)",
              opacity: o,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontWeight: 800,
                fontSize: 30,
                color: m.color,
                whiteSpace: "nowrap",
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                width: 0,
                height: 0,
                marginTop: 6,
                borderLeft: "16px solid transparent",
                borderRight: "16px solid transparent",
                borderTop: `22px solid ${m.color}`,
              }}
            />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          top: 76,
          left: 0,
          width: GAUGE_W * draw,
          height: 30,
          borderRadius: 15,
          overflow: "hidden",
          display: "flex",
        }}
      >
        {zones.map((z) => (
          <div
            key={z.label}
            style={{
              flex: `0 0 ${x(z.to - z.from)}px`,
              background: z.color,
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      {zones.map((z) => (
        <div
          key={z.label}
          style={{
            position: "absolute",
            top: 118,
            left: x(z.from),
            width: x(z.to - z.from),
            textAlign: "center",
            opacity: interpolate(frame, [at + 10, at + 20], [0, 0.85], CLAMP),
            fontFamily: inter,
            fontWeight: 700,
            fontSize: 28,
            color: z.color,
          }}
        >
          {z.label}
        </div>
      ))}
    </div>
  );
};

// Big animated "27°F" number.
const Degrees: React.FC<{ value: number; at: number; color: string }> = ({
  value,
  at,
  color,
}) => {
  const frame = useCurrentFrame();
  const n = interpolate(frame, [at, at + 24], [0, value], {
    ...CLAMP,
    easing: ease,
  });
  return (
    <Pop at={at} mode="scale">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 240,
          lineHeight: 1,
          color,
          textShadow: `0 0 70px ${color}88`,
        }}
      >
        {Math.round(n)}
        <span style={{ fontSize: 110, marginLeft: 6 }}>°F</span>
      </div>
    </Pop>
  );
};

const CityTitle: React.FC<{ name: string; kicker: string }> = ({
  name,
  kicker,
}) => (
  <>
    <Kicker at={0} color={BLUE}>
      {kicker}
    </Kicker>
    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
      {name.split("").map((l, i) => (
        <Pop
          key={i}
          at={2 + i * 2}
          mode="scale"
          style={{
            fontFamily: oswald,
            fontSize: 190,
            lineHeight: 1,
            color: WHITE,
          }}
        >
          {l}
        </Pop>
      ))}
    </div>
  </>
);

// ─── Scene 1: HOOK ────────────────────────────────────────────────────────────

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const qScale = interpolate(frame, [DROP - 4, DROP + 8], [1, 0.62], CLAMP);
  const qTop = interpolate(frame, [DROP - 4, DROP + 8], [600, 280], CLAMP);
  const qDim = interpolate(frame, [DROP - 4, DROP + 8], [1, 0.55], CLAMP);
  const glow = interpolate(
    frame,
    [DROP, DROP + 10, DROP + 40],
    [0, 1, 0.55],
    CLAMP,
  );

  return (
    <Shell
      bg="radial-gradient(ellipse at 50% 40%, #0d2b40 0%, #050b12 70%)"
      impacts={[DROP]}
      overlay={<Bubbles boostAt={DROP} />}
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
            text="L'ACQUA DEL RUBINETTO"
            at={0}
            stagger={5}
            style={{
              fontFamily: oswald,
              fontSize: 132,
              lineHeight: 1.02,
              color: WHITE,
            }}
          />
          <Words
            text="è uguale in tutta Italia?"
            at={16}
            style={{
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 62,
              color: MUTED,
              marginTop: 18,
            }}
          />
        </div>

        {frame >= DROP && (
          <div
            style={{
              position: "absolute",
              top: 640,
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
                height: 460,
                top: -80,
                background: `radial-gradient(ellipse, rgba(255,184,0,${0.45 * glow}) 0%, transparent 65%)`,
              }}
            />
            <Pop at={DROP} mode="stamp">
              <div
                style={{
                  fontFamily: oswald,
                  fontSize: 260,
                  lineHeight: 1,
                  color: GOLD,
                  border: `10px solid ${GOLD}`,
                  borderRadius: 26,
                  padding: "6px 60px 16px",
                  textShadow: "0 0 70px rgba(255,184,0,0.6)",
                  boxShadow: "0 0 70px rgba(255,184,0,0.35)",
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 20 }}>
            {["MILANO", "ROMA", "NAPOLI"].map((c, i) => (
              <Pop key={c} at={DROP + 20 + i * 6} mode="scale">
                <div
                  style={{
                    fontFamily: oswald,
                    fontSize: 64,
                    color: WHITE,
                    background: "rgba(37,150,190,0.25)",
                    border: `3px solid ${BLUE}`,
                    borderRadius: 999,
                    padding: "4px 30px 8px",
                  }}
                >
                  {c}
                </div>
              </Pop>
            ))}
          </div>
          <Words
            text="bevono tre acque diverse."
            at={DROP + 44}
            stagger={3}
            highlight={{ tre: GOLD }}
            style={{
              fontFamily: inter,
              fontWeight: 800,
              fontSize: 62,
              color: WHITE,
              marginTop: 36,
            }}
          />
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

// ─── Scene 2: PERCHÉ CAMBIA ───────────────────────────────────────────────────

const Factor: React.FC<{
  n: string;
  title: string;
  text: string;
  at: number;
}> = ({ n, title, text, at }) => (
  <Pop at={at} style={{ width: "100%" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 34,
        width: "100%",
        padding: "24px 32px",
        borderRadius: 24,
        background: "rgba(255,255,255,0.05)",
        border: "3px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          fontFamily: oswald,
          fontSize: 96,
          lineHeight: 1,
          color: BLUE,
          width: 70,
          textAlign: "center",
        }}
      >
        {n}
      </div>
      <div>
        <div
          style={{
            fontFamily: oswald,
            fontSize: 78,
            lineHeight: 1.05,
            color: WHITE,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: inter,
            fontWeight: 700,
            fontSize: 38,
            color: MUTED,
            marginTop: 4,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  </Pop>
);

const SceneWhy: React.FC = () => (
  <Shell
    bg="radial-gradient(ellipse at 50% 35%, #0f2a3a 0%, #050a10 75%)"
    overlay={<Contours />}
  >
    <Words
      text="DIPENDE DA 3 COSE"
      at={0}
      stagger={3}
      highlight={{ "3": GOLD }}
      style={{ fontFamily: oswald, fontSize: 112, color: WHITE, lineHeight: 1 }}
    />
    <div style={{ height: 56 }} />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        width: "100%",
      }}
    >
      <Factor n="1" title="LA FONTE" text="falda, sorgente o fiume" at={16} />
      <Factor
        n="2"
        title="LE ROCCE"
        text="il calcare rende l'acqua dura"
        at={36}
      />
      <Factor
        n="3"
        title="I TUBI"
        text="tutto il tragitto fino al rubinetto"
        at={56}
      />
    </div>
  </Shell>
);

// ─── Scene 3: MILANO ──────────────────────────────────────────────────────────

const SceneMilano: React.FC = () => (
  <Shell
    bg="radial-gradient(ellipse at 50% 40%, #102638 0%, #050a10 75%)"
    overlay={<Contours />}
  >
    <CityTitle name="MILANO" kicker="Acqua di falda" />
    <div style={{ height: 30 }} />
    <Degrees value={27} at={16} color={GOLD} />
    <Pop
      at={22}
      style={{ fontFamily: inter, fontWeight: 700, fontSize: 44, color: MUTED }}
    >
      di durezza media
    </Pop>
    <div style={{ height: 40 }} />
    <Gauge
      at={30}
      markers={[{ value: 27, label: "MILANO", at: 40, color: WHITE }]}
    />
    <Words
      text="Buona da bere, ma lascia calcare."
      at={68}
      stagger={3}
      highlight={{ "calcare.": GOLD }}
      style={{ fontFamily: inter, fontWeight: 800, fontSize: 52, color: WHITE }}
    />
    <div style={{ height: 30 }} />
    <Source at={80}>Fonte: dati MM S.p.A.</Source>
  </Shell>
);

// ─── Scene 4: ROMA ────────────────────────────────────────────────────────────

const SceneRoma: React.FC = () => (
  <Shell
    bg="radial-gradient(ellipse at 50% 40%, #2a1608 0%, #0c0704 75%)"
    overlay={<Contours color={GOLD} />}
    impacts={[64]}
  >
    <CityTitle name="ROMA" kicker="Sorgenti dell'Appennino" />
    <div style={{ height: 30 }} />
    <Degrees value={34} at={14} color={RED} />
    <Pop
      at={20}
      style={{ fontFamily: inter, fontWeight: 700, fontSize: 44, color: MUTED }}
    >
      zona Peschiera-Capore
    </Pop>
    <div style={{ height: 40 }} />
    <Gauge
      at={28}
      markers={[{ value: 34, label: "ROMA", at: 38, color: WHITE }]}
    />
    <div style={{ height: 30 }} />
    <Pop at={64} mode="stamp">
      <div
        style={{
          fontFamily: oswald,
          fontSize: 110,
          lineHeight: 1,
          color: WHITE,
          background: RED,
          borderRadius: 18,
          padding: "12px 36px 20px",
          boxShadow: "0 0 80px rgba(255,64,64,0.5)",
        }}
      >
        ACQUA DURA
      </div>
    </Pop>
    <div style={{ height: 30 }} />
    <Words
      text="Scorre nella roccia calcarea e si carica di calcio."
      at={78}
      stagger={2}
      style={{
        fontFamily: inter,
        fontWeight: 700,
        fontSize: 44,
        color: WHITE,
        lineHeight: 1.25,
      }}
    />
    <div style={{ height: 24 }} />
    <Source at={90}>Fonte: ACEA ATO2, scheda qualità zona 3</Source>
  </Shell>
);

// ─── Scene 5: NAPOLI ──────────────────────────────────────────────────────────

const Pipe: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [at, at + 22], [1, 0], CLAMP);
  const b = interpolate(frame, [at + 30, at + 50], [1, 0], CLAMP);
  const flow = -frame * 5;
  const RUST = "#c8743a";
  const clean = "M 40 70 L 560 70";
  const old = "M 560 70 L 560 220 L 860 220 L 860 330";
  const lenA = 520;
  const lenB = 150 + 300 + 110;
  const warn = interpolate(frame, [at + 50, at + 58], [0, 1], CLAMP);

  return (
    <svg width={900} height={380} style={{ overflow: "visible" }}>
      <path
        d={clean}
        stroke={BLUE}
        strokeWidth={34}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={lenA}
        strokeDashoffset={lenA * a}
      />
      <path
        d={old}
        stroke={RUST}
        strokeWidth={34}
        fill="none"
        strokeLinejoin="round"
        strokeDasharray={lenB}
        strokeDashoffset={lenB * b}
      />
      {/* water flowing inside */}
      <path
        d={`${clean} ${old.replace("M 560 70", "")}`}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={8}
        fill="none"
        strokeDasharray="18 34"
        strokeDashoffset={flow}
        opacity={interpolate(frame, [at + 50, at + 56], [0, 1], CLAMP)}
      />
      <circle cx={40} cy={70} r={30} fill={GREEN} opacity={1 - a} />
      <text
        x={40}
        y={20}
        textAnchor="start"
        fill={GREEN}
        opacity={1 - a}
        style={{ fontFamily: inter, fontWeight: 800, fontSize: 32 }}
      >
        CENTRALE ✓
      </text>
      <text
        x={860}
        y={380}
        textAnchor="end"
        fill={RUST}
        opacity={warn}
        style={{ fontFamily: inter, fontWeight: 800, fontSize: 32 }}
      >
        TUO RUBINETTO ?
      </text>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={560 + i * 110 + 60}
          cy={220}
          r={7}
          fill="#1a0d00"
          opacity={warn}
        />
      ))}
    </svg>
  );
};

const SceneNapoli: React.FC = () => (
  <Shell
    bg="radial-gradient(ellipse at 50% 40%, #0f2a3a 0%, #050a10 75%)"
    overlay={<Contours />}
  >
    <CityTitle name="NAPOLI" kicker="Acquedotto del Serino" />
    <div style={{ height: 30 }} />
    <Words
      text="Alla fonte è ottima."
      at={14}
      stagger={3}
      highlight={{ "ottima.": GREEN }}
      style={{ fontFamily: inter, fontWeight: 800, fontSize: 60, color: WHITE }}
    />
    <div style={{ height: 50 }} />
    <Pipe at={26} />
    <div style={{ height: 50 }} />
    <Words
      text="Il rischio è il tragitto:"
      at={80}
      stagger={3}
      style={{ fontFamily: inter, fontWeight: 800, fontSize: 56, color: WHITE }}
    />
    <Words
      text="tubi vecchi negli edifici storici."
      at={94}
      stagger={3}
      style={{
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 56,
        color: "#e08a4a",
        marginTop: 8,
      }}
    />
  </Shell>
);

// ─── Scene 6: CONFRONTO ───────────────────────────────────────────────────────

const zoneColor = (v: number) => (v < 15 ? GREEN : v <= 30 ? GOLD : RED);

const CityBar: React.FC<{ city: string; value: number; at: number }> = ({
  city,
  value,
  at,
}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [at + 4, at + 24], [0, 1], {
    ...CLAMP,
    easing: ease,
  });
  const color = zoneColor(value);
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
          <span style={{ fontFamily: oswald, fontSize: 64, color: WHITE }}>
            {city}
          </span>
          <span style={{ fontFamily: oswald, fontSize: 72, color }}>
            {Math.round(value * fill)}°F
          </span>
        </div>
        <div
          style={{
            height: 30,
            marginTop: 8,
            borderRadius: 15,
            background: "rgba(255,255,255,0.09)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(value / GAUGE_MAX) * 100 * fill}%`,
              height: "100%",
              background: color,
              boxShadow: `0 0 30px ${color}`,
            }}
          />
        </div>
      </div>
    </Pop>
  );
};

const SceneCompare: React.FC = () => {
  const frame = useCurrentFrame();
  const top = interpolate(frame, [104, 126], [11, 28], {
    ...CLAMP,
    easing: ease,
  });
  return (
    <Shell
      bg="radial-gradient(ellipse at 50% 40%, #0b2234 0%, #050b12 75%)"
      impacts={[100]}
    >
      <Words
        text="DUREZZA A CONFRONTO"
        at={0}
        stagger={4}
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
          gap: 26,
          width: "100%",
        }}
      >
        <CityBar city="Torino" value={24} at={14} />
        <CityBar city="Milano" value={27} at={26} />
        <CityBar city="Roma" value={34} at={38} />
      </div>
      <div style={{ height: 50 }} />
      <Words
        text="Ma cambia anche nella stessa città."
        at={70}
        stagger={2}
        highlight={{ stessa: GOLD }}
        style={{
          fontFamily: inter,
          fontWeight: 800,
          fontSize: 50,
          color: WHITE,
          lineHeight: 1.25,
        }}
      />
      <div style={{ height: 24 }} />
      <Pop at={100} mode="scale">
        <div
          style={{
            fontFamily: oswald,
            fontSize: 96,
            whiteSpace: "nowrap",
            lineHeight: 1,
            color: GOLD,
            textShadow: "0 0 60px rgba(255,184,0,0.5)",
          }}
        >
          TORINO: 11 → {Math.round(top)}°F
        </div>
      </Pop>
      <Pop
        at={110}
        style={{
          fontFamily: inter,
          fontWeight: 700,
          fontSize: 40,
          color: MUTED,
          marginTop: 10,
        }}
      >
        da un quartiere all'altro
      </Pop>
      <div style={{ height: 30 }} />
      <Source at={124}>Fonti: SMAT 2023, MM, ACEA ATO2</Source>
    </Shell>
  );
};

// ─── Scene 7: COSA FARE ───────────────────────────────────────────────────────

const Step: React.FC<{
  label: string;
  value: string;
  at: number;
  color: string;
  winner?: boolean;
}> = ({ label, value, at, color, winner }) => {
  const frame = useCurrentFrame();
  const pulse = winner
    ? 1 +
      0.025 *
        Math.max(0, Math.sin((frame - at) / 5)) *
        (frame > at + 20 ? 1 : 0)
    : 1;
  return (
    <Pop at={at} style={{ width: "100%" }}>
      <div
        style={{
          width: "100%",
          padding: "24px 32px 28px",
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
            fontFamily: inter,
            fontWeight: 700,
            fontSize: 38,
            color: MUTED,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: oswald,
            fontSize: 72,
            lineHeight: 1.1,
            color,
            marginTop: 4,
          }}
        >
          {value}
        </div>
      </div>
    </Pop>
  );
};

const SceneFix: React.FC = () => (
  <Shell
    bg="radial-gradient(ellipse at 50% 40%, #0a1d24 0%, #04090c 75%)"
    impacts={[64]}
  >
    <Words
      text="COSA PUOI FARE?"
      at={0}
      stagger={4}
      highlight={{ "FARE?": GREEN }}
      style={{ fontFamily: oswald, fontSize: 112, color: WHITE, lineHeight: 1 }}
    />
    <div style={{ height: 50 }} />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
        width: "100%",
      }}
    >
      <Step
        label="1 · Prima di tutto"
        value="LEGGI I DATI DEL GESTORE"
        at={16}
        color={WHITE}
      />
      <Step
        label="2 · Calcare su tutto l'impianto"
        value="ADDOLCITORE"
        at={38}
        color={GOLD}
      />
      <Step
        label="3 · Per l'acqua da bere"
        value="OSMOSI INVERSA"
        at={60}
        color={GREEN}
        winner
      />
    </div>
  </Shell>
);

// ─── Scene 8: CTA ─────────────────────────────────────────────────────────────

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
        text="Salvalo e mandalo a chi vive a Milano, Roma o Napoli."
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
        Consulenza gratuita sui dati del tuo Comune
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

const ticks = (scene: number, from: number, n: number, step = 4) =>
  new Array(n).fill(0).map((_, i) => ({
    at: CUTS[scene] + from + i * step,
    src: "sfx-tick.wav",
    volume: 0.3,
  }));

const SFX: Sfx[] = [
  // whooshes lead into every cut (peak ~9 frames after start)
  ...CUTS.slice(1).map((c) => ({
    at: c - 9,
    src: "sfx-whoosh.wav",
    volume: 0.45,
  })),
  { at: DROP, src: "sfx-impact.wav", volume: 0.5 },
  ...[20, 26, 32].map((t) => ({
    at: DROP + t,
    src: "sfx-pop.wav",
    volume: 0.5,
  })),
  ...[16, 36, 56].map((t) => ({
    at: CUTS[1] + t,
    src: "sfx-pop.wav",
    volume: 0.45,
  })),
  ...ticks(2, 16, 6),
  ...ticks(3, 14, 6),
  { at: CUTS[3] + 64, src: "sfx-impact.wav", volume: 0.5 },
  { at: CUTS[4] + 76, src: "sfx-pop.wav", volume: 0.5 },
  ...[14, 26, 38].map((t) => ({
    at: CUTS[5] + t,
    src: "sfx-pop.wav",
    volume: 0.45,
  })),
  { at: CUTS[5] + 100, src: "sfx-impact.wav", volume: 0.45 },
  ...[16, 38].map((t) => ({
    at: CUTS[6] + t,
    src: "sfx-pop.wav",
    volume: 0.45,
  })),
  { at: CUTS[6] + 60, src: "sfx-impact.wav", volume: 0.45 },
  { at: CUTS[7] + 66, src: "sfx-pop.wav", volume: 0.6 },
];

// ─── Main composition ─────────────────────────────────────────────────────────

const SCENES = [
  SceneHook,
  SceneWhy,
  SceneMilano,
  SceneRoma,
  SceneNapoli,
  SceneCompare,
  SceneFix,
  SceneCta,
];

export const CittaReel: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio
        src={staticFile("go-beyond.mp3")}
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
