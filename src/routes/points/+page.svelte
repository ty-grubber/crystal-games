<script>
// @ts-nocheck
  import extractRegionsFromSpoiler from '$lib/extractRegionsFromSpoiler';
  import { randomizeArray, randomTiesSorting } from '$lib/randomize';
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import Select, { Option } from '@smui/select';
  import CustomPtsDialog from '../../components/CustomPts.svelte';
  import KEY_ITEMS from '../../constants/keyItemPresets';
	import CompactRegion1 from '../../components/Tracker/CompactRegion1.svelte';
	import ClassicRegion from '../../components/Tracker/ClassicRegion.svelte';
	import PointsHintDialog from '../../components/HowTos/PointsHintDialog.svelte';

  /**
	 * @type {{ regionId: number; points: number; items: any[]; }[]}
	 */
  let regionPoints;

  let baskets = [];
  let regionRevealOrder = [];
  let revealedRegions = [];
  let showSolution = false;
  let howToDialogOpen = false;
  let inGameMenuOpen = false;
  let customPtsMenuOpen = false;

  let settingsDialogOpen = true;
  let revealRegionPoints = false;
  let trackerLayout = 'classic';
  let revealOrdering = 'random';
  let initialRevealedRegions = 1;
  let spoilerFile;

  let selectedAvailableItem = {};
  let selectedFoundItem = {};

  let keyItems = [ ...KEY_ITEMS];
  let keyItemPointValues = [9, 7, 5, 3];

  /**
	 * @param {any} e
	 */
  async function handleSpoilerFileChange(e) {
    spoilerFile = e.target.files[0];
  };

  async function onStartClick() {
    const file = spoilerFile;
    if (file != null) {
      const spoilerText = await file.text();

      const extraction = extractRegionsFromSpoiler(spoilerText, keyItems);
      regionPoints = extraction.regionPointsArray;

      keyItemPointValues = [
        ...new Set(extraction.randomizedItems.map(item => item.points)),
      ].sort((a, b) => b - a);

      // Make our starting baskets
      const newBaskets = [
        { type: 'region', name: '1', items: []},
        { type: 'region', name: '2', items: []},
        { type: 'region', name: '3', items: []},
        { type: 'region', name: '4', items: []},
        { type: 'region', name: '5', items: []},
        { type: 'region', name: '6', items: []},
        { type: 'region', name: '7', items: []},
        { type: 'region', name: '8', items: []},
        { type: 'region', name: '9', items: []},
        { type: 'region', name: '10', items: []},
        { type: 'region', name: '11', items: []},
        { type: 'region', name: '12', items: []},
        { type: 'region', name: '13', items: []},
        { type: 'region', name: '14', items: []},
        { type: 'region', name: '15', items: []},
        { type: 'region', name: '16', items: []},
      ];

      const itemBaskets = keyItemPointValues.map(pointValue => ({
        type: 'item',
        name: pointValue.toString(),
        items: extraction.randomizedItems.filter(item => item.points === pointValue),
      }));

      baskets = newBaskets.concat(itemBaskets);
      let regionsWithTotalPoints = regionPoints.map(region => ({ id: region.regionId, points: region.points }));

      switch (revealOrdering) {
        case 'random':
          regionsWithTotalPoints = randomizeArray(regionsWithTotalPoints, extraction.rngSeed || file.name);
        default:
          regionsWithTotalPoints = randomTiesSorting(regionsWithTotalPoints, revealOrdering);
      }
      regionRevealOrder = regionsWithTotalPoints.map(r => r.id);
      revealedRegions = regionRevealOrder.splice(0, initialRevealedRegions);
      settingsDialogOpen = false;
    }
  }

  function handleStartNewGame() {
    if(confirm('Starting a new game will end the current one. Are you sure you wish to start a new game?')) {
      spoilerFile = null;
      regionPoints = null;
      baskets = [];
      regionRevealOrder = [];
      revealedRegions = [];
      selectedAvailableItem = {};
      selectedFoundItem = {};
      revealOrdering = 'random';
      showSolution = false;
      revealRegionPoints = false;
      initialRevealedRegions = 1;
      howToDialogOpen = false;
      inGameMenuOpen = false;
      settingsDialogOpen = true;
    }
  }

  function handleShowSolution() {
    showSolution = !showSolution;
  }

  function toggleRevealAllRegions() {
    revealRegionPoints = !revealRegionPoints;
  }

  function openHowToDialog() {
    howToDialogOpen = true;
  }

  function openSettingsDialog() {
    settingsDialogOpen = true;
  }

  function openInGameMenu() {
    inGameMenuOpen = true;
  }

  function checkToExposeRegion(originalBasket, targetBasket, movedItem) {
    if (regionRevealOrder.length > 0) {
      if (originalBasket.type === 'item' && targetBasket.type === 'region' && movedItem.points === 9) {
        // Found a badge in a region so expose a region's point value
        const regionToExpose = regionRevealOrder.shift();
        revealedRegions.unshift(regionToExpose);

        regionRevealOrder = regionRevealOrder;
        revealedRegions = revealedRegions;
      } else if (originalBasket.type === 'region' && targetBasket.type === 'item' && movedItem.points === 9) {
        // Unmarked a badge in a region so hide the last exposed region's point value
        const regionToExpose = revealedRegions.shift();
        regionRevealOrder.unshift(regionToExpose);

        regionRevealOrder = regionRevealOrder;
        revealedRegions = revealedRegions;
      }
    }
  }

  function handleOutsideRegionTableClick(e) {
    if (
      e.explicitOriginalTarget.tagName.toLowerCase() !== 'img' &&
      e.explicitOriginalTarget.parentElement.tagName.toLowerCase() !== 'button' &&
      !keyItemPointValues.find(value => value.toString() === e.explicitOriginalTarget.innerHTML)
    ) {
      selectedAvailableItem = {};
      selectedFoundItem = {};
    }
  }

  function handleUpdatePointValues(updatedKeyItems) {
    keyItems = [...updatedKeyItems];
    customPtsMenuOpen = false;
  }

  function beforeUnload(event) {
    if (regionPoints) {
      event.preventDefault();
      return (event.returnValue = '');
    }
  }
