import { Container, Point, Text } from "pixi.js";
import StarfallAssets from "../assets/StarfallAssets.ts";
import StringHelper from "../services/StringHelper.ts";

class HudText {
  private readonly _text: Text;

  constructor(
    container: Container,
    assets: StarfallAssets,
    position: Point,
    anchor: Point,
  ) {
    this._text = new Text({
      style: {
        fontFamily: assets.fontName,
        fontSize: 20,
        fill: { color: "#ffffff" },
      },
    });

    this._text.anchor.set(anchor.x, anchor.y);
    this._text.x = position.x;
    this._text.y = position.y;

    container.addChild(this._text);
    this.updateText("");
  }

  updateText(text: string) {
    if (StringHelper.isNullOrWhitespace(text)) text = "";
    this._text.text = text;
  }
}

export default HudText;
