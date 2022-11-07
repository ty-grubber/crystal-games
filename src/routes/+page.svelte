<script>
  import SeedGeneratorForm from '../components/SeedGenerator/Form.svelte';


  /**
	 * @param {{ detail: { gameOptions: {
    * locations: string;
    * treasures: string;
    * seed: string; };
   * }; }} event
	 */
  function handleStartGame(event) {
    const {locations, treasures, seed} = event.detail.gameOptions;
    alert(`Game Options: Locations: ${locations}, Treasures: ${treasures}, Seed: ${seed}`);
  }
</script>

<h1>Pokemon Crystal Hidden Rivals Treasure Hunt</h1>

<SeedGeneratorForm on:startGame={handleStartGame} />
