<script>
	import REGIONS from '../../constants/regions';
  import Button, { Label } from '@smui/button';
  export let includeTextRegions = true;
  export let hideTitle = false;
  let mapSelected = 'johto';
</script>

<div class="references">
  {#if !hideTitle}
    <b style="font-size:18px;">References</b>
  {/if}
  <br />
  <Button color="primary" on:click={() => mapSelected = 'johto'} style={`text-decoration: ${mapSelected === 'johto' ? 'underline' : 'none'}`}>
    <Label>Johto Map</Label>
  </Button>
  <Button color="primary" on:click={() => mapSelected = 'kanto'} style={`text-decoration: ${mapSelected === 'kanto' ? 'underline' : 'none'}`}>
    <Label>Kanto Map</Label>
  </Button>
  {#if includeTextRegions}
    <Button color="primary" on:click={() => mapSelected = 'text'} style={`text-decoration: ${mapSelected === 'text' ? 'underline' : 'none'}`}>
      <Label>Text Regions</Label>
    </Button>
  {/if}
  <Button color="primary" on:click={() => mapSelected = 'points'} style={`text-decoration: ${mapSelected === 'points' ? 'underline' : 'none'}`}>
    <Label>Point Sums</Label>
  </Button>
  <br />
  {#if mapSelected === 'text'}
    <ol start="1" type="1">
      {#each REGIONS as region (region.id)}
        <li>{region.description}</li>
      {/each}
    </ol>
  {:else if mapSelected === 'points'}
    <ol start="6" type="1" class="points-cheat-sheet">
      <li> 33</li>
      <li> 7</li>
      <li> 35</li>
      <li> 333 | 9</li>
      <li> 55 | 37</li>
      <li> 335</li>
      <li> 3333 | 39 | 57</li>
      <li> 337 | 355</li>
      <li> 3335 | 59 | 77</li>
      <li> 35 | 339 | 357 | 555</li>
      <li> 3337 | 3355 | 79</li>
      <li> 33335 | 359 | 377 | 557</li>
      <li> 333333 | 3339 | 3555 | 3357 | 99</li>
      <li> 33337 | 33355 | 379 | 559 | 577</li>
    </ol>
  {:else}
    <img src={`/maps/${mapSelected}-points-region-map.png`} alt={`Points region map of ${mapSelected}`} />
  {/if}
</div>

<style>
  .points-cheat-sheet {
    margin-top: 8px;
    max-width: 450px;
  }

  .references ol {
    margin-top: 0;
    padding-left: 3rem;
    line-height: 1.35;
  }

  .references img {
    height: 325px;
    width: auto;
  }

  ol > li::marker {
    font-weight: bold;
  }
</style>
