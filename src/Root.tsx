import "./index.css";
import { Composition } from "remotion";
import { WwghVideo } from "./Wwgh/WwghVideo";
import { TOTAL_FRAMES } from "./Wwgh/timing";

// Render-only copy of one episode from the private channel repo (free Actions minutes need a public repo).
export const RemotionRoot: React.FC = () => (
  <Composition id="Wwgh" component={WwghVideo} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
);
