<script>
  // TODO: make right-click auto-flag cell
  // TODO: add field to set number of mines
  // TODO: add field to set number of columns or mons
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
  /**
   * @type {string[]}
   */
  let statusList = [];
  let monList = NATIONAL_DEX;
  /**
	 * @type {any[]}
	 */
  let mineList = [];

  /**
	 * @type {TextField}
	 */
  let searchInput;
  /**
	 * @type {TextField}
	 */
  let gridSeedInput;
  /**
	 * @type {TextField}
	 */
  let mineSeedInput;
  let searchTerm = '';
  let searchFocussed = false;
  let gridSeedFocussed = false;
  let mineSeedFocussed = false;
  let selectedMonIndex = -1;

  function onRandomizeGridSeed() {
    gridSeed = short.generate().substring(0, 12).toUpperCase();
  }

  function onRandomizeMineSeed() {
    mineSeed = short.generate().substring(0, 12).toUpperCase();
  }

  /**
	 * @param {{ which: any; keyCode: any; }} e
	 */
  function updateSearch(e) {
    const keyCode = e.which || e.keyCode;
    // valid keys are letters, numbers, dash, apostrophe or period;
    const validKeyPressed = (keyCode >= 48 && keyCode <= 90) || keyCode === 222 || keyCode === 189 || keyCode === 190;
    if (!searchFocussed && !gridSeedFocussed && !mineSeedFocussed && validKeyPressed) {
      searchInput.focus();
    } else if (keyCode === 27) {
      searchInput.blur();
      searchTerm = '';
    }
  }

  /**
	 * @param {any} e
	 */
  function searchKeyDown(e) {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 27) {
      searchTerm = '';
      searchInput.blur();
    }
  }

  /**
	 * @param {number} index
	 */
  function selectMon(index) {
    selectedMonIndex = index;
  }

  /**
	 * @param {string} status
	 */
  function monAction(status) {
    if (selectedMonIndex > -1) {
      if (status === 'mined') {
        mineMon(selectedMonIndex);
      } else {
        // TODO: combine statuses of flag/safe with own/seen
        statusList[selectedMonIndex] = status;
      }
      selectedMonIndex = -1;
    }
  }

  function clearStatus() {
    if (selectedMonIndex > -1 && statusList[selectedMonIndex] !== 'mined') {
      statusList[selectedMonIndex] = '';
      selectedMonIndex = -1;
    }
  }

  /**
	 * @param {number} monIndex
	 */
  function mineMon(monIndex) {
    if (mineList && typeof(mineList[monIndex]) !== 'undefined' && statusList && statusList[monIndex] !== 'mined') {
      statusList[monIndex] = 'mined';

      // Mine all mons around it if the mine value is 0
      if (mineList[monIndex] === 0) {
        mineMon(monIndex - GRID_COLUMNS); // mon above
        mineMon(monIndex + GRID_COLUMNS); // mon below

        // Make sure we aren't at left edge of grid
        if (monIndex > 0 && Math.abs(monIndex % GRID_COLUMNS - ((monIndex - 1) % GRID_COLUMNS)) === 1) {
          mineMon(monIndex - 1); // mon to left
          mineMon(monIndex - GRID_COLUMNS - 1); // mon to upper left
          mineMon(monIndex + GRID_COLUMNS - 1); // mon to lower left
        }

        // Make sure we aren't at right edge of grid
        if (Math.abs(monIndex % GRID_COLUMNS - ((monIndex + 1) % GRID_COLUMNS)) === 1) {
          mineMon(monIndex + 1); // mon to right
          mineMon(monIndex - GRID_COLUMNS + 1); //mon to upper right
          mineMon(monIndex + GRID_COLUMNS + 1); // mon to lower right
        }
      }
    }
  }

  function onResetClick() {
    gridSeed = '';
    mineSeed = '';
    monList = NATIONAL_DEX;
    mineList = [];
    statusList = [];
    selectedMonIndex = -1;
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

    const flattenedMineGrid = flatten2DArray(mine2DGrid);
    mineList = flattenedMineGrid;
    statusList = Array(flattenedMineGrid.length).fill('');

    // auto-mine freebie cells
    mineMon(flattenedMineGrid.length - 5);
    mineMon(flattenedMineGrid.length - 4);
    mineMon(flattenedMineGrid.length - 3);
    mineMon(flattenedMineGrid.length - 2);
    mineMon(flattenedMineGrid.length - 1);
  }
</script>

<svelte:window on:keydown={updateSearch} />

