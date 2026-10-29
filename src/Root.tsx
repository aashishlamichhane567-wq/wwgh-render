import "./index.css";
import { Composition } from "remotion";
import { WwghVideo } from "./Wwgh/WwghVideo";
import { TOTAL_FRAMES } from "./Wwgh/timing";
import { Thumb } from "./Russia/Thumb";
import { RussiaVideo } from "./Russia/RussiaVideo";
import { TOTAL_FRAMES as RUSSIA_FRAMES } from "./Russia/timing";

// Render-only copy of one episode from the private channel repo (free Actions minutes need a public repo).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Wwgh" component={WwghVideo} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Russia" component={RussiaVideo} durationInFrames={RUSSIA_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="RussiaThumb" component={Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
  </>
);
