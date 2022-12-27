<script>
  import short from 'short-uuid';
  import Button, { Label } from '@smui/button';
  import TextField from '@smui/textfield';
  import { NATIONAL_DEX } from '../../constants/pokedex';
	import { randomizeArray } from '$lib/randomize';
	import { convertTo2DArray, flatten2DArray } from '$lib/arrayConversion';

  const GRID_COLUMNS = 16;
  const NUM_MINES = 40;
  const emptyMineList = [0, 0, 0, 0, 0];

  let gridSeed = '';
  let mineSeed = '';
  let monList = NATIONAL_DEX;
  /**
	 * @type {any[]}
	 */
  let mineList = [];

  function onRandomizeGridSeed() {
    gridSeed = short.generate().substring(0, 12).toUpperCase();
  }

  function onRandomizeMineSeed() {
    mineSeed = short.generate().substring(0, 12).toUpperCase();
  }

  function onResetClick() {
    gridSeed = '';
    mineSeed = '';
    monList = NATIONAL_DEX;
    mineList = [];
  }

  function onStartClick() {
    // Build randomized mon list
    monList = randomizeArray(NATIONAL_DEX, gridSeed);

    // Build randomized mine list
    const unshuffledMines = Array(NATIONAL_DEX.length).fill('M', 0, NUM_MINES).fill(0, NUM_MINES);
    const shuffledMines = randomizeArray(unshuffledMines, mineSeed);
    const shuffledMinesWithBlanks = shuffledMines.concat(emptyMineList);

    const mine2DGrid = convertTo2DArray(shuffledMinesWithBlanks, GRID_COLUMNS);

    // Build the hint numbers for the mine list
    for (var row = 0; row < mine2DGrid.length; row++) {
      for (var col = 0; col < GRID_COLUMNS; col++) {
        if (mine2DGrid[row][col] === 'M') {
          const isNotLeftEdgeCol = col - 1 >= 0;
          const isNotRightEdgeCol = col + 1 < GRID_COLUMNS;

          // Current Row
          if (isNotLeftEdgeCol && mine2DGrid[row][col - 1] !== 'M') {
            mine2DGrid[row][col - 1] += 1;
          }
          if (isNotRightEdgeCol && mine2DGrid[row][col + 1] !== 'M') {
            mine2DGrid[row][col + 1] += 1;
          }

          if (row - 1 >= 0) {
            // Previous row exists, so check through valid columns
            if (mine2DGrid[row - 1][col] !== 'M') {
              mine2DGrid[row - 1][col] += 1;
            }
            if (isNotLeftEdgeCol && mine2DGrid[row - 1][col - 1] !== 'M') {
              mine2DGrid[row - 1][col - 1] += 1;
            }
            if (isNotRightEdgeCol && mine2DGrid[row - 1][col + 1] !== 'M') {
              mine2DGrid[row - 1][col + 1] += 1;
            }
          }

          if (row + 1 < mine2DGrid.length) {
            // Next row exists, so check through valid columns
            if (mine2DGrid[row + 1][col] !== 'M') {
              mine2DGrid[row + 1][col] += 1;
            }
            if (isNotLeftEdgeCol && mine2DGrid[row + 1][col - 1] !== 'M') {
              mine2DGrid[row + 1][col - 1] += 1;
            }
            if (isNotRightEdgeCol && mine2DGrid[row + 1][col + 1] !== 'M') {
              mine2DGrid[row + 1][col + 1] += 1;
            }
          }
        }
      }
    }

    mineList = flatten2DArray(mine2DGrid);
  }
</script>

<div class="page">
  <h1>Pokémon Crystal Minesweeper</h1>

  <div class="grid">
    <div class="dex">
      {#each monList as pokemon, i (pokemon.id)}
        <div class={`dex-mon ${mineList[i] === 'M' ? 'mine' : `safe${mineList[i]}`}`}>
          <img class="mon-icon" src={`/pokedex/${pokemon.id}.png`} alt={pokemon.name} />
        </div>
      {/each}
      {#if mineList.length > 0}
        <div class="dex-mon empty">
          {mineList[mineList.length - 5]}
        </div>
        <div class="dex-mon empty">
          {mineList[mineList.length - 4]}
        </div>
        <div class="dex-mon empty">
          {mineList[mineList.length - 3]}
        </div>
        <div class="dex-mon empty">
          {mineList[mineList.length - 2]}
        </div>
        <div class="dex-mon empty">
          {mineList[mineList.length - 1]}
        </div>
      {/if}
    </div>
  </div>
  <div class="options">
    <div class="randomizer">
      <TextField variant="outlined" bind:value={gridSeed} label="Grid Seed:" />
      <Button color="secondary" on:click={onRandomizeGridSeed} variant="unelevated">
        <Label>Randomize Grid Seed</Label>
      </Button>
      <br /><br />
      <TextField variant="outlined" bind:value={mineSeed} label="Mine Seed:" />
      <Button color="secondary" on:click={onRandomizeMineSeed} variant="unelevated">
        <Label>Randomize Mine Seed</Label>
      </Button>
      <br /><br />
      <Button color="primary" on:click={onStartClick} variant="unelevated">
        <Label>Start Game!</Label>
      </Button>
      <Button color="secondary" on:click={onResetClick} variant="unelevated">
        <Label>Reset Grid</Label>
      </Button>
      <br /><br />
      <h2>Actions:</h2>
      <Button style="background-color: #8b0000" variant="unelevated">
        <Label>Flag</Label>
      </Button>
      <br /><br />
      <Button style="background-color: #008b8b" variant="unelevated">
        <Label>Seen</Label>
      </Button>
      <br /><br />
      <Button style="background-color: #daa520" variant="unelevated">
        <Label>Own</Label>
      </Button>
      <br /><br />
      <Button style="background-color: #556b2f" variant="unelevated">
        <Label>Safe</Label>
      </Button>
      <br /><br />
      <Button style="background-color: #8b008b" variant="unelevated">
        <Label>Mine</Label>
      </Button>
      <br /><br />
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
    max-height: 700px;
  }

  .dex > .dex-mon {
    width: calc(100% / 16);
    height: calc(100% / 16);
  }

  .dex-mon.empty {
    font-size: 2rem;
    text-align: center;
    line-height: 1.5;
  }

  .dex-mon.mine {
    background-color: red;
  }

  .dex-mon.safe1 {
    background-color: #111;
  }
  .dex-mon.safe2 {
    background-color: #222;
  }
  .dex-mon.safe3 {
    background-color: #333;
  }
  .dex-mon.safe4 {
    background-color: #444;
  }
  .dex-mon.safe5 {
    background-color: #555;
  }

  .mon-icon {
    width: 100%;
  }
</style>
