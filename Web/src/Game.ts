import { Application, Ticker } from "pixi.js";
import StarfallAssets from "./assets/StarfallAssets.ts";
import SoundManager from "./services/SoundManager.ts";

export default class Game {
    constructor(_assets: StarfallAssets, _app: Application, _sound: SoundManager) {}
    update(_time: Ticker): void {}
}
