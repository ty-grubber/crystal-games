<script>
  import Layout from '../components/Tracker/Layout.svelte';
  import SeedGeneratorForm from '../components/SeedGenerator/Form.svelte';
  import RIVALS from '../constants/rivals';
  import TREASURES from '../constants/treasures';
  import { randomizeArray } from '../lib/randomize';

  /**
	 * @type {any[]}
	 */
  let treasureLocations = [];
  /**
	 * @type {any[]}
	 */
  let treasures = [];
  /**
	 * @type {any[]}
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
    treasures = searchableLocations.slice(0, parseInt(numTreasures));

    treasureLocations = randomizeArray(searchableLocations, `${seed}${numTreasures}`);

    const randomizedRivals = randomizeArray(RIVALS, seed);
    selectedRivals = randomizedRivals.slice(0, parseInt(rivals));
  }
</script>

<h1>Pokemon Crystal Hidden Rivals Treasure Hunt</h1>

<SeedGeneratorForm on:startGame={handleStartGame} />
<br /><br />

<Layout rivals={selectedRivals} locations={treasureLocations} treasures={treasures} />

<style>
  h1 {
    font-family: 'Roboto', 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  }
</style>
