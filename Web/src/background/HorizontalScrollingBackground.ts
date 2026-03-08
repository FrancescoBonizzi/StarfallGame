import { Application, Texture, TilingSprite } from "pixi.js";

class HorizontalScrollingBackground {
  private readonly _sprite: TilingSprite;
  private readonly _scrollSpeed: number;

  constructor(texture: Texture, scrollSpeed: number, app: Application) {
    this._scrollSpeed = scrollSpeed;
    this._sprite = new TilingSprite({
      texture,
      width: app.screen.width,
      height: texture.height,
    });
    this._sprite.y = app.screen.height - texture.height;
    app.stage.addChild(this._sprite);
  }

  update(playerVelocityX: number, dt: number) {
    this._sprite.tilePosition.x -= playerVelocityX * dt * this._scrollSpeed;
  }
}

export default HorizontalScrollingBackground;
