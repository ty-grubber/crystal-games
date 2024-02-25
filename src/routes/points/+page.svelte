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
  import { peerJSConnectionConfig } from '../../constants/network';

  const HOST_ID_PREFIX = 'PCPT-';

  let regionPoints;

  let baskets = [];
  let regionRevealOrder = [];
  let revealedRegions = [];
  let showSolution = false;

  let settingsDialogOpen = true;
  let howToDialogOpen = false;
  let howToSpectatorOpen = false;
  let customPtsMenuOpen = false;
  let inGameMenuOpen = false;
  let activeTab = 'Solo';

  let newHostConnectionDialogOpen = false;
  let newHostConnectionID = '';
  let copiedHostId = false;

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
  let hostIsSpectator = false;

  let currentPeer;
  let hostConnection;
  let peerConnections = [];
  let connectionInfo;

  function openSettingsDialog() {
    settingsDialogOpen = true;
  }

  function openHowToDialog() {
    howToDialogOpen = true;
  }

  function openSpectatorDialog() {
    howToSpectatorOpen = true;
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

  function establishHostConnections() {
    currentPeer = new Peer(`${HOST_ID_PREFIX}${newHostConnectionID || hostID}`, {
      config: peerJSConnectionConfig,
      debug: 2, // TODO: reset to 0 when we go to production
    });
    isConnecting = true;
    currentPeer.on('open', function(id) {
      connectionInfo = {
        gameName,
        hostName: playerName,
        hostIsSpectator,
        isConnected: true,
        players: trackerLayout !== 'spectator' ? [{
          name: playerName,
          gameData: {},
        }] : [],
      };
      isConnecting = false;
      settingsDialogOpen = false;
    });

    currentPeer.on('close', function() {
      connectionInfo.isConnected = false;
    });

    currentPeer.on('disconnected', function() {
      connectionInfo.isConnected = false;
    })

    // Send all vars above this if block and connection info to connector
    currentPeer.on('connection', function(conn) {
      peerConnections.push(conn);
      peerConnections = peerConnections;
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
      });
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
          peerConnections.forEach(connection => {
            connection.send({
              connectionInfo,
            });
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
        establishHostConnections();
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
    hostIsSpectator = trackerLayout === 'spectator';
    onStartClick();
  }

  function establishConnectionToHost(id) {
    hostConnection = currentPeer.connect(`${HOST_ID_PREFIX}${id || joinID}`);

    hostConnection.on('open', function() {
      hostConnection.send({
        playerToAdd: playerName,
      });

      hostConnection.on('data', function(data) {
        connectionInfo = data.connectionInfo;
        // Don't need to update our existing game data if we already have the info from the spoiler (ie. we reconnected to the host)
        if (data.gameInfo && !regionPoints) {
          ({
            baskets,
            regionRevealOrder,
            regionPoints,
            revealedRegions,
          } = data.gameInfo);
        }
        ({ hostIsSpectator } = connectionInfo);
        connectionInfo.isConnected = true;
        isConnecting = false;
        settingsDialogOpen = false;
      });
    });

    hostConnection.on('close', function() {
      connectionInfo.isConnected = false;
    });
  }

  function onConnectClick() {
    isConnecting = true;
    currentPeer = new Peer({
      config: peerJSConnectionConfig,
      debug: 2, // TODO: Reset this to 0 when we go to production
    });
    currentPeer.on('open', function() {
      establishConnectionToHost();
    });
  }

  function onDisconnectClick() {
    hostConnection.close();
    currentPeer.disconnect();
  }

  function onReconnect(id) {
    if (!isHost) {
      isConnecting = true;
      if (currentPeer.disconnected) {
        currentPeer.reconnect();
        establishConnectionToHost(id);
      } else {
        // re-create a connection to the PeerServer so we can reconnect to the host
        currentPeer = new Peer({
          config: peerJSConnectionConfig,
          debug: 2, // TODO: Reset this to 0 when we go to production
        });
        currentPeer.on('open', function() {
          establishConnectionToHost(id);
        });
      }
    } else {
      if (currentPeer.disconnected) {
        currentPeer.reconnect();
      } else {
        // Create a new connection to the PeerServer and the players will have to reconnect to the new host
        newHostConnectionDialogOpen = true;
        newHostConnectionID = getRandomHostID();
      }
    }
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
    if (connectionInfo?.isConnected && !isHost && hostIsSpectator) {
      hostConnection.send({
        playerToUpdate: playerName,
        baskets,
        regionRevealOrder,
        revealedRegions,
      });
    }
  }

  function handleActivatePlayer(swapInPlayerName, activeSlot) {
    const newPlayerOrder = [...connectionInfo.players];
    const swapInPlayerIndex = newPlayerOrder.findIndex(player => player.name === swapInPlayerName);
    const swapOutPlayer = newPlayerOrder[parseInt(activeSlot, 10)];
    const swapInPlayer = newPlayerOrder[swapInPlayerIndex];

    newPlayerOrder[parseInt(activeSlot, 10)] = swapInPlayer;
    newPlayerOrder[swapInPlayerIndex] = swapOutPlayer;

    connectionInfo.players = newPlayerOrder;
  }

  function copyNewHostID() {
    navigator.clipboard.writeText(newHostConnectionID);
    copiedHostId = true;

    setTimeout(() => copiedHostId = false, 5000);
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
        <Button
          color="primary"
          disabled={!playerName || !joinID || isConnecting }
          on:click={onConnectClick}
          variant="raised"
        >
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

  <PointsHintDialog bind:isOpen={howToDialogOpen} bind:spectatorTrackerDialogOpen={howToSpectatorOpen} />

  <Dialog bind:open={inGameMenuOpen} surface$style="width: 450px">
    <Title id="inGameMenuTitle">Tracker Menu</Title>
    <Content id="inGameMenuContent">
      {#if spoilerFile && !connectionInfo}
        <p>
          Spoiler file name: {spoilerFile.name}
        </p>
      {/if}
      {#if !connectionInfo}
        <Button color="primary" variant="outlined" on:click={toggleRevealAllRegions}>
          <Label>{revealRegionPoints ? 'Hide' : 'Show'} Region Points</Label>
        </Button>
        <t />
        <Button color="primary" variant="outlined" on:click={handleShowSolution}>
          <Label>{showSolution ? 'Hide' : 'Show'} Solution</Label>
        </Button>
        <br /><br />
      {/if}
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

  <Dialog bind:open={newHostConnectionDialogOpen}>
    <Title>Create New Host Connection</Title>
    <Content>
      <!-- This is duplicated from PointsSharedSettings and should be moved in a separate component -->
      <Textfield
        disabled
        label="New Private Host ID"
        style="cursor: copy; pointer-events: unset;"
        value={newHostConnectionID}
        variant="outlined"
      />
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div class="field-blurb" on:click={copyNewHostID}>
        <span>
          {copiedHostId ? 'Copied!!!' : 'Click here to copy this ID for players to connect to your game'}
        </span>
      </div>
      <br /><br />
      <Button
        color="primary"
        disabled={!newHostConnectionID}
        on:click={establishHostConnections}
        variant="raised"
      >
        <Label>Create New Host</Label>
      </Button>
    </Content>
  </Dialog>

  {#if regionPoints?.length > 0}
    {#if isHost && hostIsSpectator}
      <h1>{gameName}</h1>
      {#if !connectionInfo || connectionInfo.players.length <= 0}
        Waiting for players to connect...
      {:else}
        <div class="spectator-trackers">
          {#each connectionInfo.players.slice(0, 2) as player, i (player.name)}
            <SpectatorPoints
              baskets={player.gameData.baskets}
              onActivatePlayer={handleActivatePlayer}
              playerName={player.name}
              regionPoints={regionPoints}
              revealedRegions={player.gameData.revealedRegions}
            />
          {/each}
        </div>
        {#if connectionInfo.players.length > 2}
          <div class="other-players">
            <br />
            <b>Other Players:</b>
            <br />
            {#each connectionInfo.players.slice(2) as player, i (player.name)}
              <SpectatorPoints
                baskets={player.gameData.baskets}
                isActive={false}
                onActivatePlayer={handleActivatePlayer}
                playerName={player.name}
                regionPoints={regionPoints}
                revealedRegions={player.gameData.revealedRegions}
              />
            {/each}
          </div>
        {/if}
      {/if}
      <br /><br />
      <Button color="secondary" on:click={openSpectatorDialog} variant="raised">
        <Label>Spectator Host Help</Label>
      </Button>
    {:else if trackerLayout === 'compact1'}
      <CompactRegion1
        bind:baskets
        connectionInfo={connectionInfo}
        handleCheckToExposeRegion={handleCheckToExposeRegion}
        isHost={isHost}
        onDisconnect={onDisconnectClick}
        onReconnect={onReconnect}
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
        isHost={isHost}
        onDisconnect={onDisconnectClick}
        onReconnect={onReconnect}
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

  .spectator-trackers {
    display: flex;
  }

  .other-players {
    max-width: 800px;
    margin: 1rem;
  }

  .other-players b {
    font-size: 20px;
  }

  .credits {
    font-size: 12px;
  }

  .field-blurb {
    cursor: copy;
    display: inline-block;
    font-size: 0.8rem;
    line-height: 1.5;
    margin-left: 1rem;
    vertical-align: middle;
    width: 225px;
  }
</style>
