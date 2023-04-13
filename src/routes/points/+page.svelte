<script>
// @ts-nocheck
  import { clickOutside } from '$lib/clickOutside';
  import extractRegionsFromSpoiler from '$lib/extractRegionsFromSpoiler';
  import { randomizeArray } from '$lib/randomize';
  import Button, { Label } from '@smui/button';
  import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import Select, { Option } from '@smui/select';
  import CustomPts from '../../components/CustomPts.svelte';
  import KEY_ITEMS from '../../constants/keyItems';
  import REGIONS from '../../constants/regions';

  const availableItemsPointCellStyles = "width: 65px !important; text-align: center; font-size: 24px;";
  const availableItemsItemCellStyles = "padding: 0; width: 300px; white-space: normal;"

  const regionColorClasses = [
    'black',
    'orange',
    'lt-blue',
    'yellow',
    'green',
    'dk-blue',
    'red',
    'pink',
  ];

  /**
	 * @type {{ regionId: number; points: number; items: any[]; }[]}
	 */
  let regionPoints;

  /**
   * @type {null | string}
   */
  let hoveringOverBasket;
  let baskets = [];
  let regionRevealOrder = [];
  let revealedRegions = [];
  let showSolution = false;
  let howToDialogOpen = false;
  let inGameMenuOpen = false;
  let customPtsMenuOpen = false;

  let settingsDialogOpen = true;
  let revealRegionPoints = false;
  let revealOrdering = 'random';
  let spoilerFile;

  let mapSelected = 'johto';
  let selectedAvailableItem = {};
  let selectedFoundItem = {};

  let keyItems = [ ...KEY_ITEMS];

  /**
	 * @param {any} e
	 */
  async function handleSpoilerFileChange(e) {
    spoilerFile = e.target.files[0];
  };

  async function onStartClick() {
    const file = spoilerFile;
    if (file != null) {
      const spoilerText = await file.text();

      const extraction = extractRegionsFromSpoiler(spoilerText, keyItems);
      regionPoints = extraction.regionPointsArray;

      const ninePtItems = extraction.randomizedItems.filter(item => item.points === 9);
      const sevenPtItems = extraction.randomizedItems.filter(item => item.points === 7);
      const fivePtItems =  extraction.randomizedItems.filter(item => item.points === 5);
      const threePtItems =  extraction.randomizedItems.filter(item => item.points === 3);

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
        { type: 'item', name: '9', items: ninePtItems},
        { type: 'item', name: '7', items: sevenPtItems},
        { type: 'item', name: '5', items: fivePtItems},
        { type: 'item', name: '3', items: threePtItems},
      ];

      baskets = newBaskets;
      let regionsWithTotalPoints = regionPoints.map(region => ({ id: region.regionId, points: region.points }));

      switch (revealOrdering) {
        case 'desc':
          regionsWithTotalPoints.sort((a, b) => b.points - a.points);
          break;
        case 'asc':
          regionsWithTotalPoints.sort((a, b) => a.points - b.points);
          break;
        default:
          regionsWithTotalPoints = randomizeArray(regionsWithTotalPoints, extraction.rngSeed || file.name);
      }
      regionRevealOrder = regionsWithTotalPoints.map(r => r.id);
      settingsDialogOpen = false;
    }
  }

  function handleStartNewGame() {
    if(confirm('Starting a new game will end the current one. Are you sure you wish to start a new game?')) {
      spoilerFile = null;
      regionPoints = null;
      baskets = [];
      regionRevealOrder = [];
      revealedRegions = [];
      selectedAvailableItem = {};
      selectedFoundItem = {};
      revealOrdering = 'random';
      showSolution = false;
      revealRegionPoints = false;
      howToDialogOpen = false;
      inGameMenuOpen = false;
      settingsDialogOpen = true;
    }
  }

  function handleShowSolution() {
    showSolution = !showSolution;
  }

  function toggleRevealAllRegions() {
    revealRegionPoints = !revealRegionPoints;
  }

  function openHowToDialog() {
    howToDialogOpen = true;
  }

  function openSettingsDialog() {
    settingsDialogOpen = true;
  }

  function openInGameMenu() {
    inGameMenuOpen = true;
  }

  function checkToExposeRegion(originalBasket, targetBasket, movedItem) {
    if (originalBasket.type === 'item' && targetBasket.type === 'region' && movedItem.points === 9) {
      // Found a badge in a region so expose a region's point value
      const regionToExpose = regionRevealOrder.shift();
      revealedRegions.unshift(regionToExpose);

      regionRevealOrder = regionRevealOrder;
      revealedRegions = revealedRegions;
    } else if (originalBasket.type === 'region' && targetBasket.type === 'item' && movedItem.points === 9) {
      // Unmarked a badge in a region so hide the last exposed region's point value
      const regionToExpose = revealedRegions.shift();
      regionRevealOrder.unshift(regionToExpose);

      regionRevealOrder = regionRevealOrder;
      revealedRegions = revealedRegions;
    }
  }

	/**
	 * @param {DragEvent & { currentTarget: EventTarget & HTMLLIElement; }} event
	 * @param {any} basketIndex
	 * @param {number} itemIndex
	 */
	function dragStart(event, basketIndex, itemIndex) {
		// The data we want to make available when the element is dropped
    // is the index of the item being dragged and
    // the index of the basket from which it is leaving.
		const data = {basketIndex, itemIndex};
   	event.dataTransfer?.setData('text/plain', JSON.stringify(data));
	}

	/**
	 * @param {DragEvent & { currentTarget: EventTarget & HTMLUListElement; }} event
	 * @param {number} basketIndex
	 */
	function drop(event, basketIndex) {
		event.preventDefault();
    if (event.dataTransfer) {
      const json = event.dataTransfer.getData("text/plain");
      const origItemLocation = JSON.parse(json);

      let targetBasket = baskets[basketIndex];
      const itemGettingDragged = baskets[origItemLocation.basketIndex].items[origItemLocation.itemIndex];

      // Ensure items get dropped into correct available item basket
      if (targetBasket.type === 'item') {
        // Check if item is going into correct item basket and update target basket
        if (itemGettingDragged.points.toString() !== targetBasket.name) {
          targetBasket = baskets.find(basket => basket.type === 'item' && basket.name === itemGettingDragged.points.toString());
        }
      }

      // Remove the item from the original basket.
      const originalBasket = baskets[origItemLocation.basketIndex];
      const [item] = originalBasket.items.splice(origItemLocation.itemIndex, 1);

      // Add the item to the drop target basket.
      targetBasket.items.push(item);
      baskets = baskets;

      checkToExposeRegion(originalBasket, targetBasket, item);

      hoveringOverBasket = null;
      selectedAvailableItem = {};
      selectedFoundItem = {};
    }
	}

  function handleAvailableItemClick(event, item, currBasketIndex) {
    event.stopPropagation();
    selectedAvailableItem = {
      ...item,
      currBasketIndex,
    };
    selectedFoundItem = {};
  }

  function handleFoundItemClick(event, item, currBasketIndex) {
    event.stopPropagation();
    selectedAvailableItem = {};
    selectedFoundItem = {
      ...item,
      currBasketIndex,
    };
  }

  function setSelectedItemIntoBasket(basketIndex) {
    let targetBasket = baskets[basketIndex];
    const itemGettingPlaced = selectedAvailableItem.points ? selectedAvailableItem : selectedFoundItem;

    if (itemGettingPlaced.points) {
      // Ensure items get dropped into correct available item basket
      if (targetBasket.type === 'item') {
        // Check if item is going into correct item basket and update target basket
        if (itemGettingPlaced.points.toString() !== targetBasket.name) {
          targetBasket = baskets.find(basket => basket.type === 'item' && basket.name === itemGettingPlaced.points.toString());
        }
      }

      // Remove the item from the original basket.
      const originalBasket = baskets[itemGettingPlaced.currBasketIndex];
      const draggedItemIndexInBasket = baskets[itemGettingPlaced.currBasketIndex].items.findIndex(item => item.id === itemGettingPlaced.id);
      const [freedItem] = originalBasket.items.splice(draggedItemIndexInBasket, 1);

      // Add the item to the drop target basket.
      targetBasket.items.push(freedItem);
      baskets = baskets;

      checkToExposeRegion(originalBasket, targetBasket, freedItem);
    }

    selectedAvailableItem = {};
    selectedFoundItem = {};
  }

  function handleOutsideRegionTableClick(e) {
    // TODO: need to change this for custom point values
    if (e.explicitOriginalTarget.tagName.toLowerCase() !== 'img' && !['3', '5', '7', '9'].find(value => value === e.explicitOriginalTarget.innerHTML)) {
      selectedAvailableItem = {};
      selectedFoundItem = {};
    }
  }

  function handleUpdatePointValues(updatedKeyItems) {
    keyItems = [...updatedKeyItems];
    customPtsMenuOpen = false;
  }
