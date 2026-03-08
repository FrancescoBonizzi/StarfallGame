import BadGem from "../BadGem.ts";

interface IBadGemBatchGenerator {
  generateGems(gemVelocityX: number): BadGem[];
}

export default IBadGemBatchGenerator;