<div class="page">
  <h1>Pokémon Crystal Minesweeper</h1>

  <div class="grid">
    <div class={`dex ${searchTerm.length > 0 ? 'search' : ''}`}>
      {#each monList as pokemon, i (pokemon.id)}
        <div
          class={`dex-mon ${
            statusList[i] === 'mined'
              ? mineList[i] === 'M' ? 'mine' : `safe${mineList[i]}`
              : statusList[i] || ''
          } ${
            i === selectedMonIndex ? 'selected' : ''
          } ${
            pokemon.name.toLowerCase().includes(searchTerm) ? 'matched' : ''
          }`}
          on:click={() => selectMon(i)}
          on:keypress={() => selectMon(i)}
        >
          <img
            class={`mon-icon ${statusList[i] === 'mined' ? 'mined' : ''}`}
            src={`/pokedex/${pokemon.id}.png`}
            alt={pokemon.name}
          />
          {#if mineList.length > 0 && statusList[i] === 'mined'}
            <div class="mine-value-container">
              <span class="mine-list-value">{mineList[i]}</span>
            </div>
          {/if}
        </div>
      {/each}
      {#if mineList.length > 0}
        <div class={`dex-mon empty safe${mineList[mineList.length - 5]}`}>
          {mineList[mineList.length - 5]}
        </div>
        <div class={`dex-mon empty safe${mineList[mineList.length - 4]}`}>
          {mineList[mineList.length - 4]}
        </div>
        <div class={`dex-mon empty safe${mineList[mineList.length - 3]}`}>
          {mineList[mineList.length - 3]}
        </div>
        <div class={`dex-mon empty safe${mineList[mineList.length - 2]}`}>
          {mineList[mineList.length - 2]}
        </div>
        <div class={`dex-mon empty safe${mineList[mineList.length - 1]}`}>
          {mineList[mineList.length - 1]}
        </div>
      {/if}
      <TextField
        variant="outlined"
        bind:value={searchTerm}
        bind:this={searchInput}
        on:blur={() => searchFocussed = false}
        on:focus={() => searchFocussed = true}
        on:keydown={searchKeyDown}
        label="Dex Search"
        style={'margin-top: 1rem'}
      />
    </div>
  </div>
  <div class="options">
    <div class="randomizer">
      <TextField
        variant="outlined"
        bind:value={gridSeed}
        bind:this={gridSeedInput}
        on:blur={() => gridSeedFocussed = false}
        on:focus={() => gridSeedFocussed = true}
        label="Grid Seed:"
      />
      <Button color="secondary" on:click={onRandomizeGridSeed} variant="unelevated">
        <Label>Randomize Grid Seed</Label>
      </Button>
      <br /><br />
      <TextField
        variant="outlined"
        bind:value={mineSeed}
        bind:this={mineSeedInput}
        on:blur={() => mineSeedFocussed = false}
        on:focus={() => mineSeedFocussed = true}
        label="Mine Seed:"
      />
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
      <span class="selected-mon">
        <b>Selected Mon:</b>
        {#if selectedMonIndex > -1}
          {monList[selectedMonIndex].name}
        {/if}
      </span>
      <br />
      <span class="selected-mon">
        <b>Status:</b>
        {#if selectedMonIndex > -1 && statusList[selectedMonIndex]}
          {statusList[selectedMonIndex].toUpperCase()}
        {/if}
      </span>
      <br /><br />
      <Button style="background-color: #fff; color: #000; border: 1px solid #000" on:click={clearStatus} variant="unelevated">
        <Label>Clear</Label>
      </Button>
      <br /><br />
      <Button style="background-color: red" on:click={() => monAction('flagged')} variant="unelevated">
        <Label>Flag</Label>
      </Button>
      <br /><br />
      <Button style="background-color: #008b8b" on:click={() => monAction('seen')} variant="unelevated">
        <Label>Seen</Label>
      </Button>
      <br /><br />
      <Button style="background-color: #ffc0cb; color: #000;" on:click={() => monAction('owned')} variant="unelevated">
        <Label>Own</Label>
      </Button>
      <br /><br />
      <Button style="background-color: #008000" on:click={() => monAction('safe')} variant="unelevated">
        <Label>Safe</Label>
      </Button>
      <br /><br />
      <Button style="background-color: #8b008b" on:click={() => monAction('mined')} variant="unelevated">
        <Label>Excavate</Label>
      </Button>
      *cannot be undone
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
    width: calc(100% / 16 - 4px);
    height: calc(100% / 16 - 4px);
    position: relative;
    border: 2px solid white;
    background-color: white;
    color: white;
  }

  .dex.search > .dex-mon {
    opacity: 0.3;
  }

  .dex.search > .dex-mon.matched {
    opacity: 1;
    background-color: lightblue;
  }

  .dex-mon.empty {
    font-size: 2rem;
    text-align: center;
    line-height: 1.25;
  }

  .mine-value-container {
    height: 100%;
    position: absolute;
    width: 100%;
    text-align: center;
    top: 0;
    z-index: 2;
  }

  .mine-list-value {
    font-size: 2rem;
    line-height: 1.25;
  }

  .dex-mon.mine {
    background-color: red;
    border-color: red;
  }

  .dex-mon.safe0 {
    color: #000;
  }

  .dex-mon.safe1 {
    background-color: #434343;
    border-color: #434343;
  }
  .dex-mon.safe2 {
    background-color: #3b3b3b;
    border-color: #3b3b3b;
  }
  .dex-mon.safe3 {
    background-color: #333333;
    border-color: #333333;
  }
  .dex-mon.safe4 {
    background-color: #2b2b2b;
    border-color: #2b2b2b;
  }
  .dex-mon.safe5 {
    background-color: #232323;
    border-color: #232323;
  }
  .dex-mon.safe6 {
    background-color: #1b1b1b;
    border-color: #1b1b1b;
  }
  .dex-mon.safe7 {
    background-color: #131313;
    border-color: #131313;
  }
  .dex-mon.safe8 {
    background-color: #0b0b0b;
    border-color: #0b0b0b;
  }

  .dex-mon.flagged {
    border-color: red;
  }

  .dex-mon.seen {
    border-color: #008b8b;
  }

  .dex-mon.owned {
    border-color: #ffc0cb;
  }

  .dex-mon.safe {
    border-color: #008000;
  }

  .dex-mon.selected {
    border-color: #daa520;
  }

  .mon-icon {
    width: 100%;
  }

  .mon-icon.mined {
    opacity: 0.5;
  }
</style>
