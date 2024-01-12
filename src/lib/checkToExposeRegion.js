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
  revealedRegions,
) {
  if (regionRevealOrder.length > 0) {
    if (originalBasketType === 'item' && targetBasketType === 'region' && movedItemPoints === 9) {
      // Found a badge in a region so expose a region's point value
      const regionToExpose = regionRevealOrder.shift();
      revealedRegions.unshift(regionToExpose);
    } else if (originalBasketType === 'region' && targetBasketType === 'item' && movedItemPoints === 9) {
      // Unmarked a badge in a region so hide the last exposed region's point value
      const regionToExpose = revealedRegions.shift();
      regionRevealOrder.unshift(regionToExpose);
    }
  }
  return {
    regionRevealOrder,
    revealedRegions,
  }
}

export default checkToExposeRegion;
