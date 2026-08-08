import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
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

// ─── Main composition ─────────────────────────────────────────────────────────

export const PfasReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("bold-statement.mp3")} volume={0.28} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
