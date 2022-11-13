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
  let settingsDialogOpen = true;
  /**
   * @type {boolean}
   */
  let howToDialogOpen = false;
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

    settingsDialogOpen = false;
    chosenSeed = seed;
  }

  function handleStartNewGame() {
    treasures = [];
    selectedRivals = [];
    treasureLocations = [];
    chosenSeed = '';
    settingsDialogOpen = true;
    howToDialogOpen = false;
  }

  function openHowToDialog() {
    howToDialogOpen = true;
  }
</script>

<h1>Pokemon Crystal Hidden Rivals Treasure Hunt</h1>
<Button color="primary" on:click={handleStartNewGame} variant="raised">
  <Label>Start New Game</Label>
</Button>
<Button color="secondary" on:click={openHowToDialog} variant="raised">
  <Label>How To Play</Label>
</Button>
{#if chosenSeed}
  <span>Current seed: {chosenSeed}</span>
{/if}
<Dialog bind:open={settingsDialogOpen} surface$style="width: 850px;">
  <Title id="settingsTitle">Tracker Settings</Title>
  <Content id="settingsContent">
    <SeedGeneratorForm on:startGame={handleStartGame} />
  </Content>
</Dialog>
<Dialog bind:open={howToDialogOpen} slot="over" surface$style="height: 600px;">
  <Title id="howToTitle">How To Play</Title>
  <Content id="howToContent">
    <p>When the page initially loads you will be presented with a dialog to input the settings for the tracker:</p>
    <ul>
      <li><b>Rivals To Defeat:</b> - The number of rivals you need to defeat to win Hidden Rivals. If 0, a list of rivals will not be generated.</li>
      <li><b>Searchable Treasure Locations</b> - The number of possible locations on the map where treasures could be located. This number cannot be smaller than the <b>Number of Treasures</b>.</li>
      <li><b>Number of Treasures</b> - The total number of treasures you need to find. If this and <b>Searchable Treasure Locations</b> are 0, a list of treasure locations will not be generated.</li>
      <li><b>Seed</b> - A string used for randomization purposes. Type one of your choice or click the Randomize Seed button to have one generated for you.</li>
    </ul>

    <h3>Treasure Hunt</h3>

    <p>Treasure Hunt requires you to explore Johto and Kanto to interact with specific NPCs, items or other interactive objects in order to find treasure. Each potential treasure location is listed under the Location column of the tracker. Find all treasures to win!</p>

    <p>If you complete a task where a treasure could be found, check the box in the Found? column of the appropriate row. If there is a treasure there, the Result column will display "TREASURE!!!". If there is not a treasure there, the Result column will display a hint to another location where there is actually treasure. These hints will only double up if there are more non-treasure locations than treasure locations.</p>

    <h3>Hidden Rivals</h3>

    <p>Hidden Rivals is pretty straightforward. The tracker provides a list of trainers that you need to seek out and defeat in battle. When you have defeated all their Pokemon in battle, check the box in the Defeated? column. Check off all boxes to win!</p>

    <p><b>Note:</b> it is recommended to play without randomizing trainer names and class names in Universal Pokemon Randomizer so the trainers in this list are easily verified when fighting them.</p>

    <p><b>Note:</b> some rivals are missable due to various reasons (like plot or defeating a gym leader). These rivals are marked with an `*` so you are aware of this potential to miss them. This `*` assumes that the setting isn't on where all trainers are spinners, but does assume an item randomizer has been applied (so some missable trainers won't actually be missable if you are playing vanilla).</p>
  </Content>
</Dialog>

<Layout rivals={selectedRivals} locations={treasureLocations} treasures={treasures} />
