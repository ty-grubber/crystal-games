<script>
// @ts-nocheck
  import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
	import extractRegionsFromSpoiler from '$lib/extractRegionsFromSpoiler';
	import REGIONS from '../../constants/regions';
	import { BLUE_CARD_KEY_ITEM, COIN_CASE_KEY_ITEM, KEY_ITEMS_3PTS, KEY_ITEMS_5PTS, KEY_ITEMS_7PTS, KEY_ITEMS_9PTS } from '../../constants/keyItems';

  const availableItemsPointCellStyles = "width: 65px !important; padding: 5px; text-align: center; font-size: 24px;";
  const availableItemsItemCellStyles = "padding: 10px 0; width: 300px; white-space: normal;"

  const regionColors = [
    '#000000',
    '#e69f00',
    '#56b4e9',
    '#f0e442',
    '#009e73',
    '#0072b2',
    '#d55e00',
    '#cc79a7',
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
  let showSolution = false;
  let howToDialogOpen = false;
  let mapSelected = 'johto';

  /**
	 * @param {any} e
	 */
  async function handleSpoilerFileChange(e) {
    const file = e.target.files[0];
    if (file != null) {
      const spoilerText = await file.text();

      const extraction = extractRegionsFromSpoiler(spoilerText);
      regionPoints = extraction.regionPointsArray;

      const fivePointItems = KEY_ITEMS_5PTS.map(item => item);
      const threePointItems = KEY_ITEMS_3PTS.map(item => item);
      if (extraction.blueCardImportant) {
        fivePointItems.push({ ...BLUE_CARD_KEY_ITEM, points: 5 });
      } else {
        threePointItems.push(BLUE_CARD_KEY_ITEM);
      }

      if (extraction.coinCaseImportant) {
        fivePointItems.push({ ...COIN_CASE_KEY_ITEM, points: 5 });
      } else {
        threePointItems.push(COIN_CASE_KEY_ITEM);
      }

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
        { type: 'item', name: '9', items: KEY_ITEMS_9PTS.map(item => item)}, // use mapping so we don't overwrite array
        { type: 'item', name: '7', items: KEY_ITEMS_7PTS.map(item => item)},
        { type: 'item', name: '5', items: fivePointItems},
        { type: 'item', name: '3', items: threePointItems},
      ];

      // Check if we have extra items to add to the starting buckets
      if (extraction.extraItems.length > 0) {
        extraction.extraItems.forEach(item => {
          const extraItemBasket = newBaskets.find(basket => basket.type === 'item' && basket.name === item.points.toString());
          // Place extra item beside its duplicate in the basket
          const placementIndex = extraItemBasket.items.findIndex(defaultItem => defaultItem.id === item.id);
          extraItemBasket.items.splice(placementIndex, 0, item);
        });
      }

      baskets = newBaskets;
    }
  }

  function handleShowSolution() {
    showSolution = !showSolution;
  }

  function openHowToDialog() {
    howToDialogOpen = true;
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
      const [item] = baskets[origItemLocation.basketIndex].items.splice(origItemLocation.itemIndex, 1);

      // Add the item to the drop target basket.
      targetBasket.items.push(item);
      baskets = baskets;

      hoveringOverBasket = null;
    }
	}
</script>

