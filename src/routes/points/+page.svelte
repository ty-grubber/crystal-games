<script>
// @ts-nocheck
  import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';
  import Button, { Label } from '@smui/button';
  import { flip } from 'svelte/animate';
	import extractRegionsFromSpoiler from '$lib/extractRegionsFromSpoiler';
	import { KEY_ITEMS_3PTS, KEY_ITEMS_5PTS, KEY_ITEMS_7PTS, KEY_ITEMS_9PTS } from '../../constants/keyItems';
	import REGIONS from '../../constants/regions';

  const availableItemsPointCellStyles = "width: 65px !important; padding: 5px; text-align: center; font-size: 24px;";
  const availableItemsItemCellStyles = "padding: 10px 0; width: 300px; white-space: normal;"

  const defaultBaskets = [
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
    { type: 'item', name: '9', items: KEY_ITEMS_9PTS},
    { type: 'item', name: '7', items: KEY_ITEMS_7PTS},
    { type: 'item', name: '5', items: KEY_ITEMS_5PTS},
    { type: 'item', name: '3', items: KEY_ITEMS_3PTS},
  ];

  /**
	 * @type {{ regionId: number; points: number; items: any[]; }[]}
	 */
  let regionPoints;

  /**
   * @type {null | string}
   */
  let hoveringOverBasket;
  let baskets = defaultBaskets;
  let showSolution = false;

  /**
	 * @param {any} e
	 */
  async function handleSpoilerFileChange(e) {
    const file = e.target.files[0];
    if (file != null) {
      const spoilerText = await file.text();
      regionPoints = extractRegionsFromSpoiler(spoilerText);
      baskets = defaultBaskets;
    }
  }

  function handleShowSolution() {
    showSolution = !showSolution;
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
  <h1>Pokémon Crystal Points Tracker</h1>

  <label for="many">Upload spoiler file (.txt):</label>
  <input
    id="spoiler"
    accept=".txt"
    type="file"
    on:change={handleSpoilerFileChange}
  />
  <br /><br />

  {#if regionPoints?.length > 0}
    <div class="grid-area">
      <div class="points-table">
        <DataTable>
          <Head>
            <Row>
              <Cell>Region #</Cell>
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
                  <Cell style="text-align: center; font-size: 24px;"><b>{rp.regionId}<b></b></Cell>
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
                      {#each baskets[i].items as item, itemIndex (item)}
                        <li
                          draggable={true}
                          on:dragstart={event => dragStart(event, i, itemIndex)}
                        >
                          <img src={`/keyItems/${item.id}.png`} alt={item.name} title={item.name} />
                        </li>
                      {/each}
                    </ul>
                  </Cell>
                  {#if showSolution}
                    <Cell>
                      {#each rp.items as item (item.id)}
                        <img src={`/keyItems/${item.id}.png`} alt={item.name} title={item.name} />
                      {/each}
                    </Cell>
                  {/if}
              </Row>
            {/each}
          </Body>
        </DataTable>
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
                    {#each basket.items as item, itemIndex (item)}
                      <li
                        draggable={true}
                        on:dragstart={event => dragStart(event, REGIONS.length + basketIndex, itemIndex)}
                      >
                        <img src={`/keyItems/${item.id}.png`} alt={item.name} title={item.name} />
                      </li>
                    {/each}
                  </ul>
                </Cell>
              </Row>
            {/each}
          </Body>
        </DataTable>
      </div>
    </div>
    <br /><br />
    <Button color="primary" variant="raised" on:click={handleShowSolution}>
      <Label>{showSolution ? 'Hide' : 'Show'} Solution</Label>
    </Button>
  {/if}
</div>

<style>
  .grid-area {
    display: inline-flex;
  }

  .hovering {
		background-color: lightgrey;
	}
	li {
		cursor: grab;
		display: inline-block;
	}
  ul {
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
</style>
