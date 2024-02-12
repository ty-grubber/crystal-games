<script>
  // @ts-nocheck
  import checkToExposeRegion from '$lib/checkToExposeRegion';
  import { extractPointsInfoFromSpoiler } from '$lib/extractFromSpoiler';
  import { getRandomHostID } from '$lib/randomize';
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import Tab, { Label as TabLabel } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import Textfield from '@smui/textfield';
  import CustomPtsDialog from '../../components/CustomPts.svelte';
  import PointsHintDialog from '../../components/HowTos/PointsHintDialog.svelte';
  import LayoutChooser from '../../components/LayoutChooser.svelte';
  import PointsSharedSettings from '../../components/PointsSharedSettings.svelte';
  import ClassicRegion from '../../components/Tracker/ClassicRegion.svelte';
  import CompactRegion1 from '../../components/Tracker/CompactRegion1.svelte';
  import SpectatorPoints from '../../components/Tracker/SpectatorPoints.svelte';
  import KEY_ITEMS from '../../constants/keyItemPresets';

  const HOST_ID_PREFIX = 'PCPT-';

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

  let playerName = '';
  let gameName = '';
  let hostID = getRandomHostID();
  let joinID = '';
  let isConnecting = false;
  let confirmOnRefresh = true;
  let isHost = false;
  let hostIsSpectator = true; // TODO: set this back to false when we have the checkbox in the form

  let currentPeer;
  let peerConnection;
  let connectionInfo;

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
        regionRevealOrder,
        regionPoints
      } = await extractPointsInfoFromSpoiler(spoilerFile, keyItems, revealOrdering));

      revealedRegions = regionRevealOrder.splice(0, initialRevealedRegions);

      if (activeTab === 'Host' && !currentPeer && playerName && gameName) {
        currentPeer = new Peer(`${HOST_ID_PREFIX}${hostID}`);
        isConnecting = true;
        currentPeer.on('open', function(id) {
          connectionInfo = {
            gameName,
            hostName: playerName,
            players: trackerLayout !== 'spectator' ? [{
              name: playerName,
              gameData: {},
            }] : [],
          };
          isConnecting = false;
          settingsDialogOpen = false;
        });

        // Send all vars above this if block and connection info to connector
        currentPeer.on('connection', function(conn) {
          peerConnection = conn;
          conn.on('open', function(id) {
            conn.send({
              connectionInfo,
              gameInfo: {
                baskets,
                regionRevealOrder,
                regionPoints,
                revealedRegions,
              }
            });
          })
          conn.on('data', function(data) {
            const {playerToAdd, playerToUpdate, ...rest} = data;
            if (playerToAdd) {
              connectionInfo.players = [
                ...connectionInfo.players,
                {
                  name: playerToAdd,
                  gameData: {
                    baskets,
                    regionRevealOrder,
                    regionPoints,
                    revealedRegions,
                  },
                },
              ];
              conn.send({
                connectionInfo,
              });
            } else if (playerToUpdate) {
              // we're getting updated game data
              if (isHost && hostIsSpectator) {
                const indexToUpdate = connectionInfo.players.findIndex(player => player.name === playerToUpdate)
                connectionInfo.players[indexToUpdate].gameData = rest;
              }
            }
          });
        });
        return;
      }
      settingsDialogOpen = false;
    }
  }

  function handleSettingsSubmit(settings) {
    isHost = activeTab === 'Host';
    ({
      trackerLayout,
      revealOrdering,
      initialRevealedRegions,
      spoilerFile
    } = settings);
    onStartClick();
  }

  function onConnectClick() {
    isConnecting = true;
    currentPeer = new Peer();
    currentPeer.on('open', function() {
      peerConnection = currentPeer.connect(`${HOST_ID_PREFIX}${joinID}`);

      peerConnection.on('open', function() {
        peerConnection.send({
          playerToAdd: playerName,
        });

        peerConnection.on('data', function(data) {
          connectionInfo = data.connectionInfo;
          if (data.gameInfo) {
            ({
              baskets,
              regionRevealOrder,
              regionPoints,
              revealedRegions,
            } = data.gameInfo);
          }
          isConnecting = false;
          settingsDialogOpen = false;
        });
      });
    });
  }

  function handleStartNewGame() {
    let confirmAction = 'and end your current one';

    if (joinID) {
      confirmAction = 'and end your connection to the current one'
    } else if (hostID) {
      confirmAction = 'and end all connections to the current one'
    }

    const confirmMessage = `Starting a new game will refresh the page ${confirmAction}. Are you sure you wish to start a new game?`

    if(confirm(confirmMessage)) {
      if (currentPeer) {
        currentPeer.destroy();
      }
      confirmOnRefresh = false;
      window.location.reload();
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

    // Send the new data to our host spectator
    // TODO? Should we delay the send with a timeout in case multiple come at once?
    if (connectionInfo && !isHost && hostIsSpectator) {
      peerConnection.send({
        playerToUpdate: playerName,
        baskets,
        regionRevealOrder,
        revealedRegions,
      });
    }
  }

  function beforeUnload(event) {
    if (regionPoints && confirmOnRefresh) {
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
  <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
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
          hostID={hostID}
          isConnecting={isConnecting}
          bind:playerName={playerName}
          bind:gameName={gameName}
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
          <Textfield
            bind:value={joinID}
            label="Host ID"
            variant="outlined"
          />
          <br /><br />
          <LayoutChooser bind:trackerLayout={trackerLayout} />
        </div>
        <br /><br /><br />
        <Button color="primary" on:click={onConnectClick} variant="raised">
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
      {#if spoilerFile && !connectionInfo}
        <p>
          Spoiler file name: {spoilerFile.name}
        </p>
      {/if}
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
      <br /><br />
      <h3>Credits</h3>
      <p class="credits">
        Key Item image sprites courtesy of <a href="https://gitlab.com/Sekii/pokemon-tracker" rel="noreferrer" target="_blank">Sekii's Pokémon Tracker</a> and Kovolta.&nbsp;
        {#if trackerLayout === 'classic'}
          Region map images created by Kovolta.
        {:else}
          Region ID images created by TyGr.
        {/if}
      </p>
      <Actions>
        <Button>Close</Button>
      </Actions>
    </Content>
  </Dialog>

  {#if regionPoints?.length > 0}
    {#if trackerLayout === 'spectator'}
      <h1>{gameName}</h1>
      {#if !connectionInfo || connectionInfo.players.length <= 0}
        Waiting for players to connect...
      {:else}
        {#each connectionInfo.players as player, i (player.name)}
          <SpectatorPoints
            baskets={player.gameData.baskets}
            playerName={player.name}
            regionPoints={regionPoints}
            revealedRegions={player.gameData.revealedRegions}
          />
        {/each}
      {/if}
    {:else if trackerLayout === 'compact1'}
      <CompactRegion1
        bind:baskets
        connectionInfo={connectionInfo}
        handleCheckToExposeRegion={handleCheckToExposeRegion}
        openInGameMenu={openInGameMenu}
        regionPoints={regionPoints}
        revealRegionPoints={revealRegionPoints}
        revealedRegions={revealedRegions}
        showSolution={showSolution}
      />
    {:else}
      <ClassicRegion
        bind:baskets
        connectionInfo={connectionInfo}
        handleCheckToExposeRegion={handleCheckToExposeRegion}
        openInGameMenu={openInGameMenu}
        regionPoints={regionPoints}
        revealRegionPoints={revealRegionPoints}
        revealedRegions={revealedRegions}
        showSolution={showSolution}
      />
    {/if}
  {/if}
</div>

<style>
  .join-wrapper {
    border: 1px solid #ff3e00;
    padding: 1rem;
  }
  .credits {
    font-size: 12px;
  }
</style>
