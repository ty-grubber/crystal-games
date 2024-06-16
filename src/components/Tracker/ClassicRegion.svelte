<script>
  // @ts-nocheck
  import { clickOutside } from '$lib/clickOutside';
  import { getEmptyBasketItem } from '$lib/getEmptyBasketItem';
  import Button, { Label } from '@smui/button';
  import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';
  import GameConnectionInfo from '../References/GameConnectionInfo.svelte';
  import RegionRefs from '../References/RegionRefs.svelte';
  import REGIONS, { regionColorClasses } from '../../constants/regions';

  /**
   * @typedef {import("../../types/PointTracker").Connection} ConnectionInfo
   * @typedef {import("../../types/PointTracker").Basket} Basket
   * @typedef {import("../../types/PointTracker").BasketItem} BasketItem
   * @typedef {import("../../types/PointTracker").Region} Region
   */

  const availableItemsPointCellStyles =
    'width: 65px !important; text-align: center; font-size: 24px;';
  const availableItemsItemCellStyles = 'padding: 0; width: 300px; white-space: normal;';

  /** @type {Region[]} */
  export let regionPoints = [];

  /** @type {Basket[]} */
  export let baskets = [];
  /** @type {number[]} */
  export let revealedRegions = [];

  export let showSolution = false;
  export let revealRegionPoints = false;

  /** @type {ConnectionInfo} */
  export let connectionInfo;
  /** @type {boolean} */
  export let isHost;

  /**
   * @type {function}
   * @param {Basket} originalBasket
   * @param {Basket} targetBasket
   * @param {BasketItem} item
   */
  export let handleCheckToExposeRegion;
  /** @type {function} */
  export let openInGameMenu;
  /** @type {function} */
  export let onDisconnect;
  /** @type {function} */
  export let onReconnect;

  /** @type {string|null} */
  let hoveringOverBasket;
  /** @type {BasketItem & { currBasketIndex: number, currItemIndex: number}} */
  let selectedAvailableItem = getEmptyBasketItem();
  /** @type {BasketItem & { currBasketIndex: number, currItemIndex: number}} */
  let selectedFoundItem = getEmptyBasketItem();

  const keyItemPointValues =
    baskets?.filter(basket => basket.type === 'item').map(basket => basket.name) || [];

  /**
   * @param {DragEvent & { currentTarget: EventTarget & HTMLLIElement; }} event
   * @param {any} basketIndex
   * @param {number} itemIndex
   */
  function dragStart(event, basketIndex, itemIndex) {
    // The data we want to make available when the element is dropped
    // is the index of the item being dragged and
    // the index of the basket from which it is leaving.
    const data = { basketIndex, itemIndex };
    event.dataTransfer?.setData('text/plain', JSON.stringify(data));
  }

  /**
   * @param {DragEvent & { currentTarget: EventTarget & HTMLUListElement; }} event
   * @param {number} basketIndex
   */
  function drop(event, basketIndex) {
    event.preventDefault();
    if (event.dataTransfer) {
      const json = event.dataTransfer.getData('text/plain');
      const origItemLocation = JSON.parse(json);

      let targetBasket = baskets[basketIndex];
      const itemGettingDragged =
        baskets[origItemLocation.basketIndex].items[origItemLocation.itemIndex];

      // Ensure items get dropped into correct available item basket
      if (targetBasket.type === 'item') {
        // Check if item is going into correct item basket and update target basket
        if (itemGettingDragged.points.toString() !== targetBasket.name) {
          targetBasket = baskets.find(
            basket => basket.type === 'item' && basket.name === itemGettingDragged.points.toString()
          ) || targetBasket;
        }
      }

      // Remove the item from the original basket.
      const originalBasket = baskets[origItemLocation.basketIndex];
      const [item] = originalBasket.items.splice(origItemLocation.itemIndex, 1);

      // Add the item to the drop target basket.
      targetBasket.items.push(item);
      baskets = baskets;

      handleCheckToExposeRegion(originalBasket, targetBasket, item);

      hoveringOverBasket = null;
      selectedAvailableItem = getEmptyBasketItem();
      selectedFoundItem = getEmptyBasketItem();
    }
  }

  /**
   * @param {number} basketIndex
   */
  function setSelectedItemIntoBasket(basketIndex) {
    let targetBasket = baskets[basketIndex];
    const itemGettingPlaced = selectedAvailableItem.points
      ? selectedAvailableItem
      : selectedFoundItem;

    if (itemGettingPlaced.points) {
      // Ensure items get dropped into correct available item basket
      if (targetBasket.type === 'item') {
        // Check if item is going into correct item basket and update target basket
        if (itemGettingPlaced.points.toString() !== targetBasket.name) {
          targetBasket = baskets.find(
            basket => basket.type === 'item' && basket.name === itemGettingPlaced.points.toString()
          ) || targetBasket;
        }
      }

      // Remove the item from the original basket.
      const originalBasket = baskets[itemGettingPlaced.currBasketIndex];
      const draggedItemIndexInBasket = baskets[itemGettingPlaced.currBasketIndex].items.findIndex(
        item => item.id === itemGettingPlaced.id
      );
      const [freedItem] = originalBasket.items.splice(draggedItemIndexInBasket, 1);

      // Add the item to the drop target basket.
      targetBasket.items.push(freedItem);
      baskets = baskets;

      handleCheckToExposeRegion(originalBasket, targetBasket, freedItem);
    }

    selectedAvailableItem = getEmptyBasketItem();
    selectedFoundItem = getEmptyBasketItem();
  }

  /**
   * @param {number} basketIndex
   * @param {number} itemIndex
   */
  function toggleHighlightItem(basketIndex, itemIndex) {
    let highlightedItem = {
      ...baskets[basketIndex].items[itemIndex],
    };

    highlightedItem = {
      ...highlightedItem,
      highlighted: !highlightedItem.highlighted,
    };

    baskets[basketIndex].items[itemIndex] = highlightedItem;
    baskets = baskets;
  }

  /**
   * @param {MouseEvent|KeyboardEvent} event
   * @param {BasketItem} item
   * @param {number} currBasketIndex
   * @param {number} currItemIndex
   */
  function handleFoundItemClick(event, item, currBasketIndex, currItemIndex) {
    event.stopPropagation();
    selectedAvailableItem = getEmptyBasketItem();

    if (
      selectedFoundItem?.id === item.id &&
      selectedFoundItem?.currBasketIndex === currBasketIndex &&
      selectedFoundItem?.currItemIndex === currItemIndex
    ) {
      toggleHighlightItem(currBasketIndex, currItemIndex);
      selectedFoundItem = getEmptyBasketItem();
    } else {
      selectedFoundItem = {
        ...item,
        currBasketIndex,
        currItemIndex,
      };
    }
  }

  /**
   * @param {MouseEvent|KeyboardEvent} event
   * @param {BasketItem} item
   * @param {number} currBasketIndex
   * @param {number} currItemIndex
   */
  function handleAvailableItemClick(event, item, currBasketIndex, currItemIndex) {
    event.stopPropagation();
    selectedAvailableItem = {
      ...item,
      currBasketIndex,
      currItemIndex,
    };
    selectedFoundItem = getEmptyBasketItem();
  }

  /**
   * @param {CustomEvent} event
   * @param {number} basketIndex
   * @param {number} itemIndex
   */
  function handleClearItem(event, basketIndex, itemIndex) {
    event.preventDefault();

    const [removedItem] = baskets[basketIndex].items.splice(itemIndex, 1);
    const targetBasket = baskets.find(
      basket => basket.type === 'item' && basket.name === removedItem.points.toString()
    );

    if (targetBasket) {
      // Add the item to the drop target basket.
      targetBasket.items.push(removedItem);
      baskets = baskets;

      handleCheckToExposeRegion(baskets[basketIndex], targetBasket, removedItem);
      selectedAvailableItem = getEmptyBasketItem();
      selectedFoundItem = getEmptyBasketItem();
    }
  }

  /** @param {any} e */
  function handleOutsideRegionTableClick(e) {
    if (
      e.explicitOriginalTarget &&
      e.explicitOriginalTarget.tagName.toLowerCase() !== 'img' &&
      e.explicitOriginalTarget.parentElement.tagName.toLowerCase() !== 'button' &&
      !keyItemPointValues.find(value => value.toString() === e.explicitOriginalTarget.innerHTML)
    ) {
      selectedAvailableItem = getEmptyBasketItem();
      selectedFoundItem = getEmptyBasketItem();
    }
  }

  const totalPointsAvailable = baskets.reduce((sum, curr) => {
    return sum + curr.items.reduce((itemSum, itemCurr) => itemSum + itemCurr.points, 0);
  }, 0);

  $: totalPointsRemaining = baskets
    .filter(basket => basket.type === 'item')
    .reduce((sum, curr) => {
      return sum + curr.items.reduce((itemSum, itemCurr) => itemSum + itemCurr.points, 0);
    }, 0);

  $: totalBadgesFound =
    16 - (baskets.find(basket => basket.type === 'item' && basket.name === '9') || { items: [] }).items.length;
