import GoodGem from "../GoodGem.ts";

interface IGoodGemBatchGenerator {
  generateGems(gemVelocityX: number): GoodGem[];
}

export default IGoodGemBatchGenerator;
