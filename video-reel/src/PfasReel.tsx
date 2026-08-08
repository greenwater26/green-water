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

const RegionBar: React.FC<{
  frame: number;
  delay: number;
  region: string;
  status: string;
  pct: number;
  color: string;
}> = ({ frame, delay, region, status, pct, color }) => {
  const fill = interpolate(frame, [delay, delay + 26], [0, pct], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  });

  return (
    <div style={{ opacity: fi(frame, delay), width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: inter,
            fontSize: 22,
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          {region}
        </span>
        <span
          style={{
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 700,
            color,
          }}
        >
          {status}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 22,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 11,
        }}
      >
        <div
          style={{
            width: `${fill}%`,
            height: 22,
            background: color,
            borderRadius: 11,
          }}
        />
      </div>
    </div>
  );
};

const RiskItem: React.FC<{ text: string; delay: number; frame: number }> = ({
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
      gap: 20,
      width: "100%",
    }}
  >
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: RED,
        boxShadow: `0 0 14px ${RED}`,
        flexShrink: 0,
      }}
    />
    <div
      style={{
        fontFamily: inter,
        fontSize: 32,
        fontWeight: 600,
        color: "#ffffff",
      }}
    >
      {text}
    </div>
  </div>
);

const TechRow: React.FC<{
  tech: string;
  pct: string;
  color: string;
  note?: string;
  delay: number;
  frame: number;
}> = ({ tech, pct, color, note, delay, frame }) => (
  <div
    style={{
      opacity: fi(frame, delay),
      transform: `translateY(${su(frame, delay, 20)}px)`,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      width: "100%",
      background: "rgba(255,255,255,0.05)",
      border: `1.5px solid ${color}66`,
      borderRadius: 18,
      padding: "18px 24px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: inter,
          fontSize: 28,
          fontWeight: 600,
          color: "#ffffff",
        }}
      >
        {tech}
      </span>
      <span
        style={{
          fontFamily: oswald,
          fontSize: 36,
          fontWeight: 700,
          color,
        }}
      >
        {pct}
      </span>
    </div>
    {note && (
      <div
        style={{
          fontFamily: inter,
          fontSize: 18,
          fontWeight: 500,
          color: MUTED,
        }}
      >
        {note}
      </div>
    )}
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

// ─── Scene 3: DOVE SI TROVANO ──────────────────────────────────────────────────

const Scene3: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #150a1c 0%, #0c0f1c 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 70px",
        gap: 20,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 50,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        DOVE SI TROVANO IN ITALIA
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: "100%",
        }}
      >
        <RegionBar
          frame={f}
          delay={30}
          region="Veneto (PFAS Valley)"
          status="Criticità elevata"
          pct={95}
          color={RED}
        />
        <RegionBar
          frame={f}
          delay={58}
          region="Piemonte (aree TO/AL)"
          status="Moderata"
          pct={45}
          color={GOLD}
        />
        <RegionBar
          frame={f}
          delay={86}
          region="Lombardia (basi AFFF)"
          status="Localizzata"
          pct={30}
          color={GOLD}
        />
        <RegionBar
          frame={f}
          delay={114}
          region="Resto d'Italia"
          status="Sotto i limiti EU"
          pct={15}
          color={GREEN}
        />
      </div>

      <div
        style={{
          opacity: fi(f, 128),
          fontFamily: inter,
          fontSize: 18,
          fontWeight: 500,
          color: MUTED,
          textAlign: "center",
          marginTop: 10,
        }}
      >
        Dati ISPRA 2023 / ISS
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: RISCHI PER LA SALUTE ─────────────────────────────────────────────

const Scene4: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0c0f1c 0%, #1c0c14 100%)",
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
          fontSize: 58,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "center",
        }}
      >
        RISCHI PER LA SALUTE
      </div>

      <div
        style={{
          opacity: fi(f, 16),
          transform: `translateY(${su(f, 16)}px)`,
          fontFamily: inter,
          fontSize: 30,
          fontWeight: 700,
          color: RED,
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        I PFAS passano nel latte materno.
      </div>

      <Divider opacity={fi(f, 30)} color={RED} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          width: "100%",
          marginTop: 6,
        }}
      >
        <RiskItem
          frame={f}
          delay={44}
          text="Riduzione risposta immunitaria ai vaccini"
        />
        <RiskItem
          frame={f}
          delay={64}
          text="Alterazioni dello sviluppo tiroideo"
        />
        <RiskItem
          frame={f}
          delay={84}
          text="Rischio tumori renali e testicolari (PFOA)"
        />
        <RiskItem frame={f} delay={104} text="Complicanze in gravidanza" />
      </div>

      <div
        style={{
          opacity: fi(f, 128),
          transform: `translateY(${su(f, 128)}px)`,
          fontFamily: inter,
          fontSize: 34,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          marginTop: 10,
        }}
      >
        I bambini sono i più esposti.
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: NUOVI LIMITI EU ──────────────────────────────────────────────────

