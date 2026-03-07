using Starfall.Gems;
using System.Collections.Generic;

namespace Starfall.Gems.GemsGenerators
{
    public interface IBadGemBatchGenerator
    {
        IEnumerable<BadGem> GenerateGems();
    }
}
