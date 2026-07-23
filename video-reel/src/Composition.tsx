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

function counter(frame: number, start: number, end: number, max: number): number {
  return Math.round(
    interpolate(frame, [start, end], [0, max], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    })
  );
}

// ─── Shared elements ──────────────────────────────────────────────────────────

const Divider: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      width: "100%",
      height: 3,
      background: "linear-gradient(90deg, transparent, #2596be, transparent)",
      opacity,
      margin: "8px 0",
    }}
  />
);

// ─── Scene 1: HOOK ───────────────────────────────────────────────────────────

const Scene1: React.FC = () => {
  const f = useCurrentFrame();

  const numGlow = interpolate(f, [90, 140], [0, 0.65], {
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
        padding: "0 80px",
        gap: 12,
      }}
    >
      <Divider opacity={fi(f, 55)} />

      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 68,
          fontWeight: 700,
          color: "#8090b0",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        HAI MAI CALCOLATO
      </div>

      <div
        style={{
          opacity: fi(f, 22),
          transform: `translateY(${su(f, 22)}px)`,
          fontFamily: oswald,
          fontSize: 108,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        QUANTO SPENDI
      </div>

      <div
        style={{
          opacity: fi(f, 44),
          transform: `scale(${sc(f, 44, 22, 1.3)})`,
          fontFamily: oswald,
          fontSize: 108,
          fontWeight: 700,
          color: "#2596be",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 60,
        }}
      >
        PER L'ACQUA?
      </div>

      <Divider opacity={fi(f, 60)} />

      {/* Big hook number */}
      <div
        style={{
          opacity: fi(f, 80, 20),
          transform: `scale(${sc(f, 80, 20, 0.75)})`,
          position: "relative",
          marginTop: 30,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 300,
            background: `radial-gradient(ellipse, rgba(255,184,0,${numGlow}) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontFamily: oswald,
            fontSize: 180,
            fontWeight: 700,
            color: "#FFB800",
            lineHeight: 1,
            textAlign: "center",
            textShadow: "0 0 80px rgba(255,184,0,0.5)",
            letterSpacing: "-0.02em",
            position: "relative",
          }}
        >
          €1.000
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 36,
            fontWeight: 600,
            color: "#8090b0",
            textAlign: "center",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: fi(f, 100, 15),
          }}
        >
          ALL'ANNO · PER FAMIGLIA
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: THE PROBLEM ─────────────────────────────────────────────────────

const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const count = counter(f, 45, 120, 5000);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0c0c20 0%, #08101a 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 20,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: inter,
          fontSize: 46,
          fontWeight: 600,
          color: "#8090b0",
          textAlign: "center",
        }}
      >
        Una famiglia di 4 persone
      </div>

      <div
        style={{
          opacity: fi(f, 20),
          transform: `translateY(${su(f, 20)}px)`,
          fontFamily: inter,
          fontSize: 46,
          fontWeight: 600,
          color: "#8090b0",
          textAlign: "center",
        }}
      >
        in acqua in bottiglia spende...
      </div>

      {/* Counter */}
      <div style={{ position: "relative", margin: "24px 0", opacity: fi(f, 38) }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 350,
            background: "radial-gradient(ellipse, rgba(255,60,60,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            fontFamily: oswald,
            fontSize: 210,
            fontWeight: 700,
            color: "#ff4040",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            textAlign: "center",
            textShadow: "0 0 100px rgba(255,64,64,0.45)",
            position: "relative",
          }}
        >
          €{count.toLocaleString("it-IT")}
        </div>
      </div>

      <div
        style={{
          opacity: fi(f, 125),
          transform: `translateY(${su(f, 125)}px)`,
          fontFamily: oswald,
          fontSize: 60,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          textAlign: "center",
          letterSpacing: "0.04em",
        }}
      >
        IN SOLI 5 ANNI
      </div>

      <Divider opacity={fi(f, 140)} />

      <div
        style={{
          opacity: fi(f, 148),
          transform: `translateY(${su(f, 148)}px)`,
          fontFamily: inter,
          fontSize: 38,
          fontWeight: 600,
          color: "#8090b0",
          textAlign: "center",
        }}
      >
        Stai leggendo bene: cinquemila euro
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: BREAKDOWN ───────────────────────────────────────────────────────

const Card: React.FC<{
  value: string;
  label: string;
  color: string;
  delay: number;
  frame: number;
}> = ({ value, label, color, delay, frame }) => (
  <div
    style={{
      opacity: fi(frame, delay),
      transform: `translateY(${su(frame, delay, 22)}px)`,
      background: "rgba(255,255,255,0.05)",
      border: `2px solid ${color}40`,
      borderRadius: 28,
      padding: "38px 60px",
      width: "100%",
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontFamily: oswald,
        fontSize: 100,
        fontWeight: 700,
        color,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        textShadow: `0 0 40px ${color}50`,
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontFamily: inter,
        fontSize: 34,
        fontWeight: 600,
        color: "#8090b0",
        marginTop: 10,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      }}
    >
      {label}
    </div>
  </div>
);

const Scene3: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #08101a 0%, #090912 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 32,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          fontFamily: oswald,
          fontSize: 56,
          fontWeight: 700,
          color: "#8090b0",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        IL CONTO È PRESTO FATTO
      </div>

      <Card frame={f} delay={18} value="€0,70" label="a persona · ogni giorno" color="#2596be" />
      <Card frame={f} delay={48} value="€1.000" label="ogni singolo anno" color="#FFB800" />
      <Card frame={f} delay={78} value="€5.000" label="in soli 5 anni" color="#ff4040" />
    </AbsoluteFill>
  );
};

// ─── Scene 4: SOLUTION ────────────────────────────────────────────────────────

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const count = counter(f, 55, 125, 2600);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #090912 0%, #061620 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 24,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 68,
          fontWeight: 700,
          color: "#8090b0",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          textAlign: "center",
        }}
      >
        MA C'È UNA SOLUZIONE
      </div>

      <Divider opacity={fi(f, 18)} />

      <div
        style={{
          opacity: fi(f, 26),
          transform: `translateY(${su(f, 26)}px)`,
          fontFamily: inter,
          fontSize: 48,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        Con un impianto di filtrazione
      </div>

      <div
        style={{
          opacity: fi(f, 44),
          transform: `translateY(${su(f, 44)}px)`,
          fontFamily: inter,
          fontSize: 40,
          fontWeight: 600,
          color: "#8090b0",
          textAlign: "center",
        }}
      >
        in 5 anni paghi soltanto...
      </div>

      {/* Solution counter */}
      <div style={{ position: "relative", margin: "20px 0", opacity: fi(f, 50) }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 350,
            background: "radial-gradient(ellipse, rgba(37,150,190,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            fontFamily: oswald,
            fontSize: 210,
            fontWeight: 700,
            color: "#2596be",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            textAlign: "center",
            textShadow: "0 0 100px rgba(37,150,190,0.55)",
            position: "relative",
          }}
        >
          €{count.toLocaleString("it-IT")}
        </div>
      </div>

      <div
        style={{
          opacity: fi(f, 130),
          transform: `translateY(${su(f, 130)}px)`,
          fontFamily: inter,
          fontSize: 40,
          fontWeight: 600,
          color: "#8090b0",
          textAlign: "center",
        }}
      >
        acqua sempre disponibile in casa
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: SAVINGS ─────────────────────────────────────────────────────────

const Check: React.FC<{ text: string; delay: number; frame: number }> = ({
  text,
  delay,
  frame,
}) => (
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
        width: 46,
        height: 46,
        borderRadius: "50%",
        background: "#2596be",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: inter,
        fontSize: 26,
        fontWeight: 700,
        color: "white",
      }}
    >
      ✓
    </div>
    <div
      style={{
        fontFamily: inter,
        fontSize: 40,
        fontWeight: 600,
        color: "#ffffff",
      }}
    >
      {text}
    </div>
  </div>
);

const Scene5: React.FC = () => {
  const f = useCurrentFrame();

  const glowPulse = interpolate(f, [0, 45, 90], [0.4, 0.7, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #061620 0%, #040a0c 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 28,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 72,
          fontWeight: 700,
          color: "#8090b0",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          textAlign: "center",
        }}
      >
        RISPARMIO NETTO IN 5 ANNI
      </div>

      {/* Big savings */}
      <div
        style={{
          opacity: fi(f, 12, 20),
          transform: `scale(${sc(f, 12, 24, 0.7)})`,
          position: "relative",
          margin: "10px 0 20px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 400,
            background: `radial-gradient(ellipse, rgba(255,184,0,${glowPulse}) 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            fontFamily: oswald,
            fontSize: 230,
            fontWeight: 700,
            color: "#FFB800",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            textAlign: "center",
            textShadow: "0 0 120px rgba(255,184,0,0.6)",
            position: "relative",
          }}
        >
          €2.400
        </div>
      </div>

      <Divider opacity={fi(f, 50)} />

      <Check frame={f} delay={62} text="Qualità dell'acqua garantita" />
      <Check frame={f} delay={80} text="Zero plastica monouso" />
      <Check frame={f} delay={98} text="Acqua sempre in casa" />
    </AbsoluteFill>
  );
};

// ─── Scene 6: CTA ─────────────────────────────────────────────────────────────

const Scene6: React.FC = () => {
  const f = useCurrentFrame();

  const pulse = interpolate(f, [0, 40, 80], [1, 1.02, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0e3a52 0%, #2596be 55%, #1b7a9c 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 32,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0, 20),
          transform: `scale(${sc(f, 0, 22, 0.85)})`,
          fontFamily: oswald,
          fontSize: 62,
          fontWeight: 700,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        GREEN WATER ITALIA
      </div>

      <div
        style={{
          width: 100,
          height: 4,
          background: "rgba(255,255,255,0.5)",
          borderRadius: 2,
          opacity: fi(f, 18),
        }}
      />

      <div
        style={{
          opacity: fi(f, 28),
          transform: `translateY(${su(f, 28)}px)`,
          fontFamily: oswald,
          fontSize: 80,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          lineHeight: 1.15,
        }}
      >
        SCOPRI IL TUO
        <br />
        IMPIANTO IDEALE
      </div>

      <div
        style={{
          opacity: fi(f, 48),
          transform: `translateY(${su(f, 48)}px) scale(${pulse})`,
          background: "rgba(255,255,255,0.18)",
          borderRadius: 20,
          padding: "22px 56px",
          fontFamily: inter,
          fontSize: 46,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          border: "2.5px solid rgba(255,255,255,0.35)",
          letterSpacing: "0.02em",
        }}
      >
        greenwateritalia.it
      </div>

      <div
        style={{
          opacity: fi(f, 65),
          fontFamily: inter,
          fontSize: 34,
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
        }}
      >
        Consulenza gratuita · Senza impegno
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

const TRANS_DUR = 15;
const timing = linearTiming({ durationInFrames: TRANS_DUR });

export const WaterReel: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* solutions-that-work.mp3 | bold-statement.mp3 | go-beyond.mp3 */}
      <Audio src={staticFile("solutions-that-work.mp3")} volume={0.28} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={162}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={198}>
          <Scene2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={198}>
          <Scene3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={162}>
          <Scene4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={162}>
          <Scene5 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={93}>
          <Scene6 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
