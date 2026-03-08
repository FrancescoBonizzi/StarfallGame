import { Application, Texture, TilingSprite } from "pixi.js";

class FillBackground {
  constructor(texture: Texture, app: Application) {
    const sprite = new TilingSprite({
      texture,
      width: app.screen.width,
      height: app.screen.height,
    });
    app.stage.addChild(sprite);
  }
}

export default FillBackground;
