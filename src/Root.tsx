import "./index.css";
import { Composition } from "remotion";
import { WwghVideo } from "./Wwgh/WwghVideo";
import { TOTAL_FRAMES } from "./Wwgh/timing";
import { Thumb } from "./Russia/Thumb";
import { StyleLab } from "./StyleLab/StyleLab";
import { PILOT_FRAMES, RussiaPilot } from "./Russia/Pilot";
import { RussiaVideo } from "./Russia/RussiaVideo";
import { Avatar, Banner } from "./Channel/Brand";
import { TOTAL_FRAMES as RUSSIA_FRAMES } from "./Russia/timing";

// Render-only copy of one episode from the private channel repo (free Actions minutes need a public repo).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Wwgh" component={WwghVideo} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Russia" component={RussiaVideo} durationInFrames={RUSSIA_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="RussiaPilot" component={RussiaPilot} durationInFrames={PILOT_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="StyleLab" component={StyleLab} durationInFrames={4} fps={30} width={1920} height={1080} />
    <Composition id="RussiaThumb" component={Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="RussiaThumbB" component={() => <Thumb v="B" />} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="RussiaThumbC" component={() => <Thumb v="C" />} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="ChannelBanner" component={Banner} durationInFrames={1} fps={30} width={2560} height={1440} />
    <Composition id="ChannelAvatarA" component={() => <Avatar v="A" />} durationInFrames={1} fps={30} width={800} height={800} />
    <Composition id="ChannelAvatarB" component={() => <Avatar v="B" />} durationInFrames={1} fps={30} width={800} height={800} />
  </>
);