const Scene5: React.FC = () => {
  const f = useCurrentFrame();

  const limit1 = interpolate(f, [46, 84], [0, 0.01], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  });

  const limit2 = interpolate(f, [96, 128], [0, 0.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1c0c14 0%, #0a1420 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 80px",
        gap: 16,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 56,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "center",
        }}
      >
        NUOVI LIMITI EU
      </div>

      <div
        style={{
          opacity: fi(f, 16),
          fontFamily: inter,
          fontSize: 26,
          fontWeight: 600,
          color: MUTED,
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        D.Lgs. 18/2023 — in vigore dal 2026
      </div>

      <Divider opacity={fi(f, 30)} />

      <div style={{ opacity: fi(f, 40), textAlign: "center", marginTop: 4 }}>
        <div
          style={{
            fontFamily: inter,
            fontSize: 22,
            fontWeight: 600,
            color: MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 4,
          }}
        >
          Per ogni singolo PFAS
        </div>
        <div
          style={{
            fontFamily: oswald,
            fontSize: 84,
            fontWeight: 700,
            color: BLUE,
            lineHeight: 1,
            textShadow: "0 0 60px rgba(37,150,190,0.5)",
          }}
        >
          {limit1.toFixed(2)} <span style={{ fontSize: 38 }}>µg/L</span>
        </div>
      </div>

      <div style={{ opacity: fi(f, 90), textAlign: "center", marginTop: 14 }}>
        <div
          style={{
            fontFamily: inter,
            fontSize: 22,
            fontWeight: 600,
            color: MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 4,
          }}
        >
          Somma di 20 PFAS
        </div>
        <div
          style={{
            fontFamily: oswald,
            fontSize: 84,
            fontWeight: 700,
            color: BLUE,
            lineHeight: 1,
            textShadow: "0 0 60px rgba(37,150,190,0.5)",
          }}
        >
          {limit2.toFixed(2)} <span style={{ fontSize: 38 }}>µg/L</span>
        </div>
      </div>

      <div
        style={{
          opacity: fi(f, 132, 15),
          transform: `scale(${sc(f, 132, 15, 0.6)})`,
          fontFamily: oswald,
          fontSize: 42,
          fontWeight: 700,
          color: GOLD,
          textAlign: "center",
          marginTop: 14,
          textShadow: "0 0 50px rgba(255,184,0,0.5)",
        }}
      >
        TRA I PIÙ SEVERI AL MONDO
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 6: COSA FUNZIONA DAVVERO ────────────────────────────────────────────

const Scene6: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a1420 0%, #061620 100%)",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 60px",
        gap: 18,
      }}
    >
      <div
        style={{
          opacity: fi(f, 0),
          transform: `translateY(${su(f, 0)}px)`,
          fontFamily: oswald,
          fontSize: 52,
          fontWeight: 700,
          color: "#ffffff",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        COSA FUNZIONA DAVVERO
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
        }}
      >
        <TechRow
          frame={f}
          delay={30}
          tech="Osmosi inversa"
          pct=">95%"
          color={GREEN}
        />
        <TechRow
          frame={f}
          delay={60}
          tech="Carbone attivo granulare"
          pct="70-90%"
          color={GOLD}
        />
        <TechRow
          frame={f}
          delay={90}
          tech="Filtro a brocca"
          pct="30-50%"
          color={GOLD}
        />
        <TechRow
          frame={f}
          delay={120}
          tech="Bollitura"
          pct="0%"
          color={RED}
          note="Concentra i PFAS, non li elimina"
        />
      </div>

      <div
        style={{
          opacity: fi(f, 155),
          transform: `translateY(${su(f, 155)}px)`,
          fontFamily: inter,
          fontSize: 30,
          fontWeight: 700,
          color: GREEN,
          textAlign: "center",
          marginTop: 12,
        }}
      >
        Solo l'osmosi inversa è affidabile su tutti i PFAS.
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
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene5 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene6 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