<div class="page">
  {#if !regionPoints}
    <h1>Pokémon Crystal Points Tracker (for Item Randomizer v7.1.13)</h1>
  {/if}

  <label for="spoiler">
    {!regionPoints ? 'Upload spoiler file (.txt):' : 'Spoiler Uploaded!'}
  </label>
  <input
    id="spoiler"
    accept=".txt"
    type="file"
    on:change={handleSpoilerFileChange}
    style="margin-right: 1rem;"
  />
  <Button color="primary" on:click={openHowToDialog} variant="raised">
    <Label>How To Play</Label>
  </Button>
  <Button color="secondary" href="/" variant="outlined">
    <Label>Games Home</Label>
  </Button>
  <br /><br />

  <Dialog bind:open={howToDialogOpen} slot="over" surface$style="height: 700px">
    <Title id="howToTitle">How To Use The Points Hint Tracker</Title>
    <Content id="howToContent">
      <p>
        The Points Hint Tracker is a different way to play your Pokémon Crystal Randomizer as it gives you hints as to where Key Items are located in your ROM. This tracker handles any logic settings, including Shopsanity and Nightmare modes, but it does assume that your goal is to beat Red.
      </p>

      <p>In order to start the tracker, you will need to upload the Spoiler log you received when you generated your rom through the Item Randomizer v7.1.13. The upload process will log each Key Item into a region based on where the randomizer placed it in the ROM. If a Key Item has not been randomized (ie. does not appear in the spoiler log), the tracker assumes that the Key Item has been placed in its vanilla location. Each Key Item has been assigned a point value based on its usefulness to defeating Red:</p>
      <ul>
        <li><b>9 Points:</b> Badges</li>
        <li><b>7 Points:</b> HMs and PokéGear Items (excluding Map Card)</li>
        <li><b>5 Points:</b> Any other Key Item that unlocks additional checks, like Escape Rope, Rock Smash, or Basement Key</li>
        <li><b>3 Points:</b> Useless Key Items that don't provide checks, like Silver Wing, Blue Card, or Rods</li>
      </ul>

      <p>
        Once the upload is complete, a table will appear with each row being a region where a key item could be placed in the ROM. Beside the name of each region is the total number of points of Key Items contained in that region, as well as an empty space for you to put found items in.
      </p>
      <p>
        As well, a table containing the remaining available Key Items will be located on the right including the point value of each Key Item. Underneath this table you will find a more descriptive list of all the locations in Pokémon Crystal and what region number they have been placed in. If a city is listed in a region, then any subareas within that city are also included in that region. For example, Tin Tower is located in Ecruteak City, so item locations in Tin Tower are a part of Region #6.
      </p>
      <p>
        As you play your ROM, you can note the region where you found a Key Item by dragging the item's icon from the items table on the right into the appropriate region slot on the table on the left. For example, if you found the Boulder Badge in Cherrygrove Mart, drag the Boulder Badge icon from the 9 row of the right items table into Region #1's row on the table on the left.
        <br />
        You can note, that when you drop the icon into the table, the Points Left value of that region will decrease based on the value of the item you placed there. If you ever make a mistake, you can always freely drag icons from region rows to other region rows, or even back to the available items table on the right.
      </p>

      <p>
        If you are unsure what item an icon represents, simply hover your mouse over the icon and a tooltip should display with the item's name and how many points it is worth.
      </p>
      <p>
        At any time, you can peek the solution of the tracker by clicking the Show Solution button underneath the Region table. This will cause an extra column to display in the Region table showing which region each Key Item can be found in. <b>Note: </b> if you have progressive Rods turned on, the Rod icons might be in different Regions in the solution compared to where you found them, but they're all worth the same number of points anyway.
      </p>
      <p>
        To start a new game, simply upload a new spoiler file and the tables will reset.
      </p>
    </Content>
    <Actions>
      <Button>Close</Button>
    </Actions>
  </Dialog>

  {#if regionPoints?.length > 0}
    <div class="grid-area">
      <div class="points-table">
        <DataTable>
          <Head>
            <Row>
              <Cell>Region</Cell>
              <Cell>Points Left</Cell>
              <Cell>Items Found</Cell>
              {#if showSolution}
                <Cell>Solution</Cell>
              {/if}
            </Row>
          </Head>
          <Body>
            {#each regionPoints as rp, i (rp.regionId)}
              <Row>
                  <Cell style={`font-size: 16px; font-weight: bold`}>
                    <span style={`font-size: 20px; text-shadow: 0.5px 0.5px black; color: ${regionColors[i % regionColors.length]}`}>{rp.regionId}</span> - {rp.name}
                  </Cell>
                  <Cell style="text-align: center; font-size: 20px;">
                    {rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0)}
                  </Cell>
                  <Cell style="white-space: normal;">
                    <ul
                      class:hovering={hoveringOverBasket === `${baskets[i].type}_${baskets[i].name}`}
                      on:dragenter={() => hoveringOverBasket = `${baskets[i].type}_${baskets[i].name}`}
                      on:dragleave={() => hoveringOverBasket = null}
                      on:drop={event => drop(event, i)}
                      ondragover="return false;"
                    >
                      {#each baskets[i].items as item, itemIndex (`${item.id}_${itemIndex}`)}
                        <li
                          class="draggableIcon"
                          draggable={true}
                          on:dragstart={event => dragStart(event, i, itemIndex)}
                        >
                          <img src={`/keyItems/${item.id}.png`} alt={item.name} title={`${item.name} - ${item.points}`} />
                        </li>
                      {/each}
                    </ul>
                  </Cell>
                  {#if showSolution}
                    <Cell>
                      {#each rp.items as item, itemIndex (`${item.id}_${itemIndex}`)}
                        <img src={`/keyItems/${item.id}.png`} alt={item.name} title={`${item.name} - ${item.points}`} />
                      {/each}
                    </Cell>
                  {/if}
              </Row>
            {/each}
          </Body>
        </DataTable>
        <br /><br />
        <Button color="primary" variant="raised" on:click={handleShowSolution}>
          <Label>{showSolution ? 'Hide' : 'Show'} Solution</Label>
        </Button>
      </div>
      <div class="available-items">
        <DataTable style="width: 350px; margin-left: 3rem;">
          <Body>
            {#each baskets.filter(basket => basket.type === 'item') as basket, basketIndex (basket)}
              <Row>
                <Cell style={availableItemsPointCellStyles}>{basket.name}</Cell>
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
                      >
                        <img src={`/keyItems/${item.id}.png`} alt={item.name} title={`${item.name} - ${item.points}`} />
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

  .hovering {
		background-color: lightgrey;
	}
	.grid-area li.draggableIcon {
		cursor: grab;
		display: inline-block;
	}
  .grid-area ul {
    margin: 0;
    max-width: 260px;
    min-height: 32px;
    padding: 4px 0 0;
	}

  .points-table ul {
    width: 200px;
  }

  img {
    height: 32px;
    width: 32px;
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
  }

  .references img {
    height: auto;
    width: 375px;
  }
</style>