</script>

<svelte:window on:beforeunload={beforeUnload} />

<svelte:head>
  <title>Pokémon Crystal Points Hint Tracker</title>
  <meta property="description" content="Streamline your randomizer by using a key item region point hint system!" />
  {#each KEY_ITEMS as keyItem}
    <link rel="preload" as="image" href={`/keyItems/${keyItem.id}.png`} />
  {/each}
  <link rel="preload" as="image" href="/maps/johto-points-region-map.png" />
  <link rel="preload" as="image" href="/maps/kanto-points-region-map.png" />
</svelte:head>

<div class="page">
  {#if !regionPoints}
    <h1>Pokémon Crystal Points Tracker</h1>
    <Button color="primary" on:click={openSettingsDialog} variant="raised">
      <Label>New Game</Label>
    </Button>
    <Button color="secondary" on:click={openHowToDialog} variant="raised">
      <Label>How To Play</Label>
    </Button>
    <Button color="secondary" href="/" variant="outlined">
      <Label>Games Home</Label>
    </Button>
    <br /><br />
  {/if}

  <Dialog bind:open={settingsDialogOpen}>
    <Title id="settingsTitle">Pokémon Crystal Points Hint Tracker Settings</Title>
    <Content id="settingsContent">
      <label for="spoiler">
        {!spoilerFile ? 'Upload spoiler file (.txt):' : 'Spoiler Uploaded!'}
      </label>
      <input
        id="spoiler"
        accept=".txt"
        type="file"
        on:change={handleSpoilerFileChange}
        style="margin-right: 1rem;"
      />
      <br /><br />
      <Select bind:value={trackerLayout} variant="outlined" label="Tracker Layout Style" style="width: 220px;">
        <Option value="classic">Classic</Option>
        <Option value="compact1">Compact</Option>
      </Select>
      <div class="tracker-blurb">
        <span>
          {#if trackerLayout === 'classic'}
            A wider layout with all references to help you complete a seed.
          {:else}
            A compact layout for a runner more familiar with the regions and point values.
          {/if}
        </span>
      </div>
      <br /><br />
      <Select bind:value={revealOrdering} variant="outlined" label="Region Reveal Order" style="width: 220px;">
        <Option value="random">Random</Option>
        <Option value="desc">Highest First</Option>
        <Option value="asc">Lowest First</Option>
      </Select>
      <br /><br />
      <label for="startRevealed">Initial Revealed Regions</label>
      <input
        id={`startRevealed`}
        class="start-revealed"
        type="number"
        min="0"
        max="16"
        bind:value={initialRevealedRegions}
      />
      <br /><br />
      <Button
        color="primary"
        variant="outlined"
        on:click={() => customPtsMenuOpen = true}
      >
        Customize Item Points
      </Button>
      <br /><br /><br />
      <Button color="primary" on:click={onStartClick} disabled={!spoilerFile} variant="raised">
        <Label>Start Game</Label>
      </Button>
      <Button color="secondary" on:click={openHowToDialog} variant="raised">
        <Label>How To Play</Label>
      </Button>
      <Button color="secondary" href="/" variant="outlined">
        <Label>Games Home</Label>
      </Button>
    </Content>
  </Dialog>

  <CustomPtsDialog bind:isOpen={customPtsMenuOpen} onConfirmPts={handleUpdatePointValues} />

  <Dialog bind:open={inGameMenuOpen} surface$style="width: 450px">
    <Title id="inGameMenuTitle">Tracker Menu</Title>
    <Content id="inGameMenuContent">
      <Button color="primary" variant="outlined" on:click={toggleRevealAllRegions}>
        <Label>{revealRegionPoints ? 'Hide' : 'Show'} Region Points</Label>
      </Button>
      <t />
      <Button color="primary" variant="outlined" on:click={handleShowSolution}>
        <Label>{showSolution ? 'Hide' : 'Show'} Solution</Label>
      </Button>
      <br /><br />
      <Button color="secondary" on:click={openHowToDialog} variant="raised">
        <Label>How To Play</Label>
      </Button>
      <br /><br />
      <Button color="primary" on:click={handleStartNewGame} variant="raised">
        <Label>Start New Game</Label>
      </Button>
      <Actions>
        <Button>Close</Button>
      </Actions>
    </Content>
  </Dialog>

  <PointsHintDialog bind:isOpen={howToDialogOpen} />

  {#if regionPoints?.length > 0}
    {#if trackerLayout === 'compact1'}
      <CompactRegion1
        bind:baskets
        spoilerFile={spoilerFile}
        regionPoints={regionPoints}
        revealedRegions={revealedRegions}
        revealRegionPoints={revealRegionPoints}
        bind:selectedAvailableItem
        bind:selectedFoundItem
        showSolution={showSolution}
        handleOutsideRegionTableClick={handleOutsideRegionTableClick}
        checkToExposeRegion={checkToExposeRegion}
        openInGameMenu={openInGameMenu}
      />
    {:else}
      <ClassicRegion
        spoilerFile={spoilerFile}
        regionPoints={regionPoints}
        bind:baskets
        revealedRegions={revealedRegions}
        bind:selectedAvailableItem
        bind:selectedFoundItem
        showSolution={showSolution}
        revealRegionPoints={revealRegionPoints}
        handleOutsideRegionTableClick={handleOutsideRegionTableClick}
        checkToExposeRegion={checkToExposeRegion}
        openInGameMenu={openInGameMenu}
      />
    {/if}
  {/if}
</div>

<style>
  input.start-revealed {
    font-size: 1.5rem;
    height: 40px;
    margin-left: 20px;
    text-align: center;
    width: 70px;
  }

  .tracker-blurb {
    display: inline-block;
    font-size: 0.8rem;
    line-height: 1.5;
    margin-left: 10px;
    vertical-align: middle;
    width: 265px;
  }
</style>
