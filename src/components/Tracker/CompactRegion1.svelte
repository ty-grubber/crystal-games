<script>
  // @ts-nocheck
  export let baskets = [];
  export let regionPoints = [];
  export let revealedRegions = [];
  export let revealRegionPoints = false;

</script>
<div class="container">
  <div class="region-boxes">
    {#each regionPoints as rp, i (rp.regionId)}
      <div class={`box ${revealedRegions[0] === rp.regionId ? 'new-revealed' : ''}`}>
        <div class="region-id">
          <img
            src={`/regions/${rp.regionId}.png`}
            alt={`Region ${rp.regionId} - ${rp.name}`}
            title={`Region ${rp.regionId} - ${rp.name}`}
          />
        </div>
        <div class="side-section">
          <div class="selector">{rp.regionId}</div>
          <div class="remaining">
            {(revealRegionPoints || revealedRegions.includes(rp.regionId))
              ? rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0)
              : '??'
            }
          </div>
        </div>
        <div class={`items ${baskets[i].items.length > 13 ? 'big-list' : ''}`}>
          {#each baskets[i].items as item, itemIndex (`${item.id}_${itemIndex}`)}
            <img
              src={`/keyItems/${item.id}.png`}
              alt={item.name}
              class="icon"
              title={`${item.name} - ${item.points}`}
            />
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
<br />
<div class="item-tracker">
  {#each baskets.filter(basket => basket.type === 'item') as itemBasket (itemBasket)}
    <div class="item-row">
      {#each itemBasket.items as item, itemIndex (`${item.id}_${itemIndex}`)}
        <div class="item-wrapper">
          <img src={`/keyItems/${item.id}.png`} alt={item.name} title={`${item.name} - ${item.points}`} class="icon" />
        </div>
      {/each}
    </div>
  {/each}
  <div class="item-wrapper">
    <img src="/keyItems/hm01.png" alt="Cut" title="Cut - 7" class="icon owned" />
    <span class="region-found">14</span>
  </div>
  <div class="item-wrapper">
    <img src="/keyItems/hm01.png" alt="Cut" title="Cut - 7" class="icon owned" />
    <span class="region-found">14</span>
  </div>
  <div class="item-wrapper">
    <img src="/keyItems/hm01.png" alt="Cut" title="Cut - 7" class="icon owned" />
    <span class="region-found">14</span>
  </div>
</div>

<style>
  .container {
    display: flex;
  }

  .region-boxes {
    display: flex;
    flex-wrap: wrap;
    max-width: 620px;
  }

  .box {
    border: 2px solid #444;
    display: flex;
    flex-basis: calc(50% - 4px);
    max-height: 60px;
    max-width: 300px;
    position: relative;
    text-align: center;
  }

  .box.new-revealed {
    border-color: green;
  }

  .box.new-revealed .remaining {
    font-weight: bold;
    color: green;
    text-decoration: underline 4px;
  }

  .region-id {
    display: flex;
    flex: 0 0 auto;
    width: 60px;
  }

  .region-id > img {
    object-fit: scale-down;
  }

  .side-section {
    width: 30px;
  }

  .side-section > div {
    font-size: 1.5rem;
  }

  .items {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    height: 60px;
    object-fit: contain;
    padding-left: 5px;
    width: 205px;
  }

  .items > img {
    max-height: 28px;
    max-width: 28px;
  }

  .items.big-list > img {
    max-height: 24px;
    max-width: 24px;
  }

  .item-tracker {
    max-width: 610px;
  }

  .item-tracker .item-row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 0 15px;
    width: 100%;
  }

  .item-tracker .item-wrapper {
    position: relative;
  }

  .item-tracker .icon {
    display: inline-block;
    max-height: 32px;
    max-width: 32px;
    padding: 0 3px;
    opacity: 0.3;
  }

  .item-tracker .icon.owned {
    opacity: 1;
    position: relative;
  }

  .item-tracker .region-found {
    background-color: black;
    color: white;
    font-size: 0.6rem;
    padding: 2px;
    position: absolute;
    right: 2%;
  }
</style>
