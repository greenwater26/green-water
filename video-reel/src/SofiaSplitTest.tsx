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
} from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily: mont } = loadFont("normal", {
  weights: ["800", "900"],
  subsets: ["latin"],
});

// Split-screen talking-head format: motion graphics on black in the top
// part, Sofia (MiniMax H3, lip-synced to the Elena take) in the bottom part,
// one caption word at a time sitting on the seam.

const FPS = 30;
const SPLIT = 860; // px from the top where the talking head starts
const AQUA = "#3ad7ff";
const AQUA_DIM = "rgba(58,215,255,0.35)";
const WHITE = "#ffffff";
const MUTED = "#7f8ea3";
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const VO_FILE = "vo-sofia-test/elena-10s.mp3";
const CLIP = "clip-sofia-test/sofia-10s.mp4";
const DUR = 10.1;
export const SOFIA_SPLIT_TEST_DURATION = Math.round(DUR * FPS);

type Word = [string, number];
const WORDS: Word[] = [
  ["Hai", 0],
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
];
const f = (sec: number) => Math.round(sec * FPS);
const at = (w: string, nth = 0) => f(WORDS.filter(([t]) => t === w)[nth][1]);

// ─── Motion helpers ───────────────────────────────────────────────────────────

const springAt = (
  frame: number,
  from: number,
  stiffness = 180,
  damping = 16,
) =>
  frame < from
    ? 0
    : spring({ frame: frame - from, fps: FPS, config: { stiffness, damping } });

const fadeOut = (frame: number, end: number) =>
  interpolate(frame, [end - 8, end], [1, 0], CLAMP);

// ─── Icons (SVG, line style) ──────────────────────────────────────────────────

const Faucet: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path
      d="M22 38 H58 a14 14 0 0 1 14 14 V60"
      stroke={WHITE}
      strokeWidth={7}
      strokeLinecap="round"
    />
    <path
      d="M36 38 V26 M26 26 H46"
      stroke={WHITE}
      strokeWidth={7}
      strokeLinecap="round"
    />
    <rect x={14} y={32} width={10} height={14} rx={3} fill={WHITE} />
  </svg>
);

const Drop: React.FC<{ size: number; color?: string }> = ({
  size,
  color = AQUA,
}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 40 52">
    <path
      d="M20 2 C20 2 4 22 4 33 a16 16 0 0 0 32 0 C36 22 20 2 20 2 Z"
      fill={color}
    />
  </svg>
);

const Cartridge: React.FC<{ kind: 0 | 1 | 2; h: number }> = ({ kind, h }) => {
  const w = h * 0.38;
  return (
    <svg width={w} height={h} viewBox="0 0 38 100">
      <rect
        x={4}
        y={8}
        width={30}
        height={86}
        rx={6}
        fill="#11161d"
        stroke={WHITE}
        strokeWidth={2.5}
      />
      <rect x={12} y={1} width={14} height={8} rx={2} fill={WHITE} />
      {kind === 0 &&
        Array.from({ length: 30 }).map((_, i) => (
          <circle
            key={i}
            cx={10 + (i % 5) * 4.5}
            cy={18 + Math.floor(i / 5) * 12}
            r={1.8}
            fill={MUTED}
          />
        ))}
      {kind === 1 &&
        Array.from({ length: 6 }).map((_, i) => (
          <line
            key={i}
            x1={10 + i * 3.8}
            y1={16}
            x2={10 + i * 3.8}
            y2={86}
            stroke={MUTED}
            strokeWidth={1.6}
          />
        ))}
      {kind === 2 &&
        Array.from({ length: 5 }).map((_, i) => (
          <ellipse
            key={i}
            cx={19}
            cy={51}
            rx={3 + i * 3}
            ry={6 + i * 7}
            fill="none"
            stroke={AQUA}
            strokeWidth={1.4}
          />
        ))}
    </svg>
  );
};

