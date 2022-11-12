<script>
  import Button, { Label } from '@smui/button';
  import Dialog, { Content, Title } from '@smui/dialog';
  import SeedGeneratorForm from '../components/SeedGenerator/Form.svelte';
  import Layout from '../components/Tracker/Layout.svelte';
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
   * @type {boolean}
   */
  let dialogOpen = true;
  /**
   * @type {string}
   */
  let chosenSeed;


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
    const generatedSeed = `${seed}-R${rivals}-L${locations}-T${numTreasures}`;
    const randomizedTreasures = randomizeArray(TREASURES, generatedSeed);

    const searchableLocations = randomizedTreasures.slice(0, parseInt(locations));
    treasures = searchableLocations.slice(0, parseInt(numTreasures));

    treasureLocations = randomizeArray(searchableLocations, generatedSeed);

    const randomizedRivals = randomizeArray(RIVALS, generatedSeed);
    selectedRivals = randomizedRivals.slice(0, parseInt(rivals));
    // TODO: Should we auto-sort the rivals if it gets over a certain amount?

    dialogOpen = false;
    chosenSeed = seed;
  }

  function handleStartNewGame() {
    treasures = [];
    selectedRivals = [];
    treasureLocations = [];
    chosenSeed = '';
    dialogOpen = true;
  }
</script>

<h1>Pokemon Crystal Hidden Rivals Treasure Hunt</h1>
<Button color="primary" on:click={handleStartNewGame} variant="raised">
  <Label>Start New Game</Label>
</Button>
{#if chosenSeed}
  <span>Current seed: {chosenSeed}</span>
{/if}
<Dialog bind:open={dialogOpen} surface$style="width: 850px;">
  <Title id="settingsTitle">Tracker Settings</Title>
  <Content id="settingsContent">
    <SeedGeneratorForm on:startGame={handleStartGame} />
  </Content>
</Dialog>

<Layout rivals={selectedRivals} locations={treasureLocations} treasures={treasures} />
