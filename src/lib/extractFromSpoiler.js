import REGIONS, { KOVOLTA_REGIONS } from '../constants/regions';
import { randomTiesSorting, randomizeArray } from './randomize';

/**
 * @param {string} spoilerFileText
 * @param {import("../types/PointTracker").KeyItem[]} keyItems
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
    return extractRegionsFromKovoltaSpoiler(spoilerLines, keyItems);
  } else {
    return extractRegionsFromSpeedchoiceSpoiler(spoilerLines, keyItems);
  }
}

/**
 * @param {string[]} spoilerLines
 * @param {import("../types/PointTracker").KeyItem[]} keyItems
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

  const locationsStartIndex = spoilerLines.findIndex(line => line.includes('----- ITEM LOCATIONS -----'));
  const locationsEndIndex = spoilerLines.findIndex(line => line.includes('----- OTHER -----'));
  const locationLines = spoilerLines.slice(locationsStartIndex, locationsEndIndex);

  const keyItemMatches = [];

  // Generate an array of exact strings for each key item that needs to be found in the location spoiler
  keyItems.forEach(item => {
    let matchName = item.kovoltaMatchProp;
    if (matchName === 'id') {
      matchName = String(item[matchName]).replace('_', '').toUpperCase();
    } else if (matchName === 'name') {
      matchName = String(item[matchName]).toUpperCase();
    } else {
      matchName = item.kovoltaMatchProp.toUpperCase();
    }

    keyItemMatches.push(matchName);
  });

  locationLines.forEach((line, lineIndex) => {
    if (!line.startsWith('-') && line.trim() !== '') {
      // 1. Check for each Key Item match name in the line using the block above
      keyItems.forEach(keyItem => {
        let matchName = keyItem.kovoltaMatchProp;
        if (matchName === 'id') {
          matchName = String(keyItem[matchName]).replace('_', '').toUpperCase();
        } else if (matchName === 'name') {
          matchName = String(keyItem[matchName]).toUpperCase();
        } else {
          matchName = keyItem.kovoltaMatchProp.toUpperCase();
        }

        if (line.includes(matchName)) {
          // 2. If match, grab everything of line before the first | and trim it
          let itemLocation = line.substring(0, line.indexOf('|')).trim();
          let currLineIndex = lineIndex;

          while (!itemLocation) {
            // 2A. If result of 2 is empty, repeat 2 for the line above it until it isn't empty (b/c it's in a shop)
            currLineIndex -= 1;
            itemLocation = locationLines[currLineIndex].substring(0, line.indexOf('|')).trim();
          }

          // 3. Iterate through each REGIONS const, checking against locations and routes
          const matchedRegion = KOVOLTA_REGIONS.find(
            region =>
              region.locations.filter(regionLocation => itemLocation.startsWith(regionLocation.toUpperCase()))
                .length > 0 ||
              region.routes.filter(regionRoute => itemLocation.includes(`ROUTE_${regionRoute.toString()} `))
                .length > 0
          );

          // 4. For the matched REGION found in 3, create the `addedItem` object
          const shouldUpgradeItem = false; // TODO: Need rules here. keyItem.upgradeModifier won't help

          const addedItem = {
            ...keyItem,
            points: keyItem.points + (shouldUpgradeItem ? keyItem.upgradeAmt : 0),
          };

          // 5. Add to regionPointsArray and randomizedItems (similar to speedchoice extraction)
          const matchedRPAIndex = regionPointsArray.findIndex(rpa => rpa.regionId === matchedRegion?.id);
          regionPointsArray[matchedRPAIndex].points += addedItem.points;

          // @ts-ignore
          regionPointsArray[matchedRPAIndex].items.push(addedItem);

          randomizedItems.push(addedItem);
        }
      });
    }
  });

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
 * @param {import("../types/PointTracker").KeyItem[]} keyItems
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
 * @param {import("../types/PointTracker").KeyItem[]} keyItems
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