// Rounded glowing tile, like the reference channel's icon cards.
const Tile: React.FC<{
  size: number;
  glow?: number;
  children: React.ReactNode;
}> = ({ size, glow = 1, children }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: "linear-gradient(160deg, #151b23, #0b0f14)",
      border: `2px solid rgba(255,255,255,${0.12 + 0.2 * glow})`,
      boxShadow: `0 0 ${50 * glow}px ${AQUA_DIM}, inset 0 1px 0 rgba(255,255,255,0.08)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

// ─── Top-panel beats ──────────────────────────────────────────────────────────

const BeatFaucet: React.FC<{ end: number }> = ({ end }) => {
  const frame = useCurrentFrame();
  const s = springAt(frame, at("filtro") - 4);
  const q = springAt(frame, at("toglie"), 260, 14);
  // A drop falls from the spout on a loop.
  const t = ((frame - at("filtro")) % 24) / 24;
  const items = ["CLORO", "PFAS", "METALLI"];
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut(frame, end),
      }}
    >
      <div
        style={{
          position: "relative",
          transform: `scale(${0.6 + 0.4 * s})`,
          opacity: s,
        }}
      >
        <Tile size={260}>
          <div style={{ position: "relative", width: 170, height: 170 }}>
            <Faucet size={170} />
            {frame > at("filtro") && (
              <div
                style={{
                  position: "absolute",
                  left: 112,
                  top: 100 + t * 50,
                  opacity: 1 - t,
                }}
              >
                <Drop size={18} />
              </div>
            )}
          </div>
        </Tile>
        <div
          style={{
            position: "absolute",
            right: -34,
            top: -34,
            width: 92,
            height: 92,
            borderRadius: 46,
            background: AQUA,
            color: "#04131a",
            fontFamily: mont,
            fontWeight: 900,
            fontSize: 64,
            lineHeight: "92px",
            textAlign: "center",
            transform: `scale(${q})`,
            boxShadow: `0 0 40px ${AQUA}`,
          }}
        >
          ?
        </div>
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 50 }}>
        {items.map((it, k) => {
          const o = interpolate(
            frame,
            [at("quello") + k * 5, at("quello") + k * 5 + 8],
            [0, 1],
            CLAMP,
          );
          return (
            <div
              key={it}
              style={{
                opacity: o,
                transform: `translateY(${(1 - o) * 20}px)`,
                fontFamily: mont,
                fontWeight: 800,
                fontSize: 34,
                color: WHITE,
                padding: "10px 22px",
                borderRadius: 14,
                border: `2px dashed ${AQUA_DIM}`,
                background: "#0d1218",
              }}
            >
              {it} <span style={{ color: AQUA }}>?</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const BeatCartridges: React.FC<{ start: number; end: number }> = ({
  start,
  end,
}) => {
  const frame = useCurrentFrame();
  const o =
    interpolate(frame, [start, start + 8], [0, 1], CLAMP) * fadeOut(frame, end);
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", opacity: o }}
    >
      <div style={{ display: "flex", gap: 70, alignItems: "flex-end" }}>
        {([0, 1, 2] as const).map((k) => {
          const s = springAt(frame, start + k * 5);
          const neq = interpolate(
            frame,
            [at("uguali."), at("uguali.") + 8],
            [0, 1],
            CLAMP,
          );
          return (
            <div
              key={k}
              style={{
                transform: `translateY(${(1 - s) * 60}px)`,
                opacity: s,
                textAlign: "center",
              }}
            >
              <Cartridge kind={k} h={300} />
              {k < 2 && (
                <span
                  style={{
                    position: "absolute",
                    marginLeft: 22,
                    marginTop: 110,
                    fontFamily: mont,
                    fontWeight: 900,
                    fontSize: 60,
                    color: AQUA,
                    opacity: neq,
                  }}
                >
                  ≠
                </span>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const BeatTree: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [start, start + 8], [0, 1], CLAMP);
  const grow = interpolate(
    frame,
    [at("tecnologie,"), at("tecnologie,") + 14],
    [0, 1],
    {
      ...CLAMP,
      easing: (x) => 1 - Math.pow(1 - x, 3),
    },
  );
  const nodes = [
    { y: 170, label: "CARBONE", kind: 0 as const },
    { y: 430, label: "ULTRA", kind: 1 as const },
    { y: 690, label: "OSMOSI", kind: 2 as const },
  ];
  const cx = 250;
  const cy = 430;
  const nx = 640;
  const pulse =
    frame > at("diverse.")
      ? 1 + 0.04 * Math.sin((frame - at("diverse.")) / 4)
      : 1;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg
        width={1080}
        height={SPLIT}
        style={{ position: "absolute", inset: 0 }}
      >
        {nodes.map((n, k) => {
          const len = 520;
          return (
            <path
              key={k}
              d={`M${cx} ${cy} C ${cx + 200} ${cy}, ${nx - 200} ${n.y}, ${nx} ${n.y}`}
              stroke={AQUA}
              strokeWidth={4}
              fill="none"
              strokeDasharray={len}
              strokeDashoffset={len * (1 - grow)}
              style={{ filter: `drop-shadow(0 0 8px ${AQUA})` }}
            />
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: cx - 70, top: cy - 70 }}>
        <Tile size={140}>
          <Drop size={56} />
        </Tile>
      </div>
      {nodes.map((n, k) => {
        const s = springAt(frame, at("tecnologie,") + 8 + k * 5);
        const hot = frame >= at(["cose", "molto", "diverse."][k] as string);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: nx,
              top: n.y - 80,
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity: s,
              transform: `scale(${(0.7 + 0.3 * s) * (k === 2 ? pulse : 1)})`,
              transformOrigin: "left center",
            }}
          >
            <Tile size={160} glow={hot ? 1 : 0.3}>
              <Cartridge kind={n.kind} h={120} />
            </Tile>
            <span
              style={{
                fontFamily: mont,
                fontWeight: 900,
                fontSize: 44,
                color: hot ? WHITE : MUTED,
              }}
            >
              {n.label}
            </span>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: cx - 30,
          top: cy - 150,
          fontFamily: mont,
          fontWeight: 900,
          fontSize: 80,
          color: AQUA,
          opacity: interpolate(
            frame,
            [at("tre"), at("tre") + 6],
            [0, 1],
            CLAMP,
          ),
          textShadow: `0 0 30px ${AQUA}`,
        }}
      >
        3
      </div>
    </AbsoluteFill>
  );
};

// ─── Layers ───────────────────────────────────────────────────────────────────

const TopPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const b2 = at("I");
  const b3 = at("Ci");
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: SPLIT,
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 70% 60% at 50% 50%, #0b1a22 0%, #05080b 70%)",
      }}
    >
      {/* Faint dot grid */}
      <svg
        width={1080}
        height={SPLIT}
        style={{ position: "absolute", inset: 0, opacity: 0.25 }}
      >
        {Array.from({ length: 24 * 19 }).map((_, i) => (
          <circle
            key={i}
            cx={(i % 24) * 47 + 12}
            cy={Math.floor(i / 24) * 47 + 12}
            r={1.4}
            fill="#4a5a6a"
          />
        ))}
      </svg>
      {frame < b2 && <BeatFaucet end={b2} />}
      {frame >= b2 - 2 && frame < b3 && <BeatCartridges start={b2} end={b3} />}
      {frame >= b3 - 2 && <BeatTree start={b3} />}
    </div>
  );
};

const Talker: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: SPLIT,
      width: 1080,
      height: 1920 - SPLIT,
      overflow: "hidden",
      background: "#000",
    }}
  >
    <OffthreadVideo
      src={staticFile(CLIP)}
      muted
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "50% 8%",
      }}
    />
  </div>
);

const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = WORDS.findIndex((w, i) => {
    const next = WORDS[i + 1];
    return frame >= f(w[1]) - 1 && (next ? frame < f(next[1]) - 1 : true);
  });
  if (idx < 0) return null;
  const [w, s] = WORDS[idx];
  const p = Math.min(1, (frame - f(s) + 1) / 4);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: SPLIT - 70,
        textAlign: "center",
        fontFamily: mont,
        fontWeight: 900,
        fontSize: 84,
        letterSpacing: "0.01em",
        color: WHITE,
        textTransform: "uppercase",
        transform: `scale(${0.85 + 0.15 * p})`,
        textShadow: "0 4px 24px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
      }}
    >
      {w}
    </div>
  );
};

const Bug: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 70,
      left: 50,
      display: "flex",
      alignItems: "center",
      gap: 12,
      opacity: 0.9,
    }}
  >
    <div style={{ background: WHITE, borderRadius: 12, padding: "4px 8px" }}>
      <Img
        src={staticFile("logo-gw.png")}
        style={{ height: 44, display: "block" }}
      />
    </div>
  </div>
);

export const SofiaSplitTest: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <TopPanel />
    <Talker />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: SPLIT - 2,
        height: 4,
        background: `linear-gradient(90deg, transparent, ${AQUA_DIM}, transparent)`,
      }}
    />
    <Caption />
    <Bug />
    <Sequence layout="none">
      <Audio src={staticFile(VO_FILE)} volume={() => 1} />
    </Sequence>
  </AbsoluteFill>
);
