import "./index.css";
import { Composition } from "remotion";
import { WaterReel } from "./Composition";
import { DetrazioneReel } from "./DetrazioneReel";
import { FiltrazioneReel } from "./FiltrazioneReel";
import { PfasReel } from "./PfasReel";
import { PfasReelV2, PFAS_V2_DURATION } from "./PfasReelV2";
import { CittaReel, CITTA_DURATION } from "./CittaReel";
import { CloroReel, CLORO_DURATION } from "./CloroReel";
import { CloroSpot, CLORO_SPOT_DURATION } from "./CloroSpot";
import { ResiduoSpot, RESIDUO_SPOT_DURATION } from "./ResiduoSpot";
import { FiltriSpot, FILTRI_SPOT_DURATION } from "./FiltriSpot";
import { SofiaSplitTest, SOFIA_SPLIT_TEST_DURATION } from "./SofiaSplitTest";
import { BollicinaSpot, BOLLICINA_SPOT_DURATION } from "./BollicinaSpot";
import { BollicinaReel, BOLLICINA_REEL_DURATION } from "./BollicinaReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WaterReel"
        component={WaterReel}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DetrazioneReel"
        component={DetrazioneReel}
        durationInFrames={825}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="FiltrazioneReel"
        component={FiltrazioneReel}
        durationInFrames={915}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PfasReel"
        component={PfasReel}
        durationInFrames={1510}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PfasReelV2"
        component={PfasReelV2}
        durationInFrames={PFAS_V2_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CittaReel"
        component={CittaReel}
        durationInFrames={CITTA_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CloroReel"
        component={CloroReel}
        durationInFrames={CLORO_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="SofiaSplitTest"
        component={SofiaSplitTest}
        durationInFrames={SOFIA_SPLIT_TEST_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="FiltriSpot"
        component={FiltriSpot}
        durationInFrames={FILTRI_SPOT_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ResiduoSpot"
        component={ResiduoSpot}
        durationInFrames={RESIDUO_SPOT_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CloroSpot"
        component={CloroSpot}
        durationInFrames={CLORO_SPOT_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BollicinaSpot"
        component={BollicinaSpot}
        durationInFrames={BOLLICINA_SPOT_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BollicinaReel"
        component={BollicinaReel}
        durationInFrames={BOLLICINA_REEL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
