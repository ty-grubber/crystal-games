import REGIONS from '../constants/regions';

/**
 * @param {string} originalBasketType
 * @param {string} targetBasketType
 * @param {number} movedItemPoints
 * @param {any[]} regionRevealOrder
 * @param {any[]} revealedRegions
 */
function checkToExposeRegion(
  originalBasketType,
  targetBasketType,
  movedItemPoints,
  regionRevealOrder,
  revealedRegions
) {
  if (movedItemPoints === 9) {
    if (regionRevealOrder.length > 0 && originalBasketType === 'item' && targetBasketType === 'region') {
      // Found a badge in a region so expose a region's point value
      const regionToExpose = regionRevealOrder.shift();
      revealedRegions.unshift(regionToExpose);
    } else if (revealedRegions.length > 0 && originalBasketType === 'region' && targetBasketType === 'item') {
      // Unmarked a badge in a region so hide the last exposed region's point value
      const regionToExpose = revealedRegions.shift();
      regionRevealOrder.unshift(regionToExpose);
    }
  }
  return {
    regionRevealOrder,
    revealedRegions,
  };
}

export default checkToExposeRegion;