</script>

<svelte:head>
  <title>Pokémon Crystal Points Hint Tracker</title>
  <meta property="description" content="Streamline your randomizer by using a key item region point hint system!" />
  {#each KEY_ITEMS as keyItem}
    <link rel="preload" as="image" href={`/keyItems/${keyItem.id}.png`} />
  {/each}
  <link rel="preload" as="image" href="/maps/johto-points-region-map.png" />
  <link rel="preload" as="image" href="/maps/kanto-points-region-map.png" />
</svelte:head>

<div class="page">
  {#if !regionPoints}
    <h1>Pokémon Crystal Points Tracker</h1>
    <Button color="primary" on:click={openSettingsDialog} variant="raised">
      <Label>New Game</Label>
    </Button>
    <Button color="secondary" on:click={openHowToDialog} variant="raised">
      <Label>How To Play</Label>
    </Button>
    <Button color="secondary" href="/" variant="outlined">
      <Label>Games Home</Label>
    </Button>
    <br /><br />
  {/if}

  <Dialog bind:open={settingsDialogOpen}>
    <Title id="settingsTitle">Pokémon Crystal Points Hint Tracker Settings</Title>
    <Content id="settingsContent">
      <label for="spoiler">
        {!spoilerFile ? 'Upload spoiler file (.txt):' : 'Spoiler Uploaded!'}
      </label>
      <input
        id="spoiler"
        accept=".txt"
        type="file"
        on:change={handleSpoilerFileChange}
        style="margin-right: 1rem;"
      />
      <br /><br />
      <Select bind:value={revealOrdering} variant="outlined" label="Region Reveal Order" style="width: 220px;">
        <Option value="random">Random</Option>
        <Option value="desc">Highest First</Option>
        <Option value="asc">Lowest First</Option>
      </Select>
      <br /><br />
      <label for="startRevealed">Start with region points revealed?</label>
      <input
        id="startRevealed"
        type="checkbox"
        class="checkbox"
        on:click={toggleRevealAllRegions}
        value={revealRegionPoints}
      />
      <br /><br />
      <button
        type="button"
        on:click={() => customPtsMenuOpen = true}
      >
        Custom Item Points
      </button>
      <br /><br /><br />
      <Button color="primary" on:click={onStartClick} disabled={!spoilerFile} variant="raised">
        <Label>Start Game</Label>
      </Button>
      <Button color="secondary" on:click={openHowToDialog} variant="raised">
        <Label>How To Play</Label>
      </Button>
      <Button color="secondary" href="/" variant="outlined">
        <Label>Games Home</Label>
      </Button>
    </Content>
  </Dialog>

  <Dialog bind:open={customPtsMenuOpen} slot="over" surface$style="height: 700px; width: 800px;">
    <Title>Customize Key Item Points</Title>
    <Content>
      <CustomPts
        onCancel={() => customPtsMenuOpen = false}
        onConfirmPts={handleUpdatePointValues}
      />
    </Content>
  </Dialog>

  <Dialog bind:open={inGameMenuOpen}>
    <Title id="inGameMenuTitle">Tracker Menu</Title>
    <Content id="inGameMenuContent">
      <Button color="primary" variant="outlined" on:click={toggleRevealAllRegions}>
        <Label>{revealRegionPoints ? 'Hide' : 'Show'} Region Points</Label>
      </Button>
      <t />
      <!-- TODO? put solution in separate dialog -->
      <Button color="primary" variant="outlined" on:click={handleShowSolution}>
        <Label>{showSolution ? 'Hide' : 'Show'} Solution</Label>
      </Button>
      <br /><br />
      <Button color="secondary" on:click={openHowToDialog} variant="raised">
        <Label>How To Play</Label>
      </Button>
      <br /><br />
      <Button color="primary" on:click={handleStartNewGame} variant="raised">
        <Label>Start New Game</Label>
      </Button>
      <Actions>
        <Button>Close</Button>
      </Actions>
    </Content>
  </Dialog>

  <Dialog bind:open={howToDialogOpen} slot="over" surface$style="height: 700px">
    <Title id="howToTitle">How To Use The Points Hint Tracker</Title>
    <Content id="howToContent">
      <p>
        The Points Hint Tracker is a different way to play your Pokémon Crystal Randomizer as it gives you hints as to where Key Items are located in your ROM. This tracker handles any logic settings, including Shopsanity (with Buena and Game Corner) and Nightmare modes, but it does assume that your goal is to beat Red.
      </p>
      <p>
        This tracker works for use with most versions of the Item Randomizer and has been tested to work on v7.1.16.
      </p>

      <h3>Initiating The Tracker</h3>
      <p>
        In order to start the tracker, you will need to upload the spoiler log you received when you generated your rom through the Item Randomizer. The page with this tracker should have popped up a settings dialog where you can first input your spoiler log. If it didn't, click the New Game button to bring it up. You will not be able to start the tracker until a spoiler log file is uploaded.
      </p>
      <p>
        After uploading your spoiler log, you can choose your settings for how you want the region points to be revealed (see Revealing Region Points below for details on how regions are revealed). You can choose between having them revealed in a random order, in descending order (highest total points to lowest total points), or in ascending order (lowest total points to highest total points). If you don't want to play with the revealing game mode, leave the above dropdown alone and check off the "Start with region points revealed?" checkbox. (You can change this later via the In-Game menu)
      </p>
      <p>
        The upload process will log each Key Item into a region based on where the randomizer placed it in the ROM. If a Key Item has not been randomized (ie. does not appear in the spoiler log), the tracker assumes that the Key Item has been placed in its vanilla location. Each Key Item has been assigned a point value based on its usefulness to defeating Red:
      </p>
      <ul>
        <li><b>9 Points:</b> Badges</li>
        <li><b>7 Points:</b> Large Region unlock items (such as HMs or Pokegear items)</li>
        <li><b>5 Points:</b> Any other Key Item that unlocks additional checks, like Escape Rope, Rock Smash, or Basement Key</li>
        <li><b>3 Points:</b> Useless Key Items that don't provide checks, like Silver Wing, Blue Card*, or Rods</li>
      </ul>

      <p><b>*</b>Both Blue Card and Coin Case get upgraded to 5-point items if the appropriate Modifiers have been turned on (namely, Buena Items and Game Corner respectively)</p>

      <h3>Tracker Overview</h3>
      <p>
        Once the upload is complete, a table will appear with each row being a region where a key item could be placed in the ROM. Beside the name of each region is the remaining number of points of Key Items contained in that region, as well as an empty space for you to put found items in. Some items may have already been placed in this empty space. If so, it means those items were not randomized (ie. they're vanilla) or you have started with them (such as the Bicycle).
      </p>
      <p>
        As well, a table containing the remaining available Key Items will be located on the right including the point value of each Key Item. <b><u>Only Key Items that have been randomized according to your seed settings will show in this list.</u></b> For example, if you are playing on standard Crazy with Hidden Item settings, items like the Map Card will not appear in this table, because they are in their vanilla location. Additionally, if you have the Start With Bike modifier active, then the Bicycle will not appear in this table.
      </p>
      <p>
        Underneath this table you will find a more descriptive list of all the locations in Pokémon Crystal and what region number they have been placed in. If a city is listed in a region, then any subareas within that city are also included in that region. For example, Tin Tower is located in Ecruteak City, so item locations in Tin Tower are a part of Region #6.
      </p>
      <p>
        Finally, you can access the In-Game menu via the green button in the top right corner of the page (or under the Region table for smaller screens). This menu is useful for toggling certain settings, accessing this How To Play dialog, and starting a new game.
      </p>

      <h3>Revealing Region Points</h3>
      <p>
        The total number of points of Key Items for each region will remain hidden with `??`. Every time you find a 9-point item in your game and place them into the region table (see Using The Tracker below), a region's remaining point value will be revealed and bolded according to the ordering you chose when initiating the tracker. If you replace the 9-point item back into the item table, the last region's remaining point value that was revealed will become hidden again and will also be the next region to reveal its point value when another 9-point item is placed in the table.
      </p>
      <p>
        At any time, you can toggle the reveal mode by clicking the `Show/Hide Region Points` in the In-Game menu, which will reveal all remaining point values of all regions. If you are hiding the region points via this button, the regions that have already been revealed with 9-point items found will not become hidden.
      </p>

      <h3>Using The Tracker</h3>
      <p>
        As you play your ROM, you can note the region where you found a Key Item by dragging the item's icon from the items table on the right into the appropriate region slot on the table on the left. For example, if you found the Boulder Badge in Cherrygrove Mart, drag the Boulder Badge icon from the 9 row of the right items table into Region #1's row on the table on the left.
        <br />
        You can note, that when you drop the icon into a revealed region's row in the table, the Points Left value of that region will decrease based on the value of the item you placed there. If you ever make a mistake, you can always freely drag icons from region rows to other region rows, or even back to the available items table on the right.
      </p>

      <p>
        Instead of dragging, you can also click items in any list to move them to a different list. Clicking an item will bring up a black border around the clicked item. As well, any logical slot that item can be placed will highlight in green (a region showing `??` is always assumed to have enough points to fit the item). Clicking a green section will place the selected item in that slot. To deselect a selected item, click anywhere outside the region table or the available item table.
      </p>

      <p>
        If you are unsure what item an icon represents, simply hover your mouse over the icon and a tooltip should display with the item's name and how many points it is worth.
      </p>

      <h3>References</h3>
      <p>
        Underneath the available items table is a small section containing various references that can help you use this tracker effectively:
      </p>
      <ul>
        <li><b>Johto Map:</b> A map of Johto displaying the boundaries of the Johto regions. (1-12)</li>
        <li><b>Kanto Map:</b> A map of Kanto displaying the boundaries of the Kanto regions. (13-16)</li>
        <li><b>Text Regions:</b> A list of all the regions and the major locations contained within them, including routes and dungeons.</li>
        <li><b>Point Sums:</b> A list of various Points Left amounts and what combinations of Key Item points it would take to add up to that number. For instance, you can achieve 13 points with 3+3+7 or 3+5+5.</li>
      </ul>

      <h3>Additional Info</h3>
      <p>
        At any time, you can peek the solution of the tracker by clicking the Show Solution button in the In-Game menu. This will cause an extra column to display in the Region table showing which region each Key Item can be found in. These key items in the solution are listed in descending points order. <br />
        <b>Note: </b> if you have progressive Rods turned on, the Rod icons might be in different Regions in the solution compared to where you found them, but they're all worth the same number of points anyway.
      </p>
      <p>
        To start a new game, click the Start New Game button in the In-Game menu. The tables will reset and the initial game settings dialog will show so you can upload your next spoiler log.
      </p>
    </Content>
    <Actions>
      <Button>Close</Button>
    </Actions>
  </Dialog>

  {#if regionPoints?.length > 0}
    <div class="grid-area">
      <div class="region-section">
        <div use:clickOutside on:click_outside={handleOutsideRegionTableClick}>
          <DataTable>
            <Head>
              <Row>
                <Cell>Region</Cell>
                <Cell>Pts Left</Cell>
                <Cell>Items Found</Cell>
                {#if showSolution}
                  <Cell>Solution</Cell>
                {/if}
              </Row>
            </Head>
            <Body>
              {#each regionPoints as rp, i (rp.regionId)}
                <Row>
                    <Cell style="font-size: 16px; font-weight: bold">
                      <span class={`region-id ${regionColorClasses[i % regionColorClasses.length]}`}>{rp.regionId}</span> - {rp.name}
                    </Cell>
                    <Cell style={`text-align: center; font-size: ${revealedRegions[0] === rp.regionId ? '24px; font-weight: bold; text-decoration: underline green 4px;': '20px;'}`}>
                      {(revealRegionPoints || revealedRegions.includes(rp.regionId))
                        ? rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0)
                        : '??'
                      }
                    </Cell>
                    <Cell style="white-space: normal; padding-right: 0;">
                      <ul
                        class:hovering={
                          (hoveringOverBasket === `${baskets[i].type}_${baskets[i].name}`)
                        }
                        class:dumpable={
                          (!revealRegionPoints && !revealedRegions.includes(rp.regionId) && (selectedAvailableItem?.points || selectedFoundItem?.points)) ||
                          ((revealRegionPoints || (!revealRegionPoints && revealedRegions.includes(rp.regionId))) &&
                            (selectedAvailableItem?.points <= rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0)) ||
                            (selectedFoundItem?.points <= rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0))
                          )
                        }
                        on:dragenter={() => hoveringOverBasket = `${baskets[i].type}_${baskets[i].name}`}
                        on:dragleave={() => hoveringOverBasket = null}
                        on:drop={event => drop(event, i)}
                        on:click={() => setSelectedItemIntoBasket(i)}
                        on:keypress={() => setSelectedItemIntoBasket(i)}
                        ondragover="return false;"
                      >
                        {#each baskets[i].items as item, itemIndex (`${item.id}_${itemIndex}`)}
                          <li
                            class="draggableIcon"
                            draggable={true}
                            on:dragstart={event => dragStart(event, i, itemIndex)}
                            on:click={(e) => handleFoundItemClick(e, item, i)}
                            on:keypress={(e) => handleFoundItemClick(e, item, i)}
                          >
                            <img
                              class:selected={selectedFoundItem?.id === item.id}
                              src={`/keyItems/${item.id}.png`}
                              alt={item.name}
                              title={`${item.name} - ${item.points}`}
                            />
                          </li>
                        {/each}
                      </ul>
                    </Cell>
                    {#if showSolution}
                      <Cell>
                        {#each rp.items as item, itemIndex (`${item.id}_${itemIndex}`)}
                          <img class="solution-item" src={`/keyItems/${item.id}.png`} alt={item.name} title={`${item.name} - ${item.points}`} />
                        {/each}
                      </Cell>
                    {/if}
                </Row>
              {/each}
            </Body>
          </DataTable>
        </div>
        {#if spoilerFile}
          <p>
            Spoiler file name: {spoilerFile.name}
          </p>
        {/if}
        {#if regionPoints}
          <div class='floating-menu'>
            <Button color="primary" on:click={openInGameMenu} variant="raised">
              <Label>Menu</Label>
            </Button>
          </div>
        {/if}
        <p class="credits">
          Key Item image sprites courtesy of <a href="https://gitlab.com/Sekii/pokemon-tracker" rel="noreferrer" target="_blank">Sekii's Pokémon Tracker</a> and Kovolta.<br />
          Region map images created by Kovolta.
        </p>
      </div>
      <div class="available-items">
        <DataTable style="width: 350px; margin-left: 3rem;">
          <Body>
            {#each baskets.filter(basket => basket.type === 'item') as basket, basketIndex (basket)}
              <Row style="height: 85px !important;">
                <Cell
                  style={availableItemsPointCellStyles.concat(selectedFoundItem.points?.toString() === basket.name ? ' background-color: lightgreen; cursor: pointer;' : '')}
                  on:click={() => setSelectedItemIntoBasket(REGIONS.length + basketIndex)}
                  on:keypress={() => setSelectedItemIntoBasket(REGIONS.length + basketIndex)}
                >
                  {basket.name}
                </Cell>
                <Cell style={availableItemsItemCellStyles}>
                  <ul
                    class:hovering={hoveringOverBasket === `${basket.type}_${basket.name}`}
                    on:dragenter={() => hoveringOverBasket = `${basket.type}_${basket.name}`}
                    on:dragleave={() => hoveringOverBasket = null}
                    on:drop={event => drop(event, REGIONS.length + basketIndex)}
                    ondragover="return false;"
                  >
                    {#each basket.items as item, itemIndex (`${item.id}_${itemIndex}`)}
                      <li
                        class="draggableIcon"
                        draggable={true}
                        on:dragstart={event => dragStart(event, REGIONS.length + basketIndex, itemIndex)}
                        on:click={(e) => handleAvailableItemClick(e, item, REGIONS.length + basketIndex)}
                        on:keypress={(e) => handleAvailableItemClick(e, item, REGIONS.length + basketIndex)}
                      >
                        <img
                          class:selected={selectedAvailableItem?.id === item.id}
                          src={`/keyItems/${item.id}.png`}
                          alt={item.name}
                          title={`${item.name} - ${item.points}`}
                        />
                      </li>
                    {/each}
                  </ul>
                </Cell>
              </Row>
            {/each}
          </Body>
        </DataTable>
        <br /><br />
        <div class="references">
          <b style="font-size:18px;">References</b>
          <br />
          <Button color="primary" on:click={() => mapSelected = 'johto'} style={`text-decoration: ${mapSelected === 'johto' ? 'underline' : 'none'}`}>
            <Label>Johto Map</Label>
          </Button>
          <Button color="primary" on:click={() => mapSelected = 'kanto'} style={`text-decoration: ${mapSelected === 'kanto' ? 'underline' : 'none'}`}>
            <Label>Kanto Map</Label>
          </Button>
          <Button color="primary" on:click={() => mapSelected = 'text'} style={`text-decoration: ${mapSelected === 'text' ? 'underline' : 'none'}`}>
            <Label>Text Regions</Label>
          </Button>
          <Button color="primary" on:click={() => mapSelected = 'points'} style={`text-decoration: ${mapSelected === 'points' ? 'underline' : 'none'}`}>
            <Label>Point Sums</Label>
          </Button>
          <br />
          {#if mapSelected === 'text'}
            <ol start="1" type="1">
              {#each REGIONS as region (region.id)}
                <li>{region.description}</li>
              {/each}
            </ol>
          {:else if mapSelected === 'points'}
            <ol start="6" type="1" class="points-cheat-sheet">
              <li> 33</li>
              <li> 7</li>
              <li> 35</li>
              <li> 333 | 9</li>
              <li> 55 | 37</li>
              <li> 335</li>
              <li> 3333 | 39 | 57</li>
              <li> 337 | 355</li>
              <li> 3335 | 59 | 77</li>
              <li> 35 | 339 | 357 | 555</li>
              <li> 3337 | 3355 | 79</li>
              <li> 33335 | 359 | 377 | 557</li>
              <li> 333333 | 3339 | 3555 | 3357 | 99</li>
              <li> 33337 | 33355 | 379 | 559 | 577</li>
            </ol>
          {:else}
            <img src={`/maps/${mapSelected}-points-region-map.png`} alt={`Points region map of ${mapSelected}`} />
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .grid-area {
    display: inline-flex;
  }

  .checkbox {
    accent-color: #155c10;
    border: 2px solid black;
    height: 18px;
    width: 18px;
    margin: 5px;
  }

  .floating-menu {
    position: absolute;
    top: 1%;
    right: 1%;
    z-index: 10;
  }

  @media(max-width: 1024px) {
    .floating-menu {
      position: unset;
    }
  }

  .hovering {
		background-color: lightgrey;
	}

  .dumpable {
		background-color: lightgreen;
    cursor: pointer;
  }

	.grid-area li.draggableIcon {
		cursor: grab;
		display: inline-block;
	}
  .grid-area ul {
    margin: 0 0 -2px;
    max-width: 280px;
    min-height: 36px;
    padding: 4px 0 0;
	}

  .region-section .region-id {
    font-size: 20px;
    text-shadow: 0.5px 0.5px black;
  }

  @media(prefers-color-scheme: dark) {
    .region-section .region-id {
      text-shadow: none;
    }
  }

  .region-id.black {
    color: #000000;
  }

  @media(prefers-color-scheme: dark) {
    .region-id.black {
      color: #ffffff;
    }
  }
  .region-id.orange {
    color: #e69f00;
  }

  .region-id.lt-blue {
    color: #56b4e9;
  }

  .region-id.yellow {
    color: #f0e442;
  }

  .region-id.green {
    color: #009e73;
  }

  .region-id.dk-blue {
    color: #0072b2;
  }

  .region-id.red {
    color: #d55e00;
  }

  .region-id.pink {
    color: #cc79a7;
  }

  .region-section ul {
    padding-right: 16px;
    width: 240px;
    display: flex;
  }

  img {
    border: 1px solid transparent;
    height: 32px;
    width: 32px;
  }

  .region-section img {
    height: 100%;
    max-height: 28px;
    max-width: 28px;
    width: 100%;
  }

  .region-section img.solution-item {
    height: unset;
    width: unset;
  }

  img.selected {
    border-color: black;
  }

  img.solution-item {
    padding-top: 4px;
    margin-bottom: -2px;
  }

  .points-cheat-sheet {
    margin-top: 8px;
    max-width: 450px;
  }

  ol > li::marker {
    font-weight: bold;
  }


  .references {
    padding-left: 3rem;
  }

  .references ol {
    margin-top: 0;
    padding-left: 0;
    line-height: 1.35;
  }

  .references img {
    height: 350px;
    width: auto;
  }

  .credits {
    font-size: 12px;
  }
</style>
