<script>
  import SeedGeneratorForm from '../components/SeedGenerator/Form.svelte';
  import { randomizeArray } from '../lib/randomize';
  import TREASURES from '../constants/treasures';

  /**
	 * @type {any[]}
	 */
  let treasureLocations = [];
  /**
	 * @type {String[]}
	 */
  let treasureIds = [];


  /**
	 * @param {{ detail: { gameOptions: {
    * locations: string;
    * treasures: string;
    * seed: string; };
   * }; }} event
	 */
  function handleStartGame(event) {
    const {locations, treasures: numTreasures, seed} = event.detail.gameOptions;
    const randomizedTreasures = randomizeArray(TREASURES, seed);

    const searchableLocations = randomizedTreasures.slice(0, parseInt(locations));
    treasureIds = searchableLocations.slice(0, parseInt(numTreasures)).map(location => location.id);

    treasureLocations = randomizeArray(searchableLocations, `${seed}${numTreasures}`);
  }
</script>

<h1>Pokemon Crystal Hidden Rivals Treasure Hunt</h1>

<SeedGeneratorForm on:startGame={handleStartGame} />
<br /><br />

<ul>
  {#each treasureLocations as location (location.id) }
  <li class={treasureIds.includes(location.id) ? 'treasure' : 'not-treasure'}>{location.description}</li>
  {/each}
</ul>

<style>
  .treasure {
    color: goldenrod;
  }
  .not-treasure {
    color: darkred;
  }
</style>
