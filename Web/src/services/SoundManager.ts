import {Howl} from 'howler';
import {AssetsRoot} from "../assets/AssetsLoader.ts";

class SoundManager {
    private sounds: Record<string, Howl> = {};

    private paths = {
        musicMenu: `${AssetsRoot}/sounds/music/menu.mp3`,
        musicGame: `${AssetsRoot}/sounds/music/running.mp3`,
        musicIncipit: `${AssetsRoot}/sounds/music/slideshow.mp3`,
        takeGem: `${AssetsRoot}/sounds/effects/takegem.mp3`,
        die: `${AssetsRoot}/sounds/effects/die.mp3`,
    };

    constructor() {
        Howler.autoUnlock = true;
        this.preload();
    }

    private preload() {
        this.sounds["musicMenu"] = new Howl({src: [this.paths.musicMenu], loop: true, volume: 0.4});
        this.sounds["musicGame"] = new Howl({src: [this.paths.musicGame], loop: true, volume: 0.4});
        this.sounds["musicIncipit"] = new Howl({src: [this.paths.musicIncipit], loop: true, volume: 0.4});
        this.sounds["takeGem"] = new Howl({src: [this.paths.takeGem]});
        this.sounds["die"] = new Howl({src: [this.paths.die]});
    }

    playMenuSoundTrack() {
        if (this.sounds["musicMenu"]!.playing())
            return;

        this.stopAllMusic();
        this.sounds["musicMenu"]!.play();
    }

    playGameSoundTrack() {
        this.stopAllMusic();
        this.sounds["musicGame"]!.play();
    }

    playIncipitSoundTrack() {
        if (this.sounds["musicIncipit"]!.playing())
            return;

        this.stopAllMusic();
        this.sounds["musicIncipit"]!.play();
    }

    private stopAllMusic() {
        this.sounds["musicMenu"]!.stop();
        this.sounds["musicGame"]!.stop();
        this.sounds["musicIncipit"]!.stop();
    }

    playTakeGem() {
        this.sounds["takeGem"]!.play();
    }

    playDie() {
        this.sounds["die"]!.play();
    }
}

export default SoundManager;
