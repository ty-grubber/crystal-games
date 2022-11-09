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

<Layout rivals={selectedRivals} />

