import KEY_ITEMS from '../constants/keyItems';
import REGIONS from '../constants/regions';

/**
 * @param {string} spoilerFileText
 */
function extractRegionsFromSpoiler(spoilerFileText) {
  /**
   * @type {{ points: number; id: string; name: string; vanillaRegion: number; }[]}
   */
  let randomizedItems = [];
  const regionPointsArray = REGIONS.map(region => ({ regionId: region.id, name: region.name, points: 0, items: [] }));

  const spoilerLines = spoilerFileText.split('\r\n');
  const rngSeed = spoilerLines.find(line => line.includes('RNG Seed:'))?.replace('RNG Seed: ', '');
  const solutionStartIndex = spoilerLines.findIndex(line => line.includes('Solution:'));
  const solutionEndIndex = spoilerLines.findIndex(line => line.includes('Useless Stuff:'));
  // const modifierStartIndex = spoilerLines.findIndex(line => line.includes('Modifiers:'));
  // const modifierEndIndex = spoilerLines.findIndex(line => line.includes('RNG Seed:'));
  // const modifierLines = spoilerLines.slice(modifierStartIndex, modifierEndIndex).join('').replace(/\s\s/g, ' ');
  const solutionLines = `${spoilerLines.slice(solutionStartIndex, solutionEndIndex).join(';')};`;
  const uselessStuffLines = `${spoilerLines.slice(
    solutionEndIndex,
    spoilerLines.findIndex(line => line.includes('Xtra Stuff:')),
  ).join(';')};`;
  // const upgradeLines = spoilerLines.slice(spoilerLines.findIndex(line => line.includes('Xtra Upgrades:')));

  // const blueCardImportant = modifierLines.includes('Buena Items');
  // const coinCaseImportant = modifierLines.includes('Game Corner');
  // const startWithBike = modifierLines.includes('Start With Bike');

  KEY_ITEMS.forEach(item => {
    /**
     * @type {(number | undefined)[]}
     */
    let matchedRegionIds = [];
    let itemSpoilerLines;

    // Search through solution lines first
    const solutionRegExp = new RegExp(`${item.name}:[^;]+;`, 'g');
    itemSpoilerLines = solutionLines.match(solutionRegExp)?.[0];

    if (itemSpoilerLines) {
      // Extract region from part after colon of solution line
      const [, location] = itemSpoilerLines.split(':');
      matchedRegionIds.push(REGIONS.find(region => (
        region.locations.filter(l => location.toLowerCase().includes(l.toLowerCase())).length > 0 ||
        region.routes.filter(r => location.toLowerCase().includes(`route ${r.toString()} `)).length > 0
      ))?.id);
    }

    // Check if item is also in useless stuff
    const uselessRegExp = new RegExp(`;[^;]+${item.name.replace(' ', '_').toUpperCase()};`, 'g'); // TODO: make this case insensitive
    itemSpoilerLines = uselessStuffLines.match(uselessRegExp);

    if (itemSpoilerLines) {
      for (var i = 0; i < itemSpoilerLines.length; i++) {
        const [location] = itemSpoilerLines[i].split(':');
        matchedRegionIds.push(REGIONS.find(region => (
          region.locations.filter(l => location.toLowerCase().includes(l.toLowerCase())).length > 0 ||
          region.routes.filter(r => location.toLowerCase().includes(`route ${r.toString()} `)).length > 0
        ))?.id);
      }
    }


    // For each matchedRegionId:
    //   - TODO: check if the item needs to be upgraded
    //   - add the item's points to the region's overall value,
    //   - push the item into the region's items array (for the solution)
    //   - push the item into the randomizedItems array (so we know it is placeable)
    const shouldUpgradeItem = false;

    matchedRegionIds.forEach(matchedId => {
      const matchedRPAIndex = regionPointsArray.findIndex(rpa => rpa.regionId === matchedId);
      const addedItem = {
        ...item,
        points: item.points + (shouldUpgradeItem ? 2 : 0),
      };

      regionPointsArray[matchedRPAIndex].points += addedItem.points;

      // @ts-ignore
      regionPointsArray[matchedRPAIndex].items.push(addedItem);

      randomizedItems.push(addedItem);
    });
  });

  return {
    regionPointsArray,
    randomizedItems,
    rngSeed,
  };
}

export default extractRegionsFromSpoiler;
