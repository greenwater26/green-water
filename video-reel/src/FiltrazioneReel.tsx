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
const GOLD = "#FFB800";
const GREEN = "#35d07a";
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

type Level = "yes" | "partial" | "no";

const SYMBOL: Record<Level, string> = { yes: "✓", partial: "~", no: "✗" };
const LEVEL_COLOR: Record<Level, string> = {
  yes: GREEN,
  partial: GOLD,
  no: RED,
};

const FilterRow: React.FC<{
  text: string;
  level: Level;
  delay: number;
  frame: number;
}> = ({ text, level, delay, frame }) => (
  <div
    style={{
      opacity: fi(frame, delay),
      transform: `translateY(${su(frame, delay, 20)}px)`,
      display: "flex",
      alignItems: "center",
      gap: 22,
      width: "100%",
    }}
  >
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: "50%",
        background: `${LEVEL_COLOR[level]}22`,
        border: `2.5px solid ${LEVEL_COLOR[level]}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: inter,
        fontSize: 26,
        fontWeight: 700,
        color: LEVEL_COLOR[level],
      }}
    >
      {SYMBOL[level]}
    </div>
    <div
      style={{
        fontFamily: inter,
        fontSize: 34,
        fontWeight: 600,
        color: "#ffffff",
      }}
    >
      {text}
    </div>
  </div>
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
        background: "linear-gradient(180deg, #06060f 0%, #0c0c20 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 70px",
        gap: 10,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 60,
          fontWeight: 700,
          color: MUTED,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        MICROFILTRAZIONE.
      </div>

      <div
        style={{
          opacity: fi(f, 18),
          transform: `translateY(${su(f, 18)}px)`,
          fontFamily: oswald,
          fontSize: 60,
          fontWeight: 700,
          color: MUTED,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        ULTRAFILTRAZIONE.
      </div>

      <div
        style={{
          opacity: fi(f, 36),
          transform: `translateY(${su(f, 36)}px)`,
          fontFamily: oswald,
          fontSize: 60,
          fontWeight: 700,
          color: MUTED,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 26,
        }}
      >
        OSMOSI INVERSA.
      </div>

      <div
        style={{
          opacity: fi(f, 64),
          transform: `translateY(${su(f, 64)}px)`,
          fontFamily: inter,
          fontSize: 42,
          fontWeight: 600,
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        Sembrano la stessa cosa?
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
            width: 640,
            height: 300,
            background: `radial-gradient(ellipse, rgba(255,64,64,${glow}) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontFamily: oswald,
            fontSize: 104,
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
          NON LO SONO
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: MICROFILTRAZIONE ─────────────────────────────────────────────────

const Scene2: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0c0c20 0%, #08131a 100%)",
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
          fontSize: 66,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "center",
        }}
      >
        MICROFILTRAZIONE
      </div>

      <div
        style={{
          opacity: fi(f, 14),
          fontFamily: inter,
          fontSize: 30,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Carbon Block
      </div>

      <Divider opacity={fi(f, 26)} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: "100%",
          marginTop: 8,
        }}
      >
        <FilterRow frame={f} delay={42} text="Cloro e odore" level="yes" />
        <FilterRow
          frame={f}
          delay={62}
          text="Alcuni batteri (parziale)"
          level="partial"
        />
        <FilterRow frame={f} delay={82} text="Metalli pesanti" level="no" />
        <FilterRow frame={f} delay={102} text="PFAS" level="no" />
        <FilterRow frame={f} delay={122} text="Residuo fisso" level="no" />
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

const TRANS_DUR = 15;
const timing = linearTiming({ durationInFrames: TRANS_DUR });

export const FiltrazioneReel: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("go-beyond.mp3")} volume={0.28} />

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
