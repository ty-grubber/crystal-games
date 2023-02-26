import KEY_ITEMS from '../constants/keyItems';
import REGIONS from '../constants/regions';

/**
 * @param {string} spoilerFileText
 */
function extractRegionsFromSpoiler(spoilerFileText) {
  const regionPointsArray = REGIONS.map(region => ({ regionId: region.id, points: 0, items: [] }));

  const spoilerLines = spoilerFileText.split('\r\n');
  const solutionStartIndex = spoilerLines.findIndex(line => line.includes('Solution:'));
  const solutionEndIndex = spoilerLines.findIndex(line => line.includes('Useless Stuff:'));
  const solutionLines = spoilerLines.slice(solutionStartIndex, solutionEndIndex).join(';');
  const uselessStuffLines = spoilerLines.slice(
    solutionEndIndex,
    spoilerLines.findIndex(line => line.includes('Xtra Stuff:')),
  ).join(';');

  KEY_ITEMS.forEach(item => {
    /**
     * @type {number | undefined}
     */
    let matchedRegionId;
    // Search through solution lines first
    let itemSpoilerLine;
    const solutionRegExp = new RegExp(`${item.name}:[^;]+;`, 'g');

    itemSpoilerLine = solutionLines.match(solutionRegExp)?.[0];

    if (itemSpoilerLine) {
      // Extract region from part after colon of solution line
      const [, location] = itemSpoilerLine.split(':');
      matchedRegionId = REGIONS.find(region => (
        region.locations.filter(l => location.includes(l)).length > 0 ||
        region.routes.filter(r => location.includes(r.toString())).length > 0
      ))?.id;
    } else {
      // Check if item is in useless stuff
      const uselessRegExp = new RegExp(`;[^;]+${item.name.replace(' ', '_').toUpperCase()}`, 'g');
      itemSpoilerLine = uselessStuffLines.match(uselessRegExp)?.[0];

      if (itemSpoilerLine) {
        const [location] = itemSpoilerLine.split(':');
        matchedRegionId = REGIONS.find(region => (
          region.locations.filter(l => location.includes(l)).length > 0 ||
          region.routes.filter(r => location.includes(r.toString())).length > 0
        ))?.id;
      } else {
        // Item is in its vanilla location
        matchedRegionId = item.vanillaRegion;
      }
    }

    const matchedRPAIndex = regionPointsArray.findIndex(rpa => rpa.regionId === matchedRegionId);
    regionPointsArray[matchedRPAIndex].points += item.points;
    // @ts-ignore
    regionPointsArray[matchedRPAIndex].items.push({ id: item.id, name: item.name });
  });

  return regionPointsArray;
}

export default extractRegionsFromSpoiler;
