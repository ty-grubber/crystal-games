<script>
	import { SPECTATOR } from '../../../constants/keyItemLayouts';
	import REGIONS from '../../../constants/regions';


</script>

<div class="page">
  <div class="wrapper">
    <span class="name">Player Name</span>
    {#each SPECTATOR as item, i (`${item.id}_${i}`)}
      <div class="emo-item">
        <img
          class={`item-icon ${i % 3 === 0 || i % 4 === 0 ? 'found' : ''}`}
          src={`/keyItems/${item.id}.png`}
          alt={item.name}
        />
      </div>
    {/each}
    <div class="progress-info">
      178/359
    </div>
    {#each REGIONS as region, i (`${region.id}_${i}`)}
      <div class={`region ${region.id === 5 ? 'active' : ''}`}>
        <div class="region-image">
          <img class="region-icon" src={`/regions/${region.id}.png`} alt={region.name} />
        </div>
        <div class="region-pts-count">
          <span class={`region-pts-left ${region.id === 8 ? 'recent' : ''}`}>
            {region.id % 3 === 2 ? Math.min(region.id * 4, 32) : '??'}
          </span>
        </div>
      </div>
    {/each}
    <div class="region-details">
      <div class="region-details-image">
        <img class="region-details-icon" src={`/regions/5.png`} alt="Goldenrod" />
      </div>
      <div class="pts-remaining">
        <span class="pts-remaining-text">20</span>
      </div>
      <div class="basket-items">
        <img class="item-icon" src={`/keyItems/boulder_badge.png`} alt="Boulderbadge" />
        <img class="item-icon" src={`/keyItems/hm05.png`} alt="Flash" />
        <img class="item-icon" src={`/keyItems/squirtbottle.png`} alt="Squirtbottle" />
        <img class="item-icon" src={`/keyItems/coin_case.png`} alt="Coin Case" />
      </div>
      <div class="found-region-points">28</div>
    </div>
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-wrap: wrap;
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
  }

  .progress-info {
    flex-basis: 37.5%;
    text-align: right;
  }

  .region {
    background-color: #222;
    border: 1px solid white;
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
    object-fit: contain;
  }

  .basket-items > .item-icon {
    max-height: 28px;
    max-width: 28px;
    padding: 1px;
  }

  .found-region-points {
    bottom: 1%;
    font-size: 0.8rem;
    position: absolute;
    right: 2%;
  }
</style>
