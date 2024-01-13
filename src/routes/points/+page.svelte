<script>
  // @ts-nocheck
  import checkToExposeRegion from '$lib/checkToExposeRegion';
  import { extractPointsInfoFromSpoiler } from '$lib/extractFromSpoiler';
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import Tab, { Label as TabLabel } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
	import Textfield from '@smui/textfield';
  import CustomPtsDialog from '../../components/CustomPts.svelte';
  import PointsHintDialog from '../../components/HowTos/PointsHintDialog.svelte';
  import PointsSharedSettings from '../../components/PointsSharedSettings.svelte';
  import ClassicRegion from '../../components/Tracker/ClassicRegion.svelte';
  import CompactRegion1 from '../../components/Tracker/CompactRegion1.svelte';
  import KEY_ITEMS from '../../constants/keyItemPresets';
	import LayoutChooser from '../../components/LayoutChooser.svelte';

  let regionPoints;

  let baskets = [];
  let regionRevealOrder = [];
  let revealedRegions = [];
  let showSolution = false;

  let settingsDialogOpen = true;
  let howToDialogOpen = false;
  let customPtsMenuOpen = false;
  let inGameMenuOpen = false;
  let activeTab = 'Solo';

  let revealRegionPoints = false;
  let trackerLayout;
  let revealOrdering;
  let initialRevealedRegions;
  let spoilerFile;

  let keyItems = [ ...KEY_ITEMS];
  let keyItemPointValues = [9, 7, 5, 3];

  let playerName;
  let gameName;
  let hostID;

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
    if (spoilerFile != null) {
      ({
        baskets,
        keyItemPointValues,
        regionRevealOrder,
        regionPoints
      } = await extractPointsInfoFromSpoiler(spoilerFile, keyItems, revealOrdering));

      revealedRegions = regionRevealOrder.splice(0, initialRevealedRegions);
      settingsDialogOpen = false;
    }
  }

  function handleSettingsSubmit(settings) {
    ({
      trackerLayout,
      revealOrdering,
      initialRevealedRegions,
      spoilerFile
    } = settings);
    onStartClick();
  }

  function onConnect() {}

  function handleStartNewGame() {
    if(confirm('Starting a new game will end the current one. Are you sure you wish to start a new game?')) {
      spoilerFile = null;
      regionPoints = null;
      baskets = [];
      regionRevealOrder = [];
      revealedRegions = [];
      revealOrdering = 'random';
      showSolution = false;
      revealRegionPoints = false;
      initialRevealedRegions = 1;
      howToDialogOpen = false;
      inGameMenuOpen = false;
      settingsDialogOpen = true;
    }
  }

  function handleCheckToExposeRegion(originalBasket, targetBasket, movedItem) {
    ({ regionRevealOrder, revealedRegions } = checkToExposeRegion(
      originalBasket.type,
      targetBasket.type,
      movedItem.points,
      regionRevealOrder,
      revealedRegions
    ));
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
      <TabBar tabs={['Solo', 'Host', 'Join']} let:tab bind:active={activeTab}>
        <Tab {tab}>
          <TabLabel>{tab}</TabLabel>
        </Tab>
      </TabBar>
      {#if activeTab === 'Host'}
        <PointsSharedSettings
          onSubmit={handleSettingsSubmit}
          openHowToDialog={openHowToDialog}
          openCustomPointsDialog={openCustomPointsDialog}
          showNetworking={true}
          bind:playerName={playerName}
          bind:gameName={gameName}
          bind:hostID={hostID}
        />
      {:else if activeTab === 'Solo'}
        <PointsSharedSettings
          onSubmit={handleSettingsSubmit}
          openHowToDialog={openHowToDialog}
          openCustomPointsDialog={openCustomPointsDialog}
        />
      {:else}
        <div class="join-wrapper">
          <Textfield
            bind:value={playerName}
            label="Player Name"
            variant="outlined"
          />
          <br />
          <Textfield
            bind:value={hostID}
            label="Host ID"
            variant="outlined"
          />
          <br />
          <LayoutChooser bind:trackerLayout={trackerLayout} />
        </div>
        <br /><br /><br />
        <Button color="primary" on:click={onConnect} variant="raised">
          <Label>Connect</Label>
        </Button>
        <Button color="secondary" on:click={openHowToDialog} variant="raised">
          <Label>How To Play</Label>
        </Button>
        <Button color="secondary" href="/" variant="outlined">
          <Label>Games Home</Label>
        </Button>
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
        showSolution={showSolution}
        checkToExposeRegion={handleCheckToExposeRegion}
        openInGameMenu={openInGameMenu}
        keyItemPointValues={keyItemPointValues}
      />
    {:else}
      <ClassicRegion
        spoilerFile={spoilerFile}
        regionPoints={regionPoints}
        bind:baskets
        revealedRegions={revealedRegions}
        showSolution={showSolution}
        revealRegionPoints={revealRegionPoints}
        checkToExposeRegion={handleCheckToExposeRegion}
        openInGameMenu={openInGameMenu}
        keyItemPointValues={keyItemPointValues}
      />
    {/if}
  {/if}
</div>

<style>
  .join-wrapper {
    border: 1px solid grey;
    padding: 1rem;
  }
</style>
