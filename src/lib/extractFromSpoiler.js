import REGIONS from '../constants/regions';
import { randomTiesSorting, randomizeArray } from './randomize';

/**
 * @param {string} spoilerFileText
 * @param {any[]} keyItems
 */
function extractRegionsFromSpoiler(spoilerFileText, keyItems) {
  // Use the spoiler log to determine which randomizer we're dealing with
  let spoilerLines = spoilerFileText.split('\r\n');
  // Check if spoiler was generated without carriage return.
  // There should be hundreds of spoiler lines...but only one if the carriage return is missing on each line
  // Let's be safe in case some are mixed in somehow
  if (spoilerLines.length < keyItems.length) {
    spoilerLines = spoilerFileText.split('\n');
  }

  if (spoilerLines.find(line => line.includes('Seed:')) && spoilerLines.find(line => line.includes('CV:'))) {
    // TODO: switch to Kovolta randomizer
    return extractRegionsFromKovoltaSpoiler(spoilerLines, keyItems);
  } else {
    return extractRegionsFromSpeedchoiceSpoiler(spoilerLines, keyItems);
  }
}

/**
 * @param {string[]} spoilerLines
 * @param {any[]} keyItems
 */
function extractRegionsFromKovoltaSpoiler(spoilerLines, keyItems) {
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

  const rngSeed = spoilerLines.find(line => line.includes('Seed:'))?.replace('Seed: ', '');

  // Items are all caps and we need to find the line where the item does not have a : after it
  // When matching, make sure the line is after the ----- ITEM LOCATIONS -----
    // This is where we should the start index for the itemLocations lines
  // Something like: new RegExp(`${item.name.replace('_', '').toUpperCase()}(?!:)`);
  // Note: item above is the key item constant
  // Note: only badges remove the space?
  // Exceptions: Badges, TMs, and HMs (which match item.id not item.name),
    // So, we could check item.id if we can't find it in item.name, or we could add a property to the constant to indicate the field to check (better, because we do badges with it)

  // And remember that we need to match multiple items in log (ex. Water Stone, TM08)

  // Need to verify that if an item is not randomized (ex. GS Ball), that it doesn't appear in the log

  // If Item is not in a shop, we can just use the line it is found on for its location. Location is at start of line
  // If Item is in shop, we need to check the line it is found on for its location, which would be at start of line
  //     If first character found is a | on the line (after trimming), we need to try the previous line and repeat check
  //        Can we get the index of the line in the array when we use the regex to match above?

  // We need to find the modifiers in the SETTINGS section that trigger certain key items to increase in value
    // Alternatively, we might just have to look for specific ITEM_LOCATION strings
      // Ex: (LAKE_OF_RAGE_MAGIKARP_HOUSE_MANS_GIFT_FOR_MAGIKARP, BILLS_HOUSE_BILLS_GRANDPAS_GIFT_FOR_LICKITUNG)
  // Name -> Speedchoice Modifier -> Kovolta Modifier
  // Pokedex -> Mon Locked Checks -> Need to check with Kovolta how to know if this is on
  // Bicycle -> Hidden Items
  //    Two Options for Kovolta:
  //      -> Look directly for RANDOMIZE_REGULAR_HIDDEN_ITEMS. If next line is VALUE: true, then true
  //      -> Look directly for - REGULAR_HIDDEN_ITEMS. If exists, then true
  // Bicycle -> Start With Bike (which removes it from spoiler log) -> START_WITH_ITEMS ==\n+==> KEY_ITEMS ==\n+==> BICYCLE
  // Blue Card -> Buena Items -> Need to check with Kovolta how to know if this is on
  // Coin Case -> Game Corner -> Need to check with Kovolta how to know if this is on
  // TM12 -> Mon Locked Checks -> See Pokedex above

  // All locations use _ instead spaces. So we need to check ROUTE_42 not ROUTE 42
  // We might be able to mostly re-use the regions.js constant, but we could do some inline hacks instead of making a new set of constants
    // Ex. Region 12 needs to add DRAGON_SHRINE_BADGE
    // But we also have PLAYERS_HOUSE and MR_POKEMONS_HOUSE (instead of Mr. Pokemon), so it might just be better to do a fresh constant (using the existing one as a base)

  return {
    randomizedItems,
    regionPointsArray,
    rngSeed,
  }
}

/**
 * @param {string[]} spoilerLines
 * @param {any[]} keyItems
 */
