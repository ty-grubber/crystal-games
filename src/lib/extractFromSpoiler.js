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
   * @type {import("../types/PointTracker").KeyItem[]}
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

  const shuffleItemsStartIndex = spoilerLines.findIndex(line => line.includes('SHUFFLE_ITEMS:'));
  const shuffleItemsEndIndex = spoilerLines.findIndex(line => line.includes('START_WITH_ITEMS:'));
  const shuffleItemsLines = spoilerLines.slice(shuffleItemsStartIndex, shuffleItemsEndIndex);

  const excludeLocationsStartIndex = shuffleItemsLines.findIndex(line => line.includes('EXCLUDE_LOCATIONS:'));
  const excludeLocationsLines = spoilerLines.slice(
    shuffleItemsStartIndex + excludeLocationsStartIndex,
    shuffleItemsEndIndex
  );

  const startingItemsStartIndex = shuffleItemsEndIndex;
  const startingItemsEndIndex = spoilerLines.findIndex(line => line.includes('BANNED_ITEMS:'));
  const startingItemsLines = spoilerLines.slice(startingItemsStartIndex, startingItemsEndIndex);

  const shopLocationsStartIndex = locationLines.findIndex(line => line.includes('----- SHOP ITEMS -----'));
  const shopLocationsLines = locationLines.slice(shopLocationsStartIndex);

  const hasRegularGiftChecks = !!shuffleItemsLines.find(line => line.includes('- REGULAR_GIFTS'));
  const hasHiddenItemChecks = !!shuffleItemsLines.find(line => line.includes('- REGULAR_HIDDEN_ITEMS'));
  const hasTMGiftChecks = !!shuffleItemsLines.find(line => line.includes('- TM_GIFTS'));
  const hasTMItemBallChecks = !!shuffleItemsLines.find(line => line.includes('- TM_ITEM_BALLS'));

  // Whether if we know ahead of time we can skip certain key items
  const skipBicycle = !!startingItemsLines.find(line => line.includes('- BICYCLE'));
  const skipGSBall = !shuffleItemsLines.find(line => line.includes('- KEY_ITEMS'));
  const skipUnowndex = !!excludeLocationsLines.find(
    line => line.includes('RUINS_OF_ALPH_OUTSIDE_MAIN_AREA_RESEARCHERS_GIFT')
  );
  const skipMapCard = !!excludeLocationsLines.find(
    line => line.includes('CHERRYGROVE_CITY_GUIDE_GENTS_GIFT')
  );
  const skipEonMail = !hasRegularGiftChecks || !!excludeLocationsLines.find(line => line.includes('GOLDENROD_DEPT_STORE_5F_MYSTERY_GIFT_GIRLS_GIFT'));
  // Don't track additionally added water stones if both vanilla locations aren't randomized
  const hasVanillaWaterStones = !hasRegularGiftChecks || [
    'ROUTE_42_MAHOGANY_SIDE_TULLYS_GIFT',
    'BILLS_HOUSE_BILLS_GRANDPAS_GIFT_FOR_STARYU',
  ].every(check => excludeLocationsLines.some(line => line.includes(check)));
  // Exception to the above is if the water stone is the added shop one, and shops are randomized
  const hasShopSanityWaterStone = !!shuffleItemsLines.find(line => line.includes('- SHOPS'))
    && !!spoilerLines.slice(startingItemsEndIndex).find(line => line.includes('BUYABLE_EVOLUTION_STONES: true'));

  // Key Item point modifier checks
  const hasMonLockedChecks = [
    'NATIONAL_PARK_BEVERLYS_GIFT_FOR_MARILL',
    'ROUTE_39_DEREKS_GIFT_FOR_PIKACHU',
    'ROUTE_43_TIFFANYS_GIFT_FOR_CLEFAIRY',
    'LAKE_OF_RAGE_MAGIKARP_HOUSE_MANS_GIFT_FOR_MAGIKARP',
    'ELMS_LAB_ELMS_GIFT_FOR_TOGEPI',
    'RUINS_OF_ALPH_OUTSIDE_MAIN_AREA_RESEARCHERS_GIFT',
    'BILLS_HOUSE_BILLS_GRANDPAS_GIFT_FOR_LICKITUNG',
    'BILLS_HOUSE_BILLS_GRANDPAS_GIFT_FOR_ODDISH',
    'BILLS_HOUSE_BILLS_GRANDPAS_GIFT_FOR_STARYU',
    'BILLS_HOUSE_BILLS_GRANDPAS_GIFT_FOR_GROWLITHE',
    'BILLS_HOUSE_BILLS_GRANDPAS_GIFT_FOR_PICHU',
  ].some(check => !excludeLocationsLines.some(line => line.includes(check)));

  const hasGSBallShuffled = !skipGSBall && !excludeLocationsLines.find(line => line.includes('AZALEA_TOWN_KURTS_GIFT_FOR_GS_BALL'));

  // If some of the Blue Card shop items are vanilla, then it isn't randomized
  const blueCardShopLinesStartIndex = shopLocationsLines.findIndex(
    line => line.includes('RADIO_TOWER_2F_BLUE_CARD_SHOP')
  );
  const hasBlueCardChecks = blueCardShopLinesStartIndex >= 0
    ? !shopLocationsLines[blueCardShopLinesStartIndex].replace(/\s/g, '').includes('|ULTRABALL|2')
      || !shopLocationsLines[blueCardShopLinesStartIndex + 1].replace(/\s/g, '').includes('|FULLRESTORE|2')
      || !shopLocationsLines[blueCardShopLinesStartIndex + 2].replace(/\s/g, '').includes('|NUGGET|3')
    : false;

  // If some of the game corner items are vanilla, then it isn't randomized
  const gameCornerShopLineIndex = shopLocationsLines.findIndex(line => line.includes('GOLDENROD_GAME_CORNER_ITEM_SHOP'));
  const hasGameCornerChecks = gameCornerShopLineIndex >= 0
    ? !shopLocationsLines[gameCornerShopLineIndex].replace(/\s/g, '').includes('|TM25|5500')
      || !shopLocationsLines[gameCornerShopLineIndex + 1].replace(/\s/g, '').includes('|TM14|5500')
      || !shopLocationsLines[gameCornerShopLineIndex + 2].replace(/\s/g, '').includes('|TM38|5500')
    : false;

  // Need to check if shop shuffle is on. If not, we can remove checking those lines in the spoiler
  const isShopShuffleOn = shuffleItemsLines.some(line => line.includes('- SHOP'));
  const locationsToCheckLines = isShopShuffleOn ? locationLines : locationLines.slice(0, shopLocationsStartIndex);

  let roofShop1LineIndex = -1;
  let isSkippingRoofShop1 = false;

  locationsToCheckLines.forEach((line, lineIndex) => {
    if (lineIndex > shopLocationsStartIndex) {
      // With shop shuffle on, Roof Shop 2 contains all of Roof Shop 1, even if Roof Shop 2 is excluded, so skip Shop 1
      roofShop1LineIndex = line.includes('GOLDENROD_DEPT_STORE_ROOF_SHOP_1') ? lineIndex : roofShop1LineIndex;

      // However, this section has lines that don't start with the location name, so we have to account for that
      if (roofShop1LineIndex > -1) {
        isSkippingRoofShop1 = lineIndex >= roofShop1LineIndex && lineIndex <= roofShop1LineIndex + 4;
      }
    }

    // Skip lines in the locations lines that are useless or we know have been excluded from randomization
    const shouldSkipLine =
      line.startsWith('-')
      || line.trim() === ''
      || isSkippingRoofShop1
      || excludeLocationsLines.some(excludedLocation => line.startsWith(excludedLocation.replace('-', '').trim()));

    if (!shouldSkipLine) {
      // 1. Check for each Key Item match name in the line using the block above
      keyItems.forEach(keyItem => {
        // If we hit a key item that we know doesn't need to be included in the tracker, skip it
        if (
          !(keyItem.name === 'Bicycle' && skipBicycle)
          && !(keyItem.name === 'GS Ball' && skipGSBall)
          && !(keyItem.name === 'Unown Dex' && skipUnowndex)
          && !(keyItem.name === 'Map Card' && skipMapCard)
          && !(keyItem.name === 'Eon Mail' && skipEonMail)
          && !(keyItem.name === 'Water Stone' && hasVanillaWaterStones && !hasShopSanityWaterStone)
          && !(keyItem.name === 'Leftovers' && !hasHiddenItemChecks)
          && !(keyItem.name === 'Headbutt' && !hasTMGiftChecks)
          && !(keyItem.name === 'Sweet Scent' && !hasTMGiftChecks)
          && !(keyItem.name === 'Rock Smash' && !hasTMGiftChecks)
          && !(keyItem.name === 'Dig' && !hasTMItemBallChecks)
        ) {
          let matchName = keyItem.kovoltaMatchProp;
          if (matchName === 'id') {
            matchName = String(keyItem[matchName]).replace(/_/g, '').toUpperCase();
          } else if (matchName === 'name') {
            matchName = String(keyItem[matchName]).toUpperCase();
          } else {
            matchName = keyItem.kovoltaMatchProp.toUpperCase();
          }

          if (line.split('|')[1].includes(matchName)) {
            // 2. If match, grab everything of line before the first | and trim it
            let itemLocation = line.substring(0, line.indexOf('|')).trim();
            let currLineIndex = lineIndex;

            // Skip vanilla water stones
            if (!(matchName === 'WATER STONE' && [
              'BILLS_HOUSE_BILLS_GRANDPAS_GIFT_FOR_STARYU',
              'ROUTE_42_MAHOGANY_SIDE_TULLYS_GIFT'
            ].includes(itemLocation))) {

              while (!itemLocation) {
                // 2A. If result of 2 is empty, repeat 2 for the line above it until it isn't empty (b/c it's in a shop)
                currLineIndex -= 1;
                itemLocation = locationsToCheckLines[currLineIndex].substring(0, line.indexOf('|')).trim();
              }

              // 3. Iterate through each REGIONS const, checking against locations and routes
              const matchedRegion = KOVOLTA_REGIONS.find(
                region =>
                  region.locations.filter(regionLocation => itemLocation.startsWith(regionLocation.toUpperCase()))
                    .length > 0 ||
                  region.routes.filter(regionRoute => itemLocation.startsWith(`ROUTE_${regionRoute.toString()}_`))
                    .length > 0
              );

              // 4. For the matched REGION found in 3, create the `addedItem` object, but check if points need upgrading
              const pokedexNeedsUpgrade = keyItem.name === 'Pokedex' && hasMonLockedChecks;
              const tm12NeedsUpgrade = keyItem.name === 'Sweet Scent' && hasMonLockedChecks;
              const bicycleNeedsUpgrade = keyItem.name === 'Bicycle' && hasHiddenItemChecks;
              const blueCardNeedsUpgrade = keyItem.name === 'Blue Card' && hasBlueCardChecks;
              const coinCaseNeedsUpgrade = keyItem.name === 'Coin Case' && hasGameCornerChecks;
              const gsBallNeedsUpgrade = keyItem.name === 'GS Ball' && hasGSBallShuffled;

              const shouldUpgradeItem =
                pokedexNeedsUpgrade ||
                tm12NeedsUpgrade ||
                bicycleNeedsUpgrade ||
                blueCardNeedsUpgrade ||
                coinCaseNeedsUpgrade ||
                gsBallNeedsUpgrade;

              const addedItem = {
                ...keyItem,
                points: keyItem.points + (shouldUpgradeItem ? keyItem.upgradeAmt : 0),
              };

              // 5. Add to regionPointsArray and update randomizedItems array (similar to speedchoice extraction)
              const matchedRPAIndex = regionPointsArray.findIndex(rpa => rpa.regionId === matchedRegion?.id);
              try {
                regionPointsArray[matchedRPAIndex].points += addedItem.points;
              } catch (error) {
                console.log(`MatchedRPAIndex: ${matchedRPAIndex}; Key Item Match: ${keyItem.name}; Location line: ${line}; itemLocation: ${itemLocation}`)
              }

              // @ts-ignore
              regionPointsArray[matchedRPAIndex].items.push(addedItem);

              randomizedItems.push(addedItem);
            }
          }
        }
      });
    }
  });

  // Finally, we need to re-order the randomizedItems to match the KeyItems constant order
  // Note that there could be duplicate key items randomized, hence the use of filter and concat
  // Ex. TM08 or Water Stone
  const orderedRandomizedItems = keyItems.reduce(
    (
      /**
     * @type {import("../types/PointTracker").KeyItem[]}
     */
      orderedArray,
      curr,
    ) => orderedArray.concat(randomizedItems.filter(item => item.id === curr.id)),
    []
  );

  return {
    randomizedItems: orderedRandomizedItems,
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

export { extractPointsInfoFromSpoiler };
