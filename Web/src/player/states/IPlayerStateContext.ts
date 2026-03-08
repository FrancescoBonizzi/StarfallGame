import { AnimatedSprite } from "pixi.js";
import PlayerAnimations from "../PlayerAnimations.ts";

/**
 * Minimal interface exposed to player states.
 * Avoids circular module dependency between Player ↔ State files.
 */
interface IPlayerStateContext {
  readonly animations: PlayerAnimations;
  readonly position: { readonly x: number; readonly y: number };
  readonly velocity: { x: number; y: number };
  onGround: boolean;
  setCurrentAnimation(anim: AnimatedSprite): void;
}

export default IPlayerStateContext;