function extractRegionsFromSpeedchoiceSpoiler(spoilerLines, keyItems) {
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

  const rngSeed = spoilerLines.find(line => line.includes('RNG Seed:'))?.replace('RNG Seed: ', '');
  const solutionStartIndex = spoilerLines.findIndex(line => line.includes('Solution:'));
  const solutionEndIndex = spoilerLines.findIndex(line => line.includes('Zephyr Badge:')) + 1;
  const uselessStuffStartIndex = spoilerLines.findIndex(line => line.includes('Useless Stuff:'));
  const modifierStartIndex = spoilerLines.findIndex(line => line.includes('Modifiers:'));
  const modifierEndIndex = spoilerLines.findIndex(line => line.includes('RNG Seed:'));
  const modifierLines = spoilerLines
    .slice(modifierStartIndex, modifierEndIndex)
    .join('')
    .replace(/\s\s/g, ' ');
  const solutionLines = `${spoilerLines.slice(solutionStartIndex, solutionEndIndex).join(';;')};`;
  const uselessStuffLines = `${spoilerLines
    .slice(
      uselessStuffStartIndex,
      spoilerLines.findIndex(line => line.includes('Xtra Stuff:'))
    )
    .join(';;')};`;
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
      matchedRegionIds.push(
        REGIONS.find(
          region =>
            region.locations.filter(l => location.toLowerCase().includes(l.toLowerCase())).length >
              0 ||
            region.routes.filter(r => location.toLowerCase().includes(`route ${r.toString()} `))
              .length > 0
        )?.id
      );
    }

    // Check if item is also in useless stuff
    const uselessRegExp = new RegExp(`;[^;]+${item.name.replace(' ', '[\\s_]')};`, 'gi');
    itemSpoilerLines = uselessStuffLines.match(uselessRegExp);

    if (itemSpoilerLines) {
      for (var i = 0; i < itemSpoilerLines.length; i++) {
        const [location] = itemSpoilerLines[i].split(':');
        matchedRegionIds.push(
          REGIONS.find(
            region =>
              region.locations.filter(l => location.toLowerCase().includes(l.toLowerCase()))
                .length > 0 ||
              region.routes.filter(r => location.toLowerCase().includes(`route ${r.toString()} `))
                .length > 0
          )?.id
        );
      }
    }

    // For each matchedRegionId:
    //   - check if the item needs to be upgraded (like coin case for game corner checks)
    //   - add the item's points to the region's overall value,
    //   - push the item into the region's items array (for the solution)
    //   - push the item into the randomizedItems array (so we know it is placeable)
    matchedRegionIds.forEach(matchedId => {
      const matchedRPAIndex = regionPointsArray.findIndex(rpa => rpa.regionId === matchedId);
      const shouldUpgradeItem =
        item.upgradeModifier && modifierLines.includes(item.upgradeModifier);

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
 * @returns {Promise<{ baskets: import('../types/PointTracker').Basket[]; regionPoints: import('../types/PointTracker').Region[]; regionRevealOrder: number[]; }|undefined>}
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
      { type: 'region', name: '1', items: [] },
      { type: 'region', name: '2', items: [] },
      { type: 'region', name: '3', items: [] },
      { type: 'region', name: '4', items: [] },
      { type: 'region', name: '5', items: [] },
      { type: 'region', name: '6', items: [] },
      { type: 'region', name: '7', items: [] },
      { type: 'region', name: '8', items: [] },
      { type: 'region', name: '9', items: [] },
      { type: 'region', name: '10', items: [] },
      { type: 'region', name: '11', items: [] },
      { type: 'region', name: '12', items: [] },
      { type: 'region', name: '13', items: [] },
      { type: 'region', name: '14', items: [] },
      { type: 'region', name: '15', items: [] },
      { type: 'region', name: '16', items: [] },
    ];

    const itemBaskets = keyItemPointValues.map(pointValue => ({
      type: 'item',
      name: pointValue.toString(),
      items: extraction.randomizedItems.filter(item => item.points === pointValue),
    }));

    // @ts-ignore
    const baskets = newBaskets.concat(itemBaskets);
    let regionsWithTotalPoints = regionPoints.map(region => ({
      id: region.regionId,
      points: region.points,
    }));

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
    };
  }
}

export { extractRegionsFromSpoiler, extractPointsInfoFromSpoiler };
