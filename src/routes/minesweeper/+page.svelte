<script>
  // TODO: Make floating menu and info section responsive
  import short from 'short-uuid';
  import Button, { Label } from '@smui/button';
	import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import TextField from '@smui/textfield';
	import { convertTo2DArray, flatten2DArray } from '$lib/arrayConversion';
  import { clickOutside } from '$lib/clickOutside';
	import { randomizeArray } from '$lib/randomize';
	import { EXPLOSION, MINE, STATUS } from '../../constants/minesweeper';
  import { NATIONAL_DEX } from '../../constants/pokedex';

  const EXCAVATED_MINE_PENALTY = 15;
  const EXPLODED_MINE_PENALTY = 5;
  const GRID_COLUMNS = 16;
  const NUM_MINES = 40;
  const emptyMineList = [0, 0, 0, 0, 0];
  const searchClearTimeoutAmount = 5000;

  let gameIsComplete = false;

  let settingsDialogOpen = true;
  let seedInfoDialogOpen = false;
  let menuDialogOpen = false;
  let howToDialogOpen = false;
  let autoMineDialogOpen = false;

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
	 * @type {string}
	 */
  let searchTerm = '';
  let searchFocussed = false;
  /**
	 * @type {NodeJS.Timeout}
	 */
  let searchBlurTimeout;
  let gridSeedFocussed = false;
  let mineSeedFocussed = false;
  let selectedMonIndex = -1;

  let timePenaltyOpen = false;

  function handleStartNewGame() {
    if (!gridSeed || !mineSeed || confirm('Starting a new game will end the current one. Are you sure you wish to start a new game?')) {
      mineList = [];
      statusList = [];
      monList = NATIONAL_DEX;
      gridSeed = '';
      mineSeed = '';
      searchTerm = '';
      selectedMonIndex = -1;
      settingsDialogOpen = true;
      howToDialogOpen = false;
      seedInfoDialogOpen = false;
      menuDialogOpen = false;
      gameIsComplete = false;
    }
  }

  function openHowToDialog() {
    howToDialogOpen = true;
  }

  function openSeedInfoDialog() {
    seedInfoDialogOpen = true;
  }

  function openMenuDialog() {
    menuDialogOpen = true;
  }

  function openAutoMineDialog() {
    autoMineDialogOpen = true;
  }

  function onRandomizeGridSeed() {
    gridSeed = short.generate().substring(0, 12).toUpperCase();
  }

  function onRandomizeMineSeed() {
    mineSeed = short.generate().substring(0, 12).toUpperCase();
  }

  function handleOutsideDexClick() {
    selectedMonIndex = -1;
  }

  /**
	 * @param {{ which: any; keyCode: any; ctrlKey: boolean; }} e
	 */
  function updateSearch(e) {
    const keyCode = e.which || e.keyCode;
    if (!e.ctrlKey) {
      // valid keys are letters, numbers, dash, apostrophe or period;
      const validKeyPressed = (keyCode >= 48 && keyCode <= 90) || keyCode === 222 || keyCode === 189 || keyCode === 190;
      if (!searchFocussed && !gridSeedFocussed && !mineSeedFocussed && validKeyPressed) {
        searchInput.focus();
        selectedMonIndex = -1;
      } else if (keyCode === 27) {
        searchInput.blur();
        searchTerm = '';
        selectedMonIndex = -1;
      }
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
      selectedMonIndex = -1;
    } else {
      clearTimeout(searchBlurTimeout);
      searchBlurTimeout = setTimeout(() => {
        searchInput.blur();
        searchTerm = '';
      }, searchClearTimeoutAmount);
    }
  }

  /**
	 * @param {number} monIndex
	 * @param {string[]} stateArray
	 */
  function toggleStatusStates(monIndex, stateArray) {
    let currentStatus = statusList[monIndex];

    // Replace empty status
    if (currentStatus === STATUS.EMPTY) {
      currentStatus = '';
    }

    // as long as the current status is not mined or exploded we can toggle
    if (!currentStatus.includes(STATUS.EXPLODED) && !currentStatus.includes(STATUS.MINED)) {
      // Iterate through following chain: [0] -> [1] -> Neither
      if (currentStatus.includes(stateArray[0])) {
        statusList[monIndex] = currentStatus.replace(stateArray[0], stateArray[1]);
      } else if (currentStatus.includes(stateArray[1])) {
        const newStatus = currentStatus.replace(stateArray[1], '').trim();
        statusList[monIndex] = newStatus !== '' ? newStatus : STATUS.EMPTY;
      } else {
        statusList[monIndex] = currentStatus.concat(' ', stateArray[0]).trim();
      }
    }
  }

  /**
	 * @param {number} monIndex
	 */
  function contextSelectMon(monIndex) {
    // Toggle status state if game is still ongoing
    if (!gameIsComplete) {
      toggleStatusStates(monIndex, [STATUS.FLAGGED, STATUS.SAFE]);
    }
  }

  /**
	 * @param {number} monIndex
	 * @param {MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }} event
	 */
   function auxSelectMon(monIndex, event) {
    // Toggle status state if game is still ongoing and we received a middle click
    if (!gameIsComplete && (event.which === 2 || event.button === 1)) {
      toggleStatusStates(monIndex, [STATUS.SEEN, STATUS.OWNED]);
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
    if (selectedMonIndex > -1 && !gameIsComplete) {
      let currentStatus = statusList[selectedMonIndex];
      if (currentStatus === STATUS.EMPTY) {
        currentStatus = '';
      }

      if (currentStatus.includes(status)) {
        return;
      }

      switch (status) {
        case STATUS.MINED:
          mineMon(selectedMonIndex);
          break;
        case STATUS.FLAGGED:
          if (currentStatus.includes(STATUS.SAFE)) {
            statusList[selectedMonIndex] = currentStatus.replace(STATUS.SAFE, status);
          } else {
            statusList[selectedMonIndex] = currentStatus.concat(' ', status);
          }
          break;
        case STATUS.SAFE:
          if (currentStatus.includes(STATUS.FLAGGED)) {
            statusList[selectedMonIndex] = currentStatus.replace(STATUS.FLAGGED, status);
          } else {
            statusList[selectedMonIndex] = currentStatus.concat(' ', status);
          }
          break;
        case STATUS.SEEN:
          if (currentStatus.includes(STATUS.OWNED)) {
            statusList[selectedMonIndex] = currentStatus.replace(STATUS.OWNED, status);
          } else {
            statusList[selectedMonIndex] = currentStatus.concat(' ', status);
          }
          break;
        case STATUS.OWNED:
          if (currentStatus.includes(STATUS.SEEN)) {
            statusList[selectedMonIndex] = currentStatus.replace(STATUS.SEEN, status);
          } else {
            statusList[selectedMonIndex] = currentStatus.concat(' ', status);
          }
          break;
        default:
          break;
      }

      // allow players to immediately excavate a mon if their status is now owned
      if (status !== STATUS.OWNED) {
        selectedMonIndex = -1;
      }

      // clear any search once action is performed
      searchTerm = '';
    }
  }

  function clearStatus() {
    if (selectedMonIndex > -1 && !statusList[selectedMonIndex].includes(STATUS.MINED)) {
      statusList[selectedMonIndex] = STATUS.EMPTY;
      selectedMonIndex = -1;
    }
  }

  /**
	 * @param {number} monIndex
   * @param {string} mineStatus
	 */
  function mineMon(monIndex, mineStatus = STATUS.MINED, mineNeighborsIfZero = true) {
    if (
      mineList &&
      typeof(mineList[monIndex]) !== 'undefined' &&
      statusList &&
      ![STATUS.MINED, STATUS.EXPLODED, STATUS.ORIGIN_EXPLODED].includes(statusList[monIndex])
    ) {
      // Set the status of the requested mon
      statusList[monIndex] = mineStatus;

      // Mine all mons around it if the mine value is 0
      if (mineNeighborsIfZero && mineList[monIndex] === 0) {
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

  /**
	 * @param {number} monIndex
	 */
  function explodeMon(monIndex) {
    // explode selected mon
    mineMon(monIndex, STATUS.ORIGIN_EXPLODED);

    // explode mons around it
    mineMon(monIndex - GRID_COLUMNS, STATUS.EXPLODED); // mon above
    mineMon(monIndex + GRID_COLUMNS, STATUS.EXPLODED); // mon below

    // Make sure we aren't at left edge of grid
    if (monIndex > 0 && Math.abs(monIndex % GRID_COLUMNS - ((monIndex - 1) % GRID_COLUMNS)) === 1) {
      mineMon(monIndex - 1, STATUS.EXPLODED); // mon to left
      mineMon(monIndex - GRID_COLUMNS - 1, STATUS.EXPLODED); // mon to upper left
      mineMon(monIndex + GRID_COLUMNS - 1, STATUS.EXPLODED); // mon to lower left
    }

    // Make sure we aren't at right edge of grid
    if (Math.abs(monIndex % GRID_COLUMNS - ((monIndex + 1) % GRID_COLUMNS)) === 1) {
      mineMon(monIndex + 1, STATUS.EXPLODED); // mon to right
      mineMon(monIndex - GRID_COLUMNS + 1, STATUS.EXPLODED); //mon to upper right
      mineMon(monIndex + GRID_COLUMNS + 1, STATUS.EXPLODED); // mon to lower right
    }
  }

  function autoMineGrid() {
    autoMineDialogOpen = false;

    // Filter through statusList to find cells that are not flagged, excavated, or exploded
    const indexesToMine = statusList.forEach((status, index) => {
      if (!status.includes(STATUS.FLAGGED) && !status.includes(STATUS.MINED) && !status.includes(STATUS.EXPLODED)) {
        // Set each of these cells to new status of AUTO_MINED, but do not expand mining if a 0 is uncovered
        mineMon(index, STATUS.AUTO_MINED, false);
      }
    });

    // Mark game as complete so no more actions can be completed (both buttons and right-clicking)
    gameIsComplete = true;
  }

  function onStartClick() {
    // Build randomized mon list
    monList = randomizeArray(NATIONAL_DEX, gridSeed);

    // Build randomized mine list
    const unshuffledMines = Array(NATIONAL_DEX.length).fill(MINE, 0, NUM_MINES).fill(0, NUM_MINES);
    const shuffledMines = randomizeArray(unshuffledMines, mineSeed);
    const shuffledMinesWithBlanks = shuffledMines.concat(emptyMineList);

    const mine2DGrid = convertTo2DArray(shuffledMinesWithBlanks, GRID_COLUMNS);

    // Build the hint numbers for the mine list
    for (var row = 0; row < mine2DGrid.length; row++) {
      for (var col = 0; col < GRID_COLUMNS; col++) {
        if (mine2DGrid[row][col] === MINE) {
          const isNotLeftEdgeCol = col - 1 >= 0;
          const isNotRightEdgeCol = col + 1 < GRID_COLUMNS;

          // Current Row
          if (isNotLeftEdgeCol && mine2DGrid[row][col - 1] !== MINE) {
            mine2DGrid[row][col - 1] += 1;
          }
          if (isNotRightEdgeCol && mine2DGrid[row][col + 1] !== MINE) {
            mine2DGrid[row][col + 1] += 1;
          }

          if (row - 1 >= 0) {
            // Previous row exists, so check through valid columns
            if (mine2DGrid[row - 1][col] !== MINE) {
              mine2DGrid[row - 1][col] += 1;
            }
            if (isNotLeftEdgeCol && mine2DGrid[row - 1][col - 1] !== MINE) {
              mine2DGrid[row - 1][col - 1] += 1;
            }
            if (isNotRightEdgeCol && mine2DGrid[row - 1][col + 1] !== MINE) {
              mine2DGrid[row - 1][col + 1] += 1;
            }
          }

          if (row + 1 < mine2DGrid.length) {
            // Next row exists, so check through valid columns
            if (mine2DGrid[row + 1][col] !== MINE) {
              mine2DGrid[row + 1][col] += 1;
            }
            if (isNotLeftEdgeCol && mine2DGrid[row + 1][col - 1] !== MINE) {
              mine2DGrid[row + 1][col - 1] += 1;
            }
            if (isNotRightEdgeCol && mine2DGrid[row + 1][col + 1] !== MINE) {
              mine2DGrid[row + 1][col + 1] += 1;
            }
          }
        }
      }
    }

    const flattenedMineGrid = flatten2DArray(mine2DGrid);
    mineList = flattenedMineGrid;
    statusList = Array(flattenedMineGrid.length).fill(STATUS.EMPTY);

    // auto-mine freebie cells
    mineMon(flattenedMineGrid.length - 5);
    mineMon(flattenedMineGrid.length - 4);
    mineMon(flattenedMineGrid.length - 3);
    mineMon(flattenedMineGrid.length - 2);
    mineMon(flattenedMineGrid.length - 1);

    settingsDialogOpen = false;
  }

  // A mine has been found if it has been flagged, or if it is an uncovered mine in the grid
  // (whether via excavation or explosion)
  $: minesRemaining = gameIsComplete ? 0 : NUM_MINES - statusList.filter((status, index) =>
    status.includes(STATUS.FLAGGED) ||
    ((status === STATUS.MINED || status.includes(STATUS.EXPLODED)) && mineList[index] === MINE
  )).length;

  $: minesExcavated = statusList.filter((status, index) =>
    status.includes(STATUS.MINED) && mineList[index] === MINE
  ).length;

  $: minesExploded = statusList.filter((status, index) =>
    status === STATUS.ORIGIN_EXPLODED ||
    mineList[index] === MINE && (status === STATUS.EXPLODED || status === STATUS.ORIGIN_EXPLODED)
  ).length;
</script>

<svelte:window on:keydown={updateSearch} />
<svelte:head>
  <title>Pokémon Crystal Minesweeper</title>
  {#each NATIONAL_DEX as poke}
    <link rel="preload" as="image" href={`/pokedex/${poke.id}.png`} />
  {/each}
</svelte:head>

<div class="page">
  {#if mineList.length === 0}
    <h1>Pokémon Crystal Minesweeper</h1>
    <Button color="primary" on:click={handleStartNewGame} variant="raised">
      <Label>Start New Game</Label>
    </Button>
    <Button color="secondary" on:click={openHowToDialog} variant="raised">
      <Label>How To Play</Label>
    </Button>
    <Button color="secondary" href="/" variant="outlined">
      <Label>Games Home</Label>
    </Button>
  {/if}
  {#if mineList.length > 0}
    <div class='floating-menu'>
      <Button color="primary" on:click={openMenuDialog} variant="raised">
        <Label>Menu</Label>
      </Button>
      {#if minesRemaining === 0 && !gameIsComplete}
        <br /><br />
        <Button color="primary" on:click={openAutoMineDialog} variant="outlined">
          <Label>Finish Game</Label>
        </Button>
      {/if}
    </div>
  {/if}

  <Dialog bind:open={menuDialogOpen}>
    <Title>Minesweeper Menu</Title>
    <Content>
      <Button color="secondary" on:click={openHowToDialog} variant="raised">
        <Label>How To Play</Label>
      </Button>
      <br /><br />
      <Button color="primary" on:click={openSeedInfoDialog} variant="outlined">
        <Label>Seed Info</Label>
      </Button>
      <br /><br />
      <Button color="primary" on:click={handleStartNewGame} variant="raised">
        <Label>Start New Game</Label>
      </Button>
    </Content>
  </Dialog>
  <Dialog bind:open={seedInfoDialogOpen}>
    <Title id="seedInfoTitle">Minesweeper Seed Info</Title>
    <Content id="seedInfoContent">
      <p><b>Dex Grid Seed:</b> {gridSeed}</p>
      <p><b>Mining Grid Seed:</b> {mineSeed}</p>
    </Content>
    <Actions>
      <Button>Close</Button>
    </Actions>
  </Dialog>
  <Dialog bind:open={settingsDialogOpen} surface$style="width: 850px">
    <Title id="settingsTitle">Pokémon Crystal Minesweeper - Grid Settings</Title>
    <Content id="settingsContent">
      <br />
      <TextField
        variant="outlined"
        bind:value={gridSeed}
        on:blur={() => gridSeedFocussed = false}
        on:focus={() => gridSeedFocussed = true}
        label="Grid Layout Seed:"
      />
      <Button color="secondary" on:click={onRandomizeGridSeed} variant="unelevated">
        <Label>Randomize Seed</Label>
      </Button>
      <br /><br />
      <TextField
        variant="outlined"
        bind:value={mineSeed}
        on:blur={() => mineSeedFocussed = false}
        on:focus={() => mineSeedFocussed = true}
        label="Mine Layout Seed:"
      />
      <Button color="secondary" on:click={onRandomizeMineSeed} variant="unelevated">
        <Label>Randomize Seed</Label>
      </Button>
      <br /><br />
      <Button color="primary" on:click={onStartClick} disabled={!gridSeed || !mineSeed} variant="unelevated">
        <Label>Start Game!</Label>
      </Button>
      <Button color="secondary" on:click={openHowToDialog} variant="raised">
        <Label>How To Play</Label>
      </Button>
    </Content>
  </Dialog>
  <Dialog bind:open={howToDialogOpen} slot="over" surface$style="height: 600px; width: 800px">
    <Title id="howToTitle">Pokédex Minesweeper - How To Play</Title>
    <Content id="howToContent">
      <h3>Object</h3>

      <p>The object of Pokédex Minesweeper is to find all of the hidden mines in the Pokédex grid as fast as possible. This is ideally done by using logic to flag the Pokémon you know to be mines based on the clues given by other excavated Pokémon. Once all 40 mines have been found, stop your timer (not implemented on this page) and add any accrued penalties to your time to find your final score (see below for Penalties).</p>

      <p>Pokédex Minesweeper is a great way to spice up a standard Catch-Em-All randomizer and it is highly encouraged to add in a full-item or even a map randomizer to make things extra chaotic!</p>

      <h3>Setting Up A Game</h3>
      <p>When the page initially loads, or when you start a new game, you will be presented with a dialog to input the settings for minesweeper:</p>
      <ul>
        <li><b>Grid Seed:</b> A string used for randomization of the Pokédex. Type one of your choice or click the Randomize Grid Seed button to have one generated for you.</li>
        <li><b>Mine Seed:</b> A string used for randomization of the grid for the mines. Type one of your choice or click the Randomize Mine Seed button to have one generated for you.</li>
      </ul>
      <p>Once you have clicked the 'Start Game!' button, the dialog should close and before you will be a Pokédex grid along with info and actions beside it. Every game of Minesweeper starts with the last 5 squares in the bottom pre-excavated for you.</p>

      <h3>The Grid</h3>
      <p>The Pokédex grid displays all important information and clues about where mines are hidden in the grid. Any square that has a number or a letter overtop of the Pokémon's icon indicates that that square has been mined. That number or letter indicates the following:</p>
      <ul>
        <li><b>Number:</b> indicates how many mines are adjacent (including diagonals) to this square</li>
        <li><b>M:</b> indicates that this square contains a mine (and appropriate penalty has been applied)</li>
        <li><b>E:</b> (optional, see Actions below) indicates that this square exploded on its own and contained a mine (and appropriate penalty has been applied)</li>
      </ul>

      <p>Additionally, each Pokémon in the grid is colored in a way to indicate its different potential statuses:</p>
      <ul>
        <li><b>Purple Border:</b> indicates this Pokémon is currently selected. Actions can now be performed on its cell and you can see its full status written out above the Actions on the right. </li>
        <li><b>Red Border & Light Red Background:</b> indicates this Pokémon's cell has been flagged, meaning you think there is a mine underneath. This cell will also have a light red background.</li>
        <li><b>Green Border & Light Green Background:</b> indicates this Pokémon's cell is safe to be excavated (ie. you do not think there is a mine underneath it). This cell will also have a light green background.</li>
        <li><b>Blue Dot:</b> indicates that you have seen this Pokémon during game play.</li>
        <li><b>Yellow Dot:</b> indicates that you have caught or own this Pokémon in your game's Pokédex.</li>
        <li><b>Light Blue Background:</b> indicates that a search is active below the grid and this Pokémon matches the search term provided.</li>
        <li><b>Red Background:</b> indicates that this cell has been excavated and a mine was found or the cell exploded (indicated by the letter in the cell, see above)</li>
        <li><b>Grey-scale Background:</b> indicates the cell has been mined, but no mine was found underneath. The darker the background the more mines that are adjacent (including diagonals) to this cell.</li>
      </ul>
      <p>Some statuses of a cell can be stacked, such as Safe and Seen. In this case, you will see both the green border and background of the Pokémon, as well as the blue dot.</p>

      <h3>Information Panel</h3>
      <p>This information panel provides a quick look at how you are doing in the game. It will list how many mines you have found (via excavation, explosion, flagging), what your current time penalty is (due to mine excavations ({EXCAVATED_MINE_PENALTY} minutes each) and explosions ({EXPLODED_MINE_PENALTY} minutes each)), the currently selected Pokémon in the grid and the current status of the selected Pokémon (there could be more than one).</p>

      <h3>Actions</h3>
      <p>Once you have selected a Pokémon in the grid, various actions can be performed on that cell to add a status to that Pokémon's cell. Unless otherwise stated, once a Pokémon in the grid has been excavated or has exploded, no further actions can be performed on it. The possible actions are:</p>
      <ul>
        <li><b>Clear Status:</b> clear all existing statuses on the cell</li>
        <li><b>Flag:</b> mark the cell as flagged. This will auto-decrement the number of remaining mines by 1</li>
        <li><b>Safe:</b> mark the cell as safe to be mined</li>
        <li><b>Seen:</b> mark the Pokémon as seen</li>
        <li><b>Own:</b> mark the Pokémon as owned (which makes the Pokémon's cell able to be excavated)</li>
        <li><b>Excavate</b> excavate the Pokémon's cell. This is only performable if the Pokémon has already been set to Owned. This action cannot be undone once performed. If you excavate a cell and a mine is underneath, the number of mines remaining will auto-decrement by 1 and you'll incur a {EXCAVATED_MINE_PENALTY}-minute penalty to your overall time.</li>
        <li><b>Explosion</b> explode the Pokémon's cell, which will also excavate all adjacent cells automatically, incurring penalties as required. This action cannot be undone once performed. (see optional rules for more info)</li>
      </ul>

      <h3>Shortcuts</h3>
      <p>There are a few shortcuts that can help you use this tracker faster:</p>
      <ul>
        <li><b>Right-click:</b> right-clicking on any cell in the grid will toggle the cell between Flagged, Safe, and Neither. If this cell has a Owned or Seen status, that status is not affected by the right-click action.</li>
        <li><b>Middle-click:</b> middle-clicking on any cell in the grid will toggle the cell between Seen, Owned, and Neither. If this cell has a Flagged or Safe status, that status is not affected by the middle-click action.</li>
        <li><b>Typing:</b> as long as the tab is focussed, typing any key will automatically start a search in the grid. This search clears any selected pokemon and fades-out all pokemon in the grid that do not match the searched term. As well, the search clears itself after {searchClearTimeoutAmount / 1000} seconds of non-typing activity.</li>
        <li><b>Escape Key:</b> hitting the escape key will clear any search and de-select any selected pokemon in the grid.</li>
      </ul>

      <h3>End Game</h3>
      <p>When you have found the {NUM_MINES}<sup>th</sup> mine in the grid (via excavation, explosion, or flagging), a Finish Game button will appear near the top right corner of the winder. Clicking this will allow you to confirm that you are done and also allow the grid to be auto-excavated to confirm your logic for the game. If your flagging is correct, you have nothing to worry about, but if a mine is uncovered during the auto-mine process, its penalty will still be applied to your final time. For quick reference, all auto-mined cells will appear in italicized font, including any mines that may have been found.</p>
      <p>Once the grid has been auto-mined, you will not be able to perform any action on the grid besides searching and selecting.</p>
      <p>Once all un-excavated cells have been excavated, add your timer's time to the Time Penalty indicated in the Information Panel to get your final time. If you are racing against others, whoever has the fastest time wins the race!</p>

      <h3>Optional Explosions</h3>
      <p>To add a bit of difficulty to your game play in Pokémon Crystal, you can implement this optional Explosions rule-set to Minesweeper.</p>
      <p>While playing Pokémon Crystal, if <b>any</b> Pokémon in the game uses the move SelfDestruct or Explosion on you, that Pokémon also explodes in your grid (feel free to house-rule some other moves, too, like Egg Bomb or Present). When this occurs, select the Pokémon that exploded on you in the grid and click the Explosion action.</p>
      <p>When a Pokémon explodes in the grid, that Pokémon immediately becomes a mine that excavates all grid cells adjacent to it (including diagonals). Each mine uncovered in this way (including the Pokémon that exploded) incurs a 5-minute penalty to your overall time. For quick reference, any Pokémon that explodes due to SelfDestruct or Explosion will have its revealed value bolded and underlined, signifying it was the origin of an explosion.</p>
      <p><b>Note:</b> if a Pokémon has already been excavated, it cannot explode afterwards. Therefore, you will not be able to select the Explosion action on an excavated Pokémon.</p>
    </Content>
    <Actions>
      <Button>Close</Button>
    </Actions>
  </Dialog>

  <Dialog bind:open={autoMineDialogOpen}>
    <Title>Auto-mine Grid?</Title>
    <Content>
      <p>All mines have been flagged or uncovered. Would you like to end your game?</p>
      <p>If yes, all grid cells that have not been excavated and are not flagged will be auto-excavated.</p>
    </Content>
    <Actions>
      <Button color="primary" on:click={autoMineGrid} variant="raised">Yes (Stop Timer)</Button>
      <Button color="primary" variant="outlined">No (Continue Timer)</Button>
    </Actions>
  </Dialog>

  {#if mineList.length > 0}
    <div class="playArea">
      <div class="grid">
        <div use:clickOutside on:click_outside={handleOutsideDexClick} class={`dex ${searchTerm.length > 0 ? 'search' : ''}`}>
          {#each monList as pokemon, i (pokemon.id)}
            <div
              class={`dex-mon ${
                statusList[i].includes(STATUS.MINED) || statusList[i].includes(STATUS.EXPLODED)
                  ? mineList[i] === MINE ? 'mine' : `safe${mineList[i]}`
                  : statusList[i] || ''
              } ${
                i === selectedMonIndex ? 'selected' : ''
              } ${
                searchTerm !== '' && pokemon.name.toLowerCase().includes(searchTerm) ? 'matched' : ''
              }`}
              on:click={() => selectMon(i)}
              on:keydown={() => selectMon(i)}
              on:auxclick|preventDefault={(e) => auxSelectMon(i, e)}
              on:contextmenu|preventDefault={() => contextSelectMon(i)}
            >
              {#if statusList[i].includes(STATUS.SEEN) || statusList[i].includes(STATUS.OWNED)}
                <div class="dot">&nbsp;</div>
              {/if}
              <img
                class={`mon-icon ${statusList[i].includes(STATUS.MINED) || statusList[i].includes(STATUS.EXPLODED) ? STATUS.MINED : ''}`}
                src={`/pokedex/${pokemon.id}.png`}
                alt={pokemon.name}
              />
              {#if mineList.length > 0 && (statusList[i].includes(STATUS.MINED) || statusList[i].includes(STATUS.EXPLODED))}
                <div class="mine-value-container">
                  <span class={`mine-list-value ${statusList[i] === STATUS.ORIGIN_EXPLODED ? 'origin-explosion' : ''} ${statusList[i] === STATUS.AUTO_MINED ? 'auto-excavated' : ''}`}>
                    {statusList[i].includes(STATUS.EXPLODED) && mineList[i] === MINE ? EXPLOSION : (mineList[i] || '')}
                  </span>
                </div>
              {/if}
            </div>
          {/each}
          {#if mineList.length > 0}
            <div class={`dex-mon empty safe${mineList[mineList.length - 5]}`}>
              {mineList[mineList.length - 5] || ''}
            </div>
            <div class={`dex-mon empty safe${mineList[mineList.length - 4]}`}>
              {mineList[mineList.length - 4] || ''}
            </div>
            <div class={`dex-mon empty safe${mineList[mineList.length - 3]}`}>
              {mineList[mineList.length - 3] || ''}
            </div>
            <div class={`dex-mon empty safe${mineList[mineList.length - 2]}`}>
              {mineList[mineList.length - 2] || ''}
            </div>
            <div class={`dex-mon empty safe${mineList[mineList.length - 1]}`}>
              {mineList[mineList.length - 1] || ''}
            </div>
          {/if}
        </div>
        <div class="below-grid">
          <div>
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
            <br />
            <p class="credits">
              Pokémon sprites courtesy of <a href="https://veekun.com/dex/downloads" rel="noreferrer" target="_blank">veekun.com</a>.<br />
            </p>
          </div>
          <div>
            <p style="margin-left: 1.5rem;">
              <b style="text-decoration: underline;">Shortcuts:</b><br />
              <b>Right-Click:</b> Toggle Flagged/Safe status<br />
              <b>Middle-Click:</b> Toggle Seen/Owned status<br />
              <b>Typing:</b> Initiate grid search<br />
              <b>ESC: </b> Clear search and selected mon<br />
            </p>
          </div>
        </div>
      </div>
      <div class="options">
        <h2 class="time-penalty-title">
          Total Time Penalty:&nbsp;
          {#if statusList.length > 0}
            {(minesExcavated * EXCAVATED_MINE_PENALTY) + (minesExploded * EXPLODED_MINE_PENALTY)}:00
          {/if}
        </h2>
        <p class="penalty-breakdown">
          &rarr;Mines Excavated ({minesExcavated}) = {minesExcavated * EXCAVATED_MINE_PENALTY}:00 penalty
          <br />
          &rarr;Mines Exploded ({minesExploded}) = {minesExploded * EXPLODED_MINE_PENALTY}:00 penalty
        </p>
        <h2>
          Mines Remaining:&nbsp;
          {#if statusList.length > 0}
            {minesRemaining} / {NUM_MINES}
          {/if}
        </h2>
        <h2>Actions</h2>
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
        {#if selectedMonIndex > -1 && !gameIsComplete && !statusList[selectedMonIndex].includes(STATUS.MINED)}
          <Button
            style="background-color: #fff; color: #000; border: 1px solid #000"
            on:click={clearStatus}
            variant="unelevated"
          >
            <Label>Clear Status</Label>
          </Button>
          <br /><br />
          <Button
            style="background-color: red"
            on:click={() => monAction(STATUS.FLAGGED)}
            variant="unelevated"
          >
            <Label>Flag</Label>
          </Button>
          <Button
            style="background-color: #008000"
            on:click={() => monAction(STATUS.SAFE)}
            variant="unelevated"
          >
            <Label>Safe</Label>
          </Button>
          <br /><br />
          <Button
            style="background-color: blue"
            on:click={() => monAction(STATUS.SEEN)}
            variant="unelevated"
          >
            <Label>Seen</Label>
          </Button>
          <Button
            style="background-color: yellow; border: 1px solid #000; color: #000;"
            on:click={() => monAction(STATUS.OWNED)}
            variant="unelevated"
          >
            <Label>Own</Label>
          </Button>
          <br /><br />
          {#if statusList && selectedMonIndex > -1 && statusList[selectedMonIndex].includes(STATUS.OWNED)}
            <Button
              style="background-color: #434343"
              on:click={() => monAction(STATUS.MINED)}
              variant="unelevated"
            >
              <Label>Excavate</Label>
            </Button>
            *cannot be undone
            <br /><br />
          {/if}
          {#if statusList && selectedMonIndex > -1 && ![STATUS.MINED, STATUS.EXPLODED, STATUS.ORIGIN_EXPLODED].includes(statusList[selectedMonIndex])}
            <br /><br />
            <Button
              style="background-color: #880000"
              on:click={() => explodeMon(selectedMonIndex)}
              variant="raised"
            >
              <Label>Explosion</Label>
            </Button>
            *cannot be undone
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .playArea, .below-grid {
    display: inline-flex;
  }

  .options {
    margin-left: 1rem;
  }

  .dex {
    display: flex;
    flex-wrap: wrap;
    height: 750px;
    width: 750px;
  }

  .dex > .dex-mon {
    background-color: #ddd;
    border: 2px solid #ddd;
    color: white;
    cursor: default;
    height: calc(100% / 16 - 4px);
    position: relative;
    width: calc(100% / 16 - 4px);
  }

  .dex.search > .dex-mon {
    opacity: 0.3;
  }

  .dex.search > .dex-mon.matched {
    opacity: 1;
    background-color: lightblue;
    border-color: lightblue;
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

  .mine-list-value.origin-explosion {
    font-weight: bold;
    text-decoration: underline;
  }

  .mine-list-value.auto-excavated {
    font-style: italic;
  }

  .dex-mon.mine {
    background-color: red;
    border-color: red;
  }

  .dex-mon.safe0 {
    background-color: white;
    border-color: white;
    color: #000;
  }

  .dex-mon.safe1 {
    background-color: #777;
    border-color: #777;
  }
  .dex-mon.safe2 {
    background-color: #666;
    border-color: #666;
  }
  .dex-mon.safe3 {
    background-color: #555;
    border-color: #555;
  }
  .dex-mon.safe4 {
    background-color: #444;
    border-color: #444;
  }
  .dex-mon.safe5 {
    background-color: #333;
    border-color: #333;
  }
  .dex-mon.safe6 {
    background-color: #222;
    border-color: #222;
  }
  .dex-mon.safe7 {
    background-color: #111;
    border-color: #111;
  }
  .dex-mon.safe8 {
    background-color: #000;
    border-color: #000;
  }

  .dex-mon.owned > div.dot,
  .dex-mon.seen > div.dot {
    position: absolute;
    background-color: yellow;
    border: 1px solid black;
    border-radius: 6px;
    width: 10px;
    height: 10px;
    top: 5px;
    left: 5px;
  }

  .dex-mon.seen > div.dot {
    background-color: blue;
  }

  .dex-mon.flagged {
    border-color: red;
    background-color: rgba(255, 0, 0, 0.2);
  }

  .dex-mon.safe {
    border-color: #008000;
    background-color: rgba(0, 127, 0, 0.2);
  }

  .dex-mon.selected,
  .dex.search > .dex-mon.selected.matched {
    border-color: #8b008b;
  }

  .mon-icon {
    width: 100%;
  }

  .mon-icon.excavated {
    opacity: 0.5;
  }

  .floating-menu {
    position: absolute;
    right: 1%;
    text-align: right;
    top: 1%;
  }

  .time-penalty-title {
    font-size: 24px;
    color: darkred;
  }

  .penalty-breakdown {
    font-size: 18px;
    padding-left: 1rem;
  }

  .selected-mon {
    font-size: 1.2rem;
  }

  .credits {
    font-size: 12px;
  }
</style>
