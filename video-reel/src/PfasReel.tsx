import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
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

const BLUE = "#2596be";
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
        background: "linear-gradient(180deg, #0a0608 0%, #170a10 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 70px",
        gap: 14,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 64,
          fontWeight: 700,
          color: MUTED,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        300.000 PERSONE.
      </div>

      <div
        style={{
          opacity: fi(f, 18),
          transform: `translateY(${su(f, 18)}px)`,
          fontFamily: oswald,
          fontSize: 64,
          fontWeight: 700,
          color: MUTED,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        DECENNI.
      </div>

      <div
        style={{
          opacity: fi(f, 36),
          transform: `translateY(${su(f, 36)}px)`,
          fontFamily: inter,
          fontSize: 38,
          fontWeight: 600,
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Acqua contaminata senza saperlo.
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
            width: 700,
            height: 280,
            background: `radial-gradient(ellipse, rgba(255,64,64,${glow}) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontFamily: oswald,
            fontSize: 78,
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
          PFAS VALLEY, VENETO
        </div>
      </div>

      <div
        style={{
          opacity: fi(f, 122),
          transform: `translateY(${su(f, 122)}px)`,
          fontFamily: inter,
          fontSize: 34,
          fontWeight: 600,
          color: "#ffffff",
          textAlign: "center",
          marginTop: 14,
        }}
      >
        Ma non finisce qui.
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: COSA SONO ────────────────────────────────────────────────────────

const Scene2: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #170a10 0%, #150a1c 100%)",
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
          fontSize: 64,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "center",
        }}
      >
        FOREVER CHEMICALS
      </div>

      <div
        style={{
          opacity: fi(f, 14),
          fontFamily: inter,
          fontSize: 28,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Oltre 4.700 sostanze chimiche
      </div>

      <Divider opacity={fi(f, 26)} />

      <div
        style={{
          opacity: fi(f, 44),
          transform: `translateY(${su(f, 44)}px)`,
          fontFamily: inter,
          fontSize: 32,
          fontWeight: 600,
          color: "#ffffff",
          textAlign: "center",
          marginTop: 6,
        }}
      >
        Il legame chimico più forte mai creato.
      </div>

      <div
        style={{
          opacity: fi(f, 66),
          transform: `translateY(${su(f, 66)}px)`,
          fontFamily: inter,
          fontSize: 30,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
        }}
      >
        Non si degradano MAI — né nell'ambiente, né nel corpo.
      </div>

      <div
        style={{
          opacity: fi(f, 98, 20),
          transform: `scale(${sc(f, 98, 20, 0.6)})`,
          marginTop: 18,
          background: `${RED}22`,
          border: `2.5px solid ${RED}`,
          borderRadius: 20,
          padding: "18px 34px",
        }}
      >
        <div
          style={{
            fontFamily: oswald,
            fontSize: 46,
            fontWeight: 700,
            color: RED,
            textAlign: "center",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          PFOA = CANCEROGENO
        </div>
      </div>

      <div
        style={{
          opacity: fi(f, 124),
          fontFamily: inter,
          fontSize: 22,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
          marginTop: 6,
        }}
      >
        Classificazione IARC 2023 — Gruppo 1
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

const TRANS_DUR = 15;
const timing = linearTiming({ durationInFrames: TRANS_DUR });

export const PfasReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("bold-statement.mp3")} volume={0.28} />

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
