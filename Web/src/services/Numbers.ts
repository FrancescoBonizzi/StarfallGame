import { Point } from "pixi.js";
import Interval from "../primitives/Interval.ts";

const randomBetween = (min: number, max: number) => {
  if (min === max) return min;

  if (min > max) [min, max] = [max, min];

  return min + Math.random() * (max - min);
};

export default {
  randomBetween: randomBetween,

  randomBetweenInterval: (interval: Interval) => {
    if (interval.min === interval.max) return interval.min;

    if (interval.min > interval.max)
      [interval.min, interval.max] = [interval.max, interval.min];
    return randomBetween(interval.min, interval.max);
  },

  headOrTail: () => {
    return Math.random() > 0.5;
  },

  toRadians: (degrees: number) => {
    return (degrees * Math.PI) / 180;
  },

  /**
   * Linear Interpolation between two values.
   * @param start The start value.
   * @param end The end value.
   * @param t The interpolation factor, typically between 0 and 1.
   * @returns The interpolated value.
   */
  lerp: (start: number, end: number, t: number): number => {
    return start + t * (end - start);
  },

  clamp01: (n: number) => Math.max(0, Math.min(1, n)),

  clamp: (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n)),

  /**
   * Cubic easing out function that decelerates towards the end.
   * @param t The input parameter, typically between 0 and 1.
   * @returns The eased value, starting fast and slowing down.
   */
  easeOutCubic: (t: number) => {
    return 1 - Math.pow(1 - t, 3);
  },

  /**
   * Cubic easing in function that accelerates from the start.
   * @param t
   * @returns The eased value, starting slow and accelerating.
   */
  easeInCubic: (t: number) => {
    return t * t * t;
  },

  addPoints(a: Point, b: Point): Point {
    return new Point(a.x + b.x, a.y + b.y);
  },

  /**
   * Maps Math.sin(x) from [-1,1] to [min,max].
   * Used for gem scale and floating oscillations (ported from C# Numbers.GenerateDeltaOverTimeSin).
   */
  generateDeltaOverTimeSin: (x: number, min: number, max: number): number =>
    min + ((Math.sin(x) + 1) / 2) * (max - min),
};
