<script>
// @ts-nocheck
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import Tab, { Label as TabLabel } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import CustomPtsDialog from '../../../components/CustomPts.svelte';
	import PointsHintDialog from '../../../components/HowTos/PointsHintDialog.svelte';
	import PointsSharedSettings from '../../../components/PointsSharedSettings.svelte';
	import CompactRegion1 from '../../../components/Tracker/CompactRegion1.svelte';
	import ClassicRegion from '../../../components/Tracker/ClassicRegion.svelte';
  import KEY_ITEMS from '../../../constants/keyItemPresets';

  let regionPoints;

  let baskets = [];
  let regionRevealOrder = [];
  let revealedRegions = [];
  let showSolution = false;

  let settingsDialogOpen = true;
  let howToDialogOpen = false;
  let customPtsMenuOpen = false;
  let inGameMenuOpen = false;
  let activeTab = 'Host';

  let revealRegionPoints = false;
  let trackerLayout;
  let revealOrdering;
  let initialRevealedRegions;
  let spoilerFile;

  let selectedAvailableItem = {};
  let selectedFoundItem = {};

  let keyItems = [ ...KEY_ITEMS];
  let keyItemPointValues = [9, 7, 5, 3];

  function openSettingsDialog() {
    settingsDialogOpen = true;
  }

  function openHowToDialog() {
    howToDialogOpen = true;
  }

  function openCustomPointsDialog() {
    customPtsMenuOpen = true;
  }

  function openInGameMenu() {
    inGameMenuOpen = true;
  }

  function handleShowSolution() {
    showSolution = !showSolution;
  }

  function toggleRevealAllRegions() {
    revealRegionPoints = !revealRegionPoints;
  }

  function handleUpdatePointValues(updatedKeyItems) {
    keyItems = [...updatedKeyItems]
    customPtsMenuOpen = false;
  }

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

      const rngSeed = extraction.rngSeed || file.name;
      switch (revealOrdering) {
        case 'random':
          regionsWithTotalPoints = randomizeArray(regionsWithTotalPoints, rngSeed);
        default:
          regionsWithTotalPoints = randomTiesSorting(regionsWithTotalPoints, revealOrdering, rngSeed);
      }
      regionRevealOrder = regionsWithTotalPoints.map(r => r.id);
      revealedRegions = regionRevealOrder.splice(0, initialRevealedRegions);
      settingsDialogOpen = false;
    }
  }

  function handleSettingsSubmit(settings) {
    trackerLayout = settings.trackerLayout;
    revealOrdering = settings.revealOrdering;
    initialRevealedRegions = settings.initialRevealedRegions;
    spoilerFile = settings.spoilerFile;
    onStartClick();
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

  function beforeUnload(event) {
    if (regionPoints) {
      event.preventDefault();
      return (event.returnValue = '');
    }
  }
</script>

<svelte:window on:beforeunload={beforeUnload} />

<svelte:head>
  <title>Pokémon Crystal Points Hint Tracker Race Connection</title>
  <meta property="description" content="Host or join a points hint tracker race without sharing the spoiler log to all participants" />
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
    <Content id="settingsTabbedContent">
      <TabBar tabs={['Host', 'Join']} let:tab bind:activeTab>
        <Tab {tab}>
          <TabLabel>{tab}</TabLabel>
        </Tab>
      </TabBar>
      {#if activeTab === 'Host'}
        <PointsSharedSettings
          onSubmit={handleSettingsSubmit}
          openHowToDialog={openHowToDialog}
          openCustomPointsDialog={openCustomPointsDialog}
          showNetworking
        />
      {:else}
        This is the Join content
      {/if}
    </Content>
  </Dialog>

  <CustomPtsDialog bind:isOpen={customPtsMenuOpen} onConfirmPts={handleUpdatePointValues} />

  <PointsHintDialog bind:isOpen={howToDialogOpen} />

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
