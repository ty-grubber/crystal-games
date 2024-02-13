<script>
  import Select, { Option } from '@smui/select';
	import { SPECTATOR } from '../../constants/keyItemLayouts';

  /**
   * @type {{type: string, name: string, items: {id: string, name: string, points: number, regionFound: string}[]}[]}
   */
  export let baskets = [];

  /**
   * @type {boolean}
   */
  export let isActive = true;

  export let onActivatePlayer = () => {};

  /**
   * @type {{regionId: number, name: string, description: string, points: number, items: {id: string, name: string, points: number, regionFound: string}[]}[]}
   */
  export let regionPoints = [];

  /**
	 * @type {number[]}
	 */
  export let revealedRegions = [];

  /**
	 * @type {string}
	 */
  export let playerName;

  /**
   * @type {number}
   */
  let activeRegionIndex = 0;

  /**
   * Set the active region to the region where the clicked item is found, if it has been found
   * @param {string} status
   */
  function handleEmoItemClick(status) {
    if (status.startsWith('found:')) {
      const regionToShow = status.split(':')[1];
      activeRegionIndex = regionPoints.findIndex(rp => rp.regionId.toString() === regionToShow);
    }
  }

  /**
   * Set the active region to the clicked region
   * @param {number} regionIndex
   */
  function handleRegionClick(regionIndex) {
    activeRegionIndex = regionIndex;
  }

  /**
   * Tell the parent to make this player an active player
   * @param {CustomEvent} e
   */
  function handleSwitch(e) {
    // @ts-ignore
    onActivatePlayer(playerName, e?.detail?.value);
  }

  /**
   * Map our basket items to the Spectator Layout items
   */
  $: emoItems = SPECTATOR.map(specItem => {
    let itemStatus = 'missing';
    let currBasket;

    // Find basket where this item is currently located to determine its status
    // @ts-ignore
    if (specItem.extra > 0) {
      const allBasketsItemFoundIn = baskets.filter(basket => basket.items.filter(item => item.id === specItem.id).length > 0);

      // Duplicate items might be in the same basket, so dupe baskets as necessary to make sure we're looking at the correct duplicate item's basket
      // @ts-ignore
      const dupedBaskets = allBasketsItemFoundIn.reduce((acc, curr) => {
        const occurrences = curr.items.filter(item => item.id === specItem.id).length;
        for (let i = 0; i < occurrences; i++) {
          // @ts-ignore
          acc.push({
            ...curr,
          });
        }
        return acc;
      }, []);
      // @ts-ignore
      currBasket = dupedBaskets[specItem.extra];
    } else {
      // Not a duplicate item, so just find the first basket that it appears in
      currBasket = baskets.find(basket => basket.items.find(item => item.id === specItem.id));
    }

    // Determine the item's status based on the type of basket it is found in
    // @ts-ignore
    if (currBasket?.type === 'region') {
      itemStatus = `found:${currBasket.name}`;
    // @ts-ignore
    } else if (currBasket?.type === 'item') {
      itemStatus = 'not-found';
    }

    return {
      ...specItem,
      itemStatus,
    };
  });

  $: totalPointsAvailable = regionPoints.reduce((sum, curr) => {
    return sum + curr.points;
  }, 0);

  $: totalPointsRemaining = baskets.filter(basket => basket.type === 'item').reduce((sum, curr) => {
    return sum + curr.items
      .filter(item => !item.regionFound || item.regionFound === 'P')
      .reduce((itemSum, itemCurr) => itemSum + itemCurr.points, 0);
  }, 0);
</script>

