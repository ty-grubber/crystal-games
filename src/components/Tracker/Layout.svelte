<script>
	import { randomizeArray } from '$lib/randomize';


  /**
	 * @type {any[]}
	 */
  export let rivals = [];
  /**
	 * @type {any[]}
	 */
  export let locations = [];
/**
 * @type {any[]}
 */
  export let treasures = [];

  /**
	 * @type {any[]}
	 */
   let formattedLocations = [];
  $: {
    const treasureIds = treasures.map(treasure => treasure.id)
    const treasureIdSeed = treasureIds.join(',');
    const randomizedTreasures = randomizeArray(treasures, treasureIdSeed);

    const nonTreasureLocations = locations.filter(location => !treasureIds.includes(location.id));
    const randomizedNonTreasureLocationIds = randomizeArray(nonTreasureLocations, treasureIdSeed).map(l => l.id);

    formattedLocations = locations.map(location => ({
      id: location.id,
      description: location.description,
      found: false,
      result:
        treasureIds.includes(location.id)
        ? 'TREASURE!!!'
        : randomizedTreasures[randomizedNonTreasureLocationIds.findIndex(id => location.id === id)].hintOpts[Math.floor((Math.random() * 100)) % 2],
    }));
  };


  /**
	 * @param {number} locationIndex
	 */
  function handleCheckboxClick(locationIndex) {
    formattedLocations[locationIndex].found = !formattedLocations[locationIndex].found;
  }
</script>

<div class="container">
  {#if formattedLocations.length > 0}
    <h2>Treasure Hunt</h2>

    <div class="tracker-container treasure">
      <div class="tracker-heading location">Location</div>
      <div class="tracker-heading checkbox">Found?</div>
      <div class="tracker-heading name">Result</div>
      <div class="tracker-end-row" />
      {#each formattedLocations as location, i (location.id)}
        <div class="tracker-row location">
          <label for={`location${location.id}`}><span>{location.description}</span></label>
        </div>
        <div class="tracker-row checkbox">
          <input
            type=checkbox
            id={`location${location.id}`}
            checked={location.found}
            on:click={() => handleCheckboxClick(i)}
          />
        </div>
        <div class="tracker-row name">
          <span class={`${!location.found && 'hidden'}`}>
            <span class={`${location.result === 'TREASURE!!!' && 'gold'}`}>{location.result}</span>
          </span>
        </div>
        <div class="tracker-end-row" />
      {/each}
    </div>
  {/if}
  {#if rivals.length > 0}
    <h2>Hidden Rivals</h2>

    <div class="tracker-container">
      <div class="tracker-heading location">Location</div>
      <div class="tracker-heading name">Trainer</div>
      <div class="tracker-heading checkbox">Defeated?</div>
      <div class="tracker-end-row" />
      {#each rivals as rival (rival.id)}
        <div class="tracker-row location"><span>{rival.location}</span></div>
        <div class="tracker-row name">
          <label for={`rival${rival.id}`}><span>{rival.name}</span></label>
        </div>
        <div class="tracker-row checkbox">
          <input type=checkbox id={`rival${rival.id}`} />
        </div>
        <div class="tracker-end-row" />
      {/each}
    </div>
  {/if}
</div>

<style>
  .tracker-container {
    display: flex;
    flex-wrap: wrap;
    font-size: 1.25rem;
    line-height: 1.25;
  }

  .tracker-container > div {
    padding: 0.25rem 0.2rem;
  }

  .tracker-container > .location {
    width: 250px;
  }

  .tracker-container.treasure > .location {
    width: 200px;
  }

  .tracker-container > .name {
    width: 200px;
  }

  .tracker-container.treasure > .name {
    min-width: 250px;
    width: unset;
  }

  .tracker-container > .checkbox {
    width: 75px;
    text-align: center;
  }

  .tracker-row span {
    vertical-align: middle;
  }

  .checkbox > input {
    height: 25px;
    width: 25px;
    vertical-align: middle;
  }

  .tracker-end-row {
    width: 100%;
  }

  .tracker-heading {
    font-weight: bold;
  }

  .hidden {
    visibility: hidden;
  }

  .gold {
    color: goldenrod;
    font-weight: bold;
  }
</style>
