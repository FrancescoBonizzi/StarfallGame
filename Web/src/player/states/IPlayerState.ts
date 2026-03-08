import { Ticker } from "pixi.js";

interface IPlayerState {
  handleJump(): void;
  update(time: Ticker): IPlayerState;
  enter(): void;
}

export default IPlayerState;