</script>

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
                <span class={`region-id ${regionColorClasses[i % regionColorClasses.length]}`}>
                  {rp.regionId}
                </span>
                - {rp.name}
              </Cell>
              <Cell
                style={`text-align: center; font-size: ${
                  revealedRegions[0] === rp.regionId
                    ? '24px; font-weight: bold; text-decoration: underline green 4px;'
                    : '20px;'
                }`}
              >
                {revealRegionPoints || revealedRegions.includes(rp.regionId)
                  ? rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0)
                  : '??'}
              </Cell>
              <Cell style="white-space: normal; padding-right: 10px; position: relative;">
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <ul
                  class:hovering={hoveringOverBasket === `${baskets[i].type}_${baskets[i].name}`}
                  class:dumpable={(!revealRegionPoints &&
                    !revealedRegions.includes(rp.regionId) &&
                    (selectedAvailableItem?.points > 0 || selectedFoundItem?.points > 0)) ||
                    ((revealRegionPoints || (!revealRegionPoints && revealedRegions.includes(rp.regionId))) &&
                      (selectedAvailableItem?.points > 0 && selectedAvailableItem?.points <=
                        rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0) ||
                      selectedFoundItem?.points > 0 && selectedFoundItem?.points <=
                        rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0))
                    )}
                  on:dragenter={() =>
                    (hoveringOverBasket = `${baskets[i].type}_${baskets[i].name}`)}
                  on:dragleave={() => (hoveringOverBasket = null)}
                  on:drop={e => drop(e, i)}
                  on:click={() => setSelectedItemIntoBasket(i)}
                  on:keypress={() => setSelectedItemIntoBasket(i)}
                  ondragover="return false;"
                >
                  {#each baskets[i].items as item, itemIndex (`${item.id}_${itemIndex}`)}
                    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                    <li
                      class="draggableIcon"
                      draggable={true}
                      on:dragstart={e => dragStart(e, i, itemIndex)}
                      on:click={e => handleFoundItemClick(e, item, i, itemIndex)}
                      on:keypress={e => handleFoundItemClick(e, item, i, itemIndex)}
                      on:contextmenu={e => handleClearItem(e, i, itemIndex)}
                    >
                      <img
                        class:selected={selectedFoundItem?.id === item.id &&
                          selectedFoundItem?.currBasketIndex === i &&
                          selectedFoundItem?.currItemIndex === itemIndex}
                        class:highlighted={item.highlighted}
                        src={`/keyItems/${item.id}.png`}
                        alt={item.name}
                        title={`${item.name} - ${item.points}`}
                      />
                    </li>
                  {/each}
                </ul>
                {#if baskets[i].items.length > 0}
                  <div class="found-region-points">
                    {baskets[i].items.reduce((sum, curr) => sum + curr.points, 0)}
                  </div>
                {/if}
              </Cell>
              {#if showSolution}
                <Cell>
                  {#each rp.items as item, itemIndex (`${item.id}_${itemIndex}`)}
                    <img
                      class="solution-item"
                      src={`/keyItems/${item.id}.png`}
                      alt={item.name}
                      title={`${item.name} - ${item.points}`}
                    />
                  {/each}
                </Cell>
              {/if}
            </Row>
          {/each}
        </Body>
      </DataTable>
      {#if regionPoints}
        <div class="found-info">
          <p style="padding: 5px 0; font-size: 1.25rem;">
            <b>Points Remaining:</b>
            {totalPointsRemaining} / {totalPointsAvailable}
            <br />
            <b>Badges Found:</b>
            {totalBadgesFound}
          </p>
        </div>
        <div class="floating-menu">
          <Button color="primary" on:click={openInGameMenu} variant="raised">
            <Label>Menu</Label>
          </Button>
        </div>
      {/if}
      {#if connectionInfo}
        <GameConnectionInfo {connectionInfo} {isHost} {onDisconnect} {onReconnect} />
      {/if}
    </div>
  </div>
  <div class="available-items-and-refs">
    <DataTable style="width: 350px;">
      <Body>
        {#each baskets.filter(basket => basket.type === 'item') as basket, basketIndex (basket)}
          <Row style="height: 85px !important;">
            <Cell
              style={availableItemsPointCellStyles.concat(
                selectedFoundItem.points?.toString() === basket.name
                  ? ' background-color: lightgreen; cursor: pointer;'
                  : ''
              )}
              on:click={() => setSelectedItemIntoBasket(REGIONS.length + basketIndex)}
              on:keypress={() => setSelectedItemIntoBasket(REGIONS.length + basketIndex)}
            >
              {basket.name}
            </Cell>
            <Cell style={availableItemsItemCellStyles}>
              <ul
                class:hovering={hoveringOverBasket === `${basket.type}_${basket.name}`}
                on:dragenter={() => (hoveringOverBasket = `${basket.type}_${basket.name}`)}
                on:dragleave={() => (hoveringOverBasket = null)}
                on:drop={event => drop(event, REGIONS.length + basketIndex)}
                ondragover="return false;"
              >
                {#each basket.items as item, itemIndex (`${item.id}_${itemIndex}`)}
                  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                  <li
                    class="draggableIcon"
                    draggable={true}
                    on:dragstart={event =>
                      dragStart(event, REGIONS.length + basketIndex, itemIndex)}
                    on:click={e =>
                      handleAvailableItemClick(e, item, REGIONS.length + basketIndex, itemIndex)}
                    on:keypress={e =>
                      handleAvailableItemClick(e, item, REGIONS.length + basketIndex, itemIndex)}
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
    <RegionRefs />
  </div>
</div>

<style>
  .grid-area {
    display: inline-flex;
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

  @media (prefers-color-scheme: dark) {
    .region-section .region-id {
      text-shadow: none;
    }
  }

  .region-id.black {
    color: #000000;
  }

  @media (prefers-color-scheme: dark) {
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
    object-fit: contain;
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

  .found-region-points {
    bottom: 1%;
    font-size: 0.8rem;
    position: absolute;
    right: 1%;
  }

  img.highlighted {
    border-color: orangered;
  }

  img.selected {
    border-color: black;
  }

  img.solution-item {
    padding-top: 4px;
    margin-bottom: -2px;
  }

  .available-items-and-refs {
    margin-left: 2.5rem;
  }

  .floating-menu {
    position: absolute;
    top: 1%;
    right: 1%;
    z-index: 10;
  }

  @media (max-width: 1024px) {
    .floating-menu {
      position: unset;
      margin-top: 1rem;
    }
  }
</style>
