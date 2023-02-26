<script>
	import extractRegionsFromSpoiler from '$lib/extractRegionsFromSpoiler';


  /**
	 * @type {File}
	 */
  let spoilerFile;
  let spoilerExtracted = false;
  let regionPoints = [];

  $: if (spoilerFile && !spoilerExtracted) {
    regionPoints = extractRegionsFromSpoiler(spoilerFile);
  }
</script>

<div class="page">
  <h1>Pokémon Crystal Points Tracker</h1>

  <p>Under construction!</p>

  <label for="many">Upload multiple files of any type:</label>
  <input
    bind:value={spoilerFile}
    id="spoiler"
    type="file"
  />
</div>
