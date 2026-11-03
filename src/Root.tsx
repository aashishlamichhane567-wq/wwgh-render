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
import { DiscVideo } from "./Disc/DiscVideo";
import { TOTAL_FRAMES as DISC_FRAMES } from "./Disc/timing";
import { DiscThumb } from "./Disc/Thumb";
import { SlideVideo } from "./Slide/SlideVideo";
import { TOTAL_FRAMES as SLIDE_FRAMES } from "./Slide/timing";
import { FaithVideo } from "./Faith/FaithVideo";
import { AttnVideo } from "./Attn/AttnVideo";
import { TOTAL_FRAMES as ATTN_FRAMES } from "./Attn/timing";
import { AttnToon } from "./AttnToon/AttnToon";
import { TOTAL_FRAMES as ATTN_TOON_FRAMES } from "./AttnToon/timing";
import { AttnThumb } from "./AttnThumb/AttnThumb";
import { TOTAL_FRAMES as ATTN_THUMB_FRAMES } from "./AttnThumb/timing";
import { AttnHybrid } from "./AttnHybrid/AttnHybrid";
import { TOTAL_FRAMES as FAITH_FRAMES } from "./Faith/timing";

// Render-only copy of one episode from the private channel repo (free Actions minutes need a public repo).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Wwgh" component={WwghVideo} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Russia" component={RussiaVideo} durationInFrames={RUSSIA_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Disc" component={DiscVideo} durationInFrames={DISC_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Slide" component={SlideVideo} durationInFrames={SLIDE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Attn" component={AttnVideo} durationInFrames={ATTN_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="AttnToon" component={AttnToon} durationInFrames={ATTN_TOON_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="AttnThumb" component={AttnThumb} durationInFrames={ATTN_THUMB_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="AttnHybrid" component={AttnHybrid} durationInFrames={ATTN_TOON_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Faith" component={FaithVideo} durationInFrames={FAITH_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="RussiaPilot" component={RussiaPilot} durationInFrames={PILOT_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="StyleLab" component={StyleLab} durationInFrames={4} fps={30} width={1920} height={1080} />
    <Composition id="RussiaThumb" component={Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="RussiaThumbB" component={() => <Thumb v="B" />} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="RussiaThumbC" component={() => <Thumb v="C" />} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="RussiaThumbD" component={() => <Thumb v="D" />} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="RussiaThumbE" component={() => <Thumb v="E" />} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="RussiaThumbF" component={() => <Thumb v="F" />} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="DiscThumbA" component={() => <DiscThumb v="A" />} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="DiscThumbB" component={() => <DiscThumb v="B" />} durationInFrames={1} fps={30} width={1280} height={720} />
    <Composition id="ChannelBanner" component={Banner} durationInFrames={1} fps={30} width={2560} height={1440} />
    <Composition id="ChannelAvatarA" component={() => <Avatar v="A" />} durationInFrames={1} fps={30} width={800} height={800} />
    <Composition id="ChannelAvatarB" component={() => <Avatar v="B" />} durationInFrames={1} fps={30} width={800} height={800} />
  </>
);