{#if regionPoints && baskets}
  {#if isActive}
    <div class="wrapper">
      <span class="name">{playerName}</span>
      {#each emoItems as emoItem, i (`${emoItem.id}_${i}`)}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="emo-item"
          on:click={() => handleEmoItemClick(emoItem.itemStatus)}
          on:keydown={() => handleEmoItemClick(emoItem.itemStatus)}
        >
          <img
            class={`item-icon ${emoItem.itemStatus.split(':')[0]}`}
            src={`/keyItems/${emoItem.id}.png`}
            alt={emoItem.name}
            title={`${emoItem.name} - ${emoItem.points}pts`}
          />
        </div>
      {/each}
      <div class="progress-info">
        {totalPointsRemaining} / {totalPointsAvailable}
      </div>
      {#each regionPoints as rp, i (`${rp.regionId}_${i}`)}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="region"
          class:active={i === activeRegionIndex}
          on:click={() => handleRegionClick(i)}
          on:keydown={() => handleRegionClick(i)}
        >
          <div class="region-image">
            <img class="region-icon" src={`/regions/${rp.regionId}.png`} alt={rp.name} />
          </div>
          <div class="region-pts-count">
            <span class="region-pts-left" class:recent={rp.regionId === revealedRegions[0]}>
              {revealedRegions.includes(rp.regionId)
                ? rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0)
                : '??'
              }
            </span>
          </div>
        </div>
      {/each}
      {#if activeRegionIndex >= 0}
        <!-- * ar = Active Region -->
        {@const ar = regionPoints[activeRegionIndex]}
        <div class="region-details">
          <div class="region-details-image">
            <img
              class="region-details-icon"
              src={`/regions/${ar.regionId}.png`}
              alt={ar.name}
              title={`Region ${ar.regionId} - ${ar.name}: ${ar.description}`}
            />
          </div>
          <div class="pts-remaining">
            <span class="pts-remaining-text">
              {revealedRegions.includes(ar.regionId)
                ? ar.points - baskets[activeRegionIndex]?.items.reduce((acc, curr) => acc + curr.points, 0)
                : '??'
              }
            </span>
          </div>
          <div
            class="basket-items"
            class:big-list={baskets[activeRegionIndex]?.items.length > 11}
          >
            {#each baskets[activeRegionIndex]?.items as item, itemIndex (`${item.id}_${itemIndex}`)}
              <img
                class="item-icon"
                src={`/keyItems/${item.id}.png`}
                alt={item.name}
                title={`${item.name} - ${item.points}pts`}
              />
            {/each}
          </div>
          <div class="found-region-points">
            {#if baskets[activeRegionIndex]?.items.length > 0}
              {baskets[activeRegionIndex]?.items.reduce((sum, curr) => sum + curr.points, 0)}
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <Select
      label={`${playerName}:  ${totalPointsRemaining} Left, ${revealedRegions.length} RR`}
      on:SMUISelect:change={handleSwitch}
      style="width: 350px;"
      variant="outlined"
    >
      <Option value="0">Set To Left Tracker</Option>
      <Option value="1">Set To Right Tracker</Option>
    </Select>
  {/if}
{/if}

<style>
  .wrapper {
    display: flex;
    flex-wrap: wrap;
    margin: 1rem;
    width: 360px;
  }

  .name {
    flex-basis: 100%;
    font-size: 1.5rem;
    line-height: 2;
  }

  .emo-item, .region-image, .region-pts-count {
    border: 2px solid transparent;
    height: 40px;
    position: relative;
    text-align: center;
    width: 40px;
  }

  .item-icon, .region-icon {
    max-height: 40px;
    max-width: 40px;
    width: 100%;
  }

  .emo-item > .item-icon {
    opacity: 0.3;
  }

  .emo-item > .item-icon.found {
    opacity: 1;
    cursor: pointer;
  }

  .emo-item > .item-icon.missing {
    visibility: hidden;
  }

  .progress-info {
    flex-basis: 37.5%;
    text-align: right;
  }

  .region {
    background-color: #222;
    border: 1px solid white;
    cursor: pointer;
    display: flex;
    flex-basis: 24%;
  }

  .region.active {
    background-color: green;
  }

  .region-pts-count, .progress-info {
    font-size: 1.3rem;
    line-height: 2
  }

  .region-pts-left.recent {
    font-weight: bold;
    text-decoration: underline;
  }

  .region-details {
    border: 3px solid green;
    display: flex;
    flex-basis: 100%;
    max-height: 60px;
    position: relative;
  }

  .region-details-icon {
    width: 60px;
    height: 60px;
  }

  .pts-remaining {
    font-size: 1.5rem;
    line-height: 2.5;
    padding: 0 1rem;
  }

  .basket-items {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    height: 60px;
    object-fit: contain;
    padding-left: 3px;
    width: 230px;
  }

  .basket-items > .item-icon {
    max-height: 28px;
    max-width: 28px;
    padding: 1px;
  }

  .basket-items.big-list > .item-icon {
    max-height: 24px;
    max-width: 24px;
  }

  .found-region-points {
    bottom: 1%;
    font-size: 0.8rem;
    position: absolute;
    right: 2%;
  }
</style>
