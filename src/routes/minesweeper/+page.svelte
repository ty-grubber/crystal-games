<script>
  import short from 'short-uuid';
  import Button, { Label } from '@smui/button';
  import TextField from '@smui/textfield';
  import { NATIONAL_DEX } from '../../constants/pokedex';
	import { randomizeArray } from '$lib/randomize';

  let seed = '';
  let monList = NATIONAL_DEX;

  function onRandomize() {
    seed = short.generate().substring(0, 12).toUpperCase();
  }

  function onResetClick() {
    seed = '';
    monList = NATIONAL_DEX;
  }

  function onStartClick() {
    monList = randomizeArray(NATIONAL_DEX, seed);
  }
</script>

<div class="page">
  <h1>Pokémon Crystal Minesweeper</h1>

  <div class="grid">
    <div class="dex">
      {#each monList as pokemon, i (pokemon.id)}
        <div class="dex-mon">
          <img class="mon-icon" src={`/pokedex/${pokemon.id}.png`} alt={pokemon.name} />
        </div>
      {/each}
    </div>
  </div>
  <div class="options">
    <div class="randomizer">
      <TextField variant="outlined" bind:value={seed} label="Seed:" />
      <Button color="secondary" on:click={onRandomize} variant="unelevated">
        <Label>Randomize Seed</Label>
      </Button>
      <br /><br />
      <Button color="primary" on:click={onStartClick} variant="unelevated">
        <Label>Start Game!</Label>
      </Button>
      <Button color="secondary" on:click={onResetClick} variant="unelevated">
        <Label>Reset Grid</Label>
      </Button>
    </div>
  </div>
</div>

<style>
  .grid,
  .options {
    display: inline-flex;
  }

  .dex {
    display: flex;
    flex-wrap: wrap;
    max-width: 700px;
  }

  .dex > .dex-mon {
    max-width: calc(100% / 16);
  }

  .mon-icon {
    width: 100%;
  }
</style>
