import { Texture } from "pixi.js";
import PlayerAnimations from "../player/PlayerAnimations.ts";

interface StarfallAssets {
  fontName: string;
  textures: {
    backgrounds: Texture[];
    particles: {
      cometParticle: Texture;
    };
    glowOmino: Texture;
    glowTerraOmino: Texture;
    glowBianco: Texture;
    glowRosso: Texture;
    menuBackground: Texture;
    gameover: Texture;
    scorebg: Texture;
    incipitbg: Texture;
    manina: Texture;
    rewards: {
      oro: Texture;
      argento: Texture;
      bronzo: Texture;
    };
    tips: {
      tip1: Texture;
      tip2: Texture;
      tip3: Texture;
      tip4: Texture;
      glow: Texture;
      life: Texture;
      timejump: Texture;
    };
    gems: {
      goodGlowFrames: Texture[];
      badGlowFrames: Texture[];
    };
  };
  player: PlayerAnimations;
}

export default StarfallAssets;
