import REGIONS from '../constants/regions';
import { randomTiesSorting, randomizeArray } from './randomize';

/**
 * @param {string} spoilerFileText
 * @param {any[]} keyItems
 */
function extractRegionsFromSpoiler(spoilerFileText, keyItems) {
  /**
   * @type {{ points: number; id: string; name: string; }[]}
   */
  let randomizedItems = [];
  const regionPointsArray = REGIONS.map(region => ({
    regionId: region.id,
    name: region.name,
    description: region.description,
    points: 0,
    items: [],
  }));

  const spoilerLines = spoilerFileText.split('\r\n');
  const rngSeed = spoilerLines.find(line => line.includes('RNG Seed:'))?.replace('RNG Seed: ', '');
  const solutionStartIndex = spoilerLines.findIndex(line => line.includes('Solution:'));
  const solutionEndIndex = spoilerLines.findIndex(line => line.includes('Zephyr Badge:')) + 1;
  const uselessStuffStartIndex = spoilerLines.findIndex(line => line.includes('Useless Stuff:'));
  const modifierStartIndex = spoilerLines.findIndex(line => line.includes('Modifiers:'));
  const modifierEndIndex = spoilerLines.findIndex(line => line.includes('RNG Seed:'));
  const modifierLines = spoilerLines.slice(modifierStartIndex, modifierEndIndex).join('').replace(/\s\s/g, ' ');
  const solutionLines = `${spoilerLines.slice(solutionStartIndex, solutionEndIndex).join(';;')};`;
  const uselessStuffLines = `${spoilerLines.slice(
    uselessStuffStartIndex,
    spoilerLines.findIndex(line => line.includes('Xtra Stuff:')),
  ).join(';;')};`;
  // This is likely not needed anymore but keeping it around just in case
  // const upgradeLines = spoilerLines.slice(spoilerLines.findIndex(line => line.includes('Xtra Upgrades:')));

  keyItems.forEach(item => {
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
    const uselessRegExp = new RegExp(`;[^;]+${item.name.replace(' ', '[\\s_]')};`, 'gi');
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
    //   - check if the item needs to be upgraded (like coin case for game corner checks)
    //   - add the item's points to the region's overall value,
    //   - push the item into the region's items array (for the solution)
    //   - push the item into the randomizedItems array (so we know it is placeable)
    matchedRegionIds.forEach(matchedId => {
      const matchedRPAIndex = regionPointsArray.findIndex(rpa => rpa.regionId === matchedId);
      const shouldUpgradeItem = item.upgradeModifier && modifierLines.includes(item.upgradeModifier);

      const addedItem = {
        ...item,
        points: item.points + (shouldUpgradeItem ? item.upgradeAmt : 0),
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

/**
 * @param {any} spoilerFile
 * @param {any[]} keyItems
 * @param {string} revealOrdering
 */
async function extractPointsInfoFromSpoiler(spoilerFile, keyItems, revealOrdering) {
  const file = spoilerFile;
  if (file != null) {
    const spoilerText = await file.text();

    const extraction = extractRegionsFromSpoiler(spoilerText, keyItems);
    const regionPoints = extraction.regionPointsArray;

    const keyItemPointValues = [
      ...new Set(extraction.randomizedItems.map(item => item.points)),
    ].sort((a, b) => b - a);

    // Make our starting baskets
    const newBaskets = [
      { type: 'region', name: '1', items: []},
      { type: 'region', name: '2', items: []},
      { type: 'region', name: '3', items: []},
      { type: 'region', name: '4', items: []},
      { type: 'region', name: '5', items: []},
      { type: 'region', name: '6', items: []},
      { type: 'region', name: '7', items: []},
      { type: 'region', name: '8', items: []},
      { type: 'region', name: '9', items: []},
      { type: 'region', name: '10', items: []},
      { type: 'region', name: '11', items: []},
      { type: 'region', name: '12', items: []},
      { type: 'region', name: '13', items: []},
      { type: 'region', name: '14', items: []},
      { type: 'region', name: '15', items: []},
      { type: 'region', name: '16', items: []},
    ];

    const itemBaskets = keyItemPointValues.map(pointValue => ({
      type: 'item',
      name: pointValue.toString(),
      items: extraction.randomizedItems.filter(item => item.points === pointValue),
    }));

    // @ts-ignore
    const baskets = newBaskets.concat(itemBaskets);
    let regionsWithTotalPoints = regionPoints.map(region => ({ id: region.regionId, points: region.points }));

    const rngSeed = extraction.rngSeed || file.name;
    switch (revealOrdering) {
      case 'random':
        regionsWithTotalPoints = randomizeArray(regionsWithTotalPoints, rngSeed);
        break;
      default:
        regionsWithTotalPoints = randomTiesSorting(regionsWithTotalPoints, revealOrdering, rngSeed);
    }

    return {
      baskets,
      regionPoints,
      regionRevealOrder: regionsWithTotalPoints.map(r => r.id),
    }
  }
}

export {
  extractRegionsFromSpoiler,
  extractPointsInfoFromSpoiler,
};
