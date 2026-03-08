import StarfallAssets from "../assets/StarfallAssets.ts";
import Camera from "../world/Camera.ts";
import ParticleSystem from "./ParticleSystem.ts";

/**
 * Particle trail emitted behind the player while running/jumping.
 * Parameters translated 1:1 from CSharp/Starfall/Players/CometParticleSystem.cs.
 */
class CometParticleSystem extends ParticleSystem {
  constructor(assets: StarfallAssets, camera: Camera) {
    super(
      assets.textures.particles.cometParticle,
      camera,
      5,
      { min: 5, max: 8 }, // numParticles
      { min: 80, max: 100 }, // speed (px/s)
      { min: 30, max: 50 }, // acceleration (px/s²)
      { min: -Math.PI, max: Math.PI }, // rotationSpeed (rad/s)
      { min: 0.6, max: 0.9 }, // lifetimeSeconds
      { min: 0.1, max: 0.7 }, // scale
      { min: -45, max: 235 }, // spawnAngleDegrees
      "add", // blendMode
      false, // randomizedSpawnAngle
      null, // perspectiveEffect
    );
  }
}

export default CometParticleSystem;
