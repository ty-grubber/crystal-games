<script>
  import SeedGeneratorForm from '../components/SeedGenerator/Form.svelte';
  import RIVALS from '../constants/rivals';
  import TREASURES from '../constants/treasures';
  import { randomizeArray } from '../lib/randomize';

  /**
	 * @type {any[]}
	 */
  let treasureLocations = [];
  /**
	 * @type {String[]}
	 */
  let treasureIds = [];
  /**
	 * @type {string | any[]}
	 */
  let selectedRivals = [];


  /**
	 * @param {{ detail: { gameOptions: {
    * rivals: string;
    * locations: string;
    * treasures: string;
    * seed: string; };
   * }; }} event
	 */
  function handleStartGame(event) {
    const {rivals, locations, treasures: numTreasures, seed} = event.detail.gameOptions;
    const randomizedTreasures = randomizeArray(TREASURES, seed);

    const searchableLocations = randomizedTreasures.slice(0, parseInt(locations));
    treasureIds = searchableLocations.slice(0, parseInt(numTreasures)).map(location => location.id);

    treasureLocations = randomizeArray(searchableLocations, `${seed}${numTreasures}`);

    const randomizedRivals = randomizeArray(RIVALS, seed);
    selectedRivals = randomizedRivals.slice(0, parseInt(rivals));
  }
</script>

<h1>Pokemon Crystal Hidden Rivals Treasure Hunt</h1>

<SeedGeneratorForm on:startGame={handleStartGame} />
<br /><br />

{#if treasureLocations.length > 0}
<ul>
  {#each treasureLocations as location (location.id) }
  <li class={treasureIds.includes(location.id) ? 'treasure' : 'not-treasure'}>{location.description}</li>
  {/each}
</ul>
{/if}

{#if selectedRivals.length > 0}
<ul>
  {#each selectedRivals as rival (rival.id) }
  <li class="rival">{rival.name}</li>
  {/each}
</ul>
{/if}

<style>
  .treasure {
    color: goldenrod;
  }
  .not-treasure {
    color: darkred;
  }

  .rival {
    color: blueviolet;
  }
</style>
