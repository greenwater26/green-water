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
// Brand azzurro + accento oro/verde ("i soldi che tornano")

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

function counter(frame: number, start: number, end: number, max: number): number {
  return Math.round(
    interpolate(frame, [start, end], [0, max], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    })
  );
}

// Formatta con punto delle migliaia (indipendente dai dati locale ICU)
function euro(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

  const badgeGlow = interpolate(f, [70, 120], [0, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeRot = interpolate(f, [70, 100], [-12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SPRING,
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #06060f 0%, #0c0c20 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 14,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: inter,
          fontSize: 46,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
        }}
      >
        E se ti dicessi che…
      </div>

      <div
        style={{
          opacity: fi(f, 22),
          transform: `translateY(${su(f, 22)}px)`,
          fontFamily: oswald,
          fontSize: 104,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        LO STATO
        <br />
        TI PAGA
      </div>

      <div
        style={{
          opacity: fi(f, 44),
          transform: `translateY(${su(f, 44)}px)`,
          fontFamily: oswald,
          fontSize: 70,
          fontWeight: 700,
          color: BLUE,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        METÀ DEL DEPURATORE?
      </div>

      {/* −50% badge */}
      <div
        style={{
          opacity: fi(f, 70, 20),
          transform: `scale(${sc(f, 70, 22, 0.5)}) rotate(${badgeRot}deg)`,
          position: "relative",
          marginTop: 24,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 560,
            height: 560,
            background: `radial-gradient(circle, rgba(53,208,122,${badgeGlow}) 0%, transparent 65%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontFamily: oswald,
            fontSize: 300,
            fontWeight: 700,
            color: GREEN,
            lineHeight: 1,
            textAlign: "center",
            textShadow: "0 0 100px rgba(53,208,122,0.55)",
            letterSpacing: "-0.04em",
            position: "relative",
          }}
        >
          −50%
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: LA DETRAZIONE ───────────────────────────────────────────────────

const Scene2: React.FC = () => {
  const f = useCurrentFrame();

  // strikethrough draws across €2.000
  const strike = interpolate(f, [70, 95], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SPRING,
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0c0c20 0%, #08131a 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 18,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 54,
          fontWeight: 700,
          color: MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          textAlign: "center",
        }}
      >
        DETRAZIONE FISCALE
      </div>

      <div
        style={{
          opacity: fi(f, 14, 16),
          transform: `scale(${sc(f, 14, 20, 0.7)})`,
          fontFamily: oswald,
          fontSize: 150,
          fontWeight: 700,
          color: GREEN,
          lineHeight: 1,
          textShadow: "0 0 70px rgba(53,208,122,0.45)",
          marginBottom: 20,
        }}
      >
        50%
      </div>

      <Divider opacity={fi(f, 40)} color={GREEN} />

      <div
        style={{
          opacity: fi(f, 48),
          fontFamily: inter,
          fontSize: 40,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
          marginTop: 12,
        }}
      >
        Un impianto da…
      </div>

      {/* €2.000 with animated strikethrough */}
      <div
        style={{
          opacity: fi(f, 55),
          position: "relative",
          display: "inline-block",
        }}
      >
        <div
          style={{
            fontFamily: oswald,
            fontSize: 120,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          €2.000
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            height: 8,
            width: `${strike}%`,
            background: RED,
            borderRadius: 4,
            transform: "translateY(-50%)",
            boxShadow: `0 0 20px ${RED}`,
          }}
        />
      </div>

      <div
        style={{
          opacity: fi(f, 100),
          transform: `translateY(${su(f, 100, 20)}px)`,
          fontFamily: inter,
          fontSize: 40,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
        }}
      >
        in realtà te ne costa
      </div>

      <div
        style={{
          opacity: fi(f, 108, 18),
          transform: `scale(${sc(f, 108, 20, 0.7)})`,
          fontFamily: oswald,
          fontSize: 168,
          fontWeight: 700,
          color: GOLD,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          textShadow: "0 0 90px rgba(255,184,0,0.5)",
        }}
      >
        €1.000
      </div>

      <div
        style={{
          opacity: fi(f, 130),
          fontFamily: inter,
          fontSize: 32,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
          letterSpacing: "0.04em",
        }}
      >
        recuperati in 10 rate annuali IRPEF
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: IL RISPARMIO VERO ───────────────────────────────────────────────

const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const count = counter(f, 45, 115, 1000);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #08131a 0%, #090912 100%)",
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
          fontFamily: oswald,
          fontSize: 60,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        MA IL RISPARMIO
        <br />
        NON FINISCE QUI
      </div>

      <div
        style={{
          opacity: fi(f, 24),
          transform: `translateY(${su(f, 24)}px)`,
          fontFamily: inter,
          fontSize: 42,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
          marginTop: 6,
        }}
      >
        L'acqua in bottiglia ti costa…
      </div>

      {/* Counter */}
      <div style={{ position: "relative", margin: "20px 0", opacity: fi(f, 40) }}>
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
            fontSize: 220,
            fontWeight: 700,
            color: RED,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            textAlign: "center",
            textShadow: "0 0 100px rgba(255,64,64,0.45)",
            position: "relative",
          }}
        >
          €{euro(count)}
        </div>
        <div
          style={{
            fontFamily: inter,
            fontSize: 34,
            fontWeight: 600,
            color: MUTED,
            textAlign: "center",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            opacity: fi(f, 100, 15),
            position: "relative",
          }}
        >
          OGNI ANNO · PER FAMIGLIA
        </div>
      </div>

      <Divider opacity={fi(f, 125)} color={GREEN} />

      <div
        style={{
          opacity: fi(f, 132),
          transform: `translateY(${su(f, 132)}px)`,
          fontFamily: inter,
          fontSize: 42,
          fontWeight: 700,
          color: GREEN,
          textAlign: "center",
        }}
      >
        Con il depuratore: pochi centesimi al litro
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: SI RIPAGA DA SOLO ───────────────────────────────────────────────

const StatCard: React.FC<{
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
      border: `2px solid ${color}45`,
      borderRadius: 28,
      padding: "34px 20px",
      flex: 1,
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontFamily: oswald,
        fontSize: 88,
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
        fontSize: 26,
        fontWeight: 600,
        color: MUTED,
        marginTop: 12,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        lineHeight: 1.2,
      }}
    >
      {label}
    </div>
  </div>
);

const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const barFill = interpolate(f, [95, 140], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SPRING,
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #090912 0%, #061620 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 70px",
        gap: 30,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 72,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          textAlign: "center",
        }}
      >
        SI RIPAGA DA SOLO
      </div>

      <div style={{ display: "flex", gap: 20, width: "100%", marginTop: 4 }}>
        <StatCard frame={f} delay={20} value="50%" label="detrazione fiscale" color={GREEN} />
        <StatCard frame={f} delay={38} value="€1.000" label="risparmio ogni anno" color={GOLD} />
        <StatCard frame={f} delay={56} value="0" label="plastica monouso" color={BLUE} />
      </div>

      {/* payback bar */}
      <div style={{ width: "100%", marginTop: 30, opacity: fi(f, 90) }}>
        <div
          style={{
            fontFamily: inter,
            fontSize: 34,
            fontWeight: 600,
            color: MUTED,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Si ripaga in{" "}
          <span style={{ color: GREEN, fontWeight: 700 }}>2-4 anni</span>
        </div>
        <div
          style={{
            width: "100%",
            height: 22,
            borderRadius: 11,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${barFill}%`,
              height: "100%",
              borderRadius: 11,
              background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`,
              boxShadow: `0 0 24px ${GREEN}80`,
            }}
          />
        </div>
        <div
          style={{
            opacity: fi(f, 145),
            fontFamily: oswald,
            fontSize: 44,
            fontWeight: 700,
            color: GREEN,
            textTransform: "uppercase",
            textAlign: "center",
            marginTop: 18,
            letterSpacing: "0.03em",
          }}
        >
          …poi è tutto guadagnato
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: PERCHÉ GREEN WATER ──────────────────────────────────────────────

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
        background: GREEN,
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
        fontSize: 42,
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

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #061620 0%, #040a0c 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 90px",
        gap: 34,
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
          letterSpacing: "0.05em",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        PERCHÉ GREEN WATER
      </div>

      <Check frame={f} delay={22} text="Qualità certificata" />
      <Check frame={f} delay={42} text="Installazione professionale" />
      <Check frame={f} delay={62} text="Assistenza post-vendita" />
      <Check frame={f} delay={82} text="Consulenza gratuita" />
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
        gap: 30,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0, 20),
          transform: `scale(${sc(f, 0, 22, 0.85)})`,
          fontFamily: oswald,
          fontSize: 60,
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
          fontSize: 74,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          lineHeight: 1.15,
        }}
      >
        RICHIEDI LA
        <br />
        CONSULENZA GRATUITA
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
          color: "rgba(255,255,255,0.75)",
          textAlign: "center",
        }}
      >
        Milano e provincia · Senza impegno
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

const TRANS_DUR = 15;
const timing = linearTiming({ durationInFrames: TRANS_DUR });

export const DetrazioneReel: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* bold-statement.mp3 | go-beyond.mp3 | solutions-that-work.mp3 */}
      <Audio src={staticFile("bold-statement.mp3")} volume={0.28} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={190}>
          <Scene2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={175}>
          <Scene3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={165}>
          <Scene4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene5 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={90}>
          <Scene6 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
