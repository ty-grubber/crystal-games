import KEY_ITEMS, { BLUE_CARD_KEY_ITEM, COIN_CASE_KEY_ITEM } from '../constants/keyItems';
import REGIONS from '../constants/regions';

/**
 * @param {string} spoilerFileText
 */
function extractRegionsFromSpoiler(spoilerFileText) {
  /**
   * @type {{ id: string; name: string; points: number; vanillaRegion: number; }[]}
   */
  let extraItems = [];
  const regionPointsArray = REGIONS.map(region => ({ regionId: region.id, name: region.name, points: 0, items: [] }));

  const spoilerLines = spoilerFileText.split('\r\n');
  const solutionStartIndex = spoilerLines.findIndex(line => line.includes('Solution:'));
  const solutionEndIndex = spoilerLines.findIndex(line => line.includes('Useless Stuff:'));
  const modifierStartIndex = spoilerLines.findIndex(line => line.includes('Modifiers:'));
  const modifierEndIndex = spoilerLines.findIndex(line => line.includes('RNG Seed:'));
  const modifierLines = `${spoilerLines.slice(modifierStartIndex, modifierEndIndex).join('')}`;
  const solutionLines = `${spoilerLines.slice(solutionStartIndex, solutionEndIndex).join(';')};`;
  const uselessStuffLines = `${spoilerLines.slice(
    solutionEndIndex,
    spoilerLines.findIndex(line => line.includes('Xtra Stuff:')),
  ).join(';')};`;

  const blueCardImportant = modifierLines.includes('Buena Items');
  const coinCaseImportant = modifierLines.includes('Game Corner');

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
        region.locations.filter(l => location.includes(l)).length > 0 ||
        region.routes.filter(r => location.includes(`Route ${r.toString()} `)).length > 0
      ))?.id);
    }

    // Check if item is also in useless stuff
    const uselessRegExp = new RegExp(`;[^;]+${item.name.replace(' ', '_').toUpperCase()};`, 'g');
    itemSpoilerLines = uselessStuffLines.match(uselessRegExp);

    if (itemSpoilerLines) {
      for (var i = 0; i < itemSpoilerLines.length; i++) {
        const [location] = itemSpoilerLines[i].split(':');
        matchedRegionIds.push(REGIONS.find(region => (
          region.locations.filter(l => location.includes(l)).length > 0 ||
          region.routes.filter(r => location.includes(`Route ${r.toString()} `)).length > 0
        ))?.id);
      }

      // If we have duplicate key items, make sure we note extra ones
      for (var j = 1; j < matchedRegionIds.length; j++) {
        extraItems.push(item);
      }
    }

    if (matchedRegionIds.length === 0) {
      // Item is in its vanilla location
      matchedRegionIds.push(item.vanillaRegion);
    }

    // Prep for dumping the item into its region by checking if we need to upgrade it
    const shouldUpgradeBlueCard = item.name === BLUE_CARD_KEY_ITEM.name && blueCardImportant;
    const shouldUpgradeCoinCase = item.name === COIN_CASE_KEY_ITEM.name && coinCaseImportant;
    const shouldUpgradeItem = shouldUpgradeBlueCard || shouldUpgradeCoinCase;

    matchedRegionIds.forEach(matchedId => {
      const matchedRPAIndex = regionPointsArray.findIndex(rpa => rpa.regionId === matchedId);
      regionPointsArray[matchedRPAIndex].points += item.points + (shouldUpgradeItem ? 2 : 0);

      regionPointsArray[matchedRPAIndex].items.push(
        // @ts-ignore
        { id: item.id, name: item.name, points: item.points + (shouldUpgradeItem ? 2 : 0) },
      );
    });
  });

  return {
    regionPointsArray,
    extraItems,
    blueCardImportant,
    coinCaseImportant,
  };
}

export default extractRegionsFromSpoiler;
