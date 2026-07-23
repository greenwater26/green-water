import "./index.css";
import { Composition } from "remotion";
import { WaterReel } from "./Composition";
import { DetrazioneReel } from "./DetrazioneReel";

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
    </>
  );
};
