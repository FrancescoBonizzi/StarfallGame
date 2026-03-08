import {AnimatedSprite, Assets, Spritesheet, Texture} from "pixi.js";
import StarfallAssets from "./StarfallAssets.ts";

const VITE_BASE = import.meta.env.BASE_URL;
export const AssetsRoot: string = `${VITE_BASE}assets`;
const _imagesAssetsRoot: string = `${AssetsRoot}/images`;
const _spriteSheetsAssetsRoot: string = `${_imagesAssetsRoot}/spriteSheets`;
const _fontsAssetsRoot: string = `${AssetsRoot}/fonts`;

export const loadAssets = async (): Promise<StarfallAssets> => {

    const othersSheet = await loadSpriteSheet("others");
    const backgroundsSheet = await loadSpriteSheet("backgrounds");
    const protipsSheet = await loadSpriteSheet("protips");
    const fontName = await loadFont();

    const backgrounds: Texture[] = [
        backgroundsSheet.textures["bg0"]!,
        backgroundsSheet.textures["bg1a"]!,
        backgroundsSheet.textures["bg1b"]!,
        backgroundsSheet.textures["bg1c"]!,
        backgroundsSheet.textures["bg2"]!,
        backgroundsSheet.textures["bg3"]!,
        backgroundsSheet.textures["bg4"]!,
        backgroundsSheet.textures["bg5"]!,
        backgroundsSheet.textures["bg6"]!,
        backgroundsSheet.textures["bg7"]!,
    ];

    return {
        fontName: fontName,
        textures: {
            backgrounds: backgrounds,
            particles: {
                cometParticle: othersSheet.textures["cometParticle"]!,
            },
            glowOmino: othersSheet.textures["glow-omino"]!,
            glowTerraOmino: othersSheet.textures["glow-terra-omino"]!,
            glowBianco: othersSheet.textures["glow-bianco"]!,
            glowRosso: othersSheet.textures["glow-rosso"]!,
            menuBackground: othersSheet.textures["menuBackground"]!,
            gameover: othersSheet.textures["gameover"]!,
            scorebg: othersSheet.textures["scorebg"]!,
            incipitbg: othersSheet.textures["incipitbg"]!,
            manina: othersSheet.textures["manina"]!,
            rewards: {
                oro: othersSheet.textures["rewardOro"]!,
                argento: othersSheet.textures["rewardArgento"]!,
                bronzo: othersSheet.textures["rewardBronzo"]!,
            },
            tips: {
                tip1: protipsSheet.textures["TIP_1"]!,
                tip2: protipsSheet.textures["TIP_2"]!,
                tip3: protipsSheet.textures["TIP_3"]!,
                tip4: protipsSheet.textures["TIP_4"]!,
                glow: protipsSheet.textures["TIPS_glow"]!,
                life: protipsSheet.textures["TIPS_life"]!,
                timejump: protipsSheet.textures["TIPS_timejump"]!,
            },
            gems: {
                goodGlowFrames: othersSheet.animations["goodGlow"]!,
                badGlowFrames: othersSheet.animations["badGlow"]!,
            },
        },
        player: {
            run: new AnimatedSprite(othersSheet.animations["playerRun"]!),
            jump: new AnimatedSprite(othersSheet.animations["playerJump"]!),
            death: new AnimatedSprite(othersSheet.animations["playerDeath"]!),
        }
    };
};

const loadFont = async () => {
    const bundleName = 'fonts';
    const fontName = 'Patrick Hand SC';

    Assets.addBundle(bundleName, [
        { alias: fontName, src: `${_fontsAssetsRoot}/PatrickHandSC-Regular.ttf` }
    ]);

    await Assets.loadBundle(bundleName);
    return fontName;
}

const loadSpriteSheet = async (name: string): Promise<Spritesheet> => {
    const spriteSheet = await Assets.load(`${_spriteSheetsAssetsRoot}/${name}.json`);
    return spriteSheet as Spritesheet;
}
