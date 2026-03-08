import { Container, Point } from "pixi.js";
import StarfallAssets from "../assets/StarfallAssets.ts";
import HudText from "./HudText.ts";

class ScoreText extends HudText {
  constructor(container: Container, assets: StarfallAssets, position: Point) {
    super(container, assets, position, new Point(1, 0.5));
  }

  updateScore(score: number) {
    this.updateText(`Punteggio: ${score}`);
  }
}

export default ScoreText;
