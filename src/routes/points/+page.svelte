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
  import PointsHowToPlayButton from '../../components/Buttons/PointsHowToPlay.svelte';
  import PointsSpectatorHelpButton from '../../components/Buttons/PointsSpectatorHelp.svelte';
  import CustomPtsDialog from '../../components/CustomPts.svelte';
  import LayoutChooser from '../../components/LayoutChooser.svelte';
  import PointsSharedSettings from '../../components/PointsSharedSettings.svelte';
  import ClassicRegion from '../../components/Tracker/ClassicRegion.svelte';
  import CompactRegion1 from '../../components/Tracker/CompactRegion1.svelte';
  import SpectatorPoints from '../../components/Tracker/SpectatorPoints.svelte';
  import KEY_ITEMS from '../../constants/keyItemPresets';
  import { peerJSConnectionConfig } from '../../constants/network';

  /**
   * @typedef {import("../../types/PointTracker").BasketItem} BasketItem
   * @typedef {import("../../types/PointTracker").Basket} Basket
   * @typedef {import("../../types/PointTracker").Connection} ConnectionInfo
   * @typedef {import("../../types/PointTracker").KeyItem} KeyItem
   * @typedef {import("../../types/PointTracker").Player} Player
   * @typedef {import("../../types/PointTracker").Region} Region
   */

  const HOST_ID_PREFIX = 'PCPT-';

  /** @type {Region[]} */
  let regionPoints;
  /** @type {Region[]} */
  let startingRegionPoints = [];
  /** @type {Basket[]} */
  let baskets;
  /** @type {Basket[]} */
  let startingBaskets = [];
  /** @type {number[]} */
  let regionRevealOrder;
  /** @type {number[]} */
  let startingRegionRevealOrder;
  /** @type {number[]} */
  let revealedRegions;
  /** @type {number[]} */
  let startingRevealedRegions;
  let showSolution = false;

  let settingsDialogOpen = true;
  let customPtsMenuOpen = false;
  let inGameMenuOpen = false;
  let activeTab = 'Solo';

  let newHostConnectionDialogOpen = false;
  let newHostConnectionID = '';
  let copiedHostId = false;

  let revealRegionPoints = false;
  /** @type {string} */
  let trackerLayout;
  /** @type {string} */
  let revealOrdering;
  /** @type {number} */
  let initialRevealedRegions;
  /** @type {any} */
  let spoilerFile;

  let keyItems = [...KEY_ITEMS];

  let playerName = '';
  let gameName = '';
  let hostID = getRandomHostID();
  let joinID = '';
  let isConnecting = false;
  let confirmOnRefresh = true;
  let isHost = false;
  let hostIsSpectator = false;
  let revealHostID = false;

  /** @type {any} */
  let currentPeer;
  /** @type {any} */
  let hostConnection;
  /** @type {any[]} */
  let peerConnections;
    /** @type {ConnectionInfo} */
  let connectionInfo;

  function openSettingsDialog() {
    settingsDialogOpen = true;
  }

  function openCustomPointsDialog() {
    customPtsMenuOpen = true;
  }

  function openInGameMenu() {
    inGameMenuOpen = true;
    revealHostID = false;
  }

  function showHostID() {
    revealHostID = true;
  }

  function handleShowSolution() {
    showSolution = !showSolution;
  }

  function toggleRevealAllRegions() {
    revealRegionPoints = !revealRegionPoints;
  }

  /**
   * @param {KeyItem[]} updatedKeyItems
   */
  function handleUpdatePointValues(updatedKeyItems) {
    keyItems = [...updatedKeyItems];
    customPtsMenuOpen = false;
  }

  function establishHostConnections() {
    // @ts-ignore
    currentPeer = new Peer(`${HOST_ID_PREFIX}${newHostConnectionID || hostID}`, {
      config: peerJSConnectionConfig,
      debug: 0,
    });
    isConnecting = true;
    currentPeer.on('open', function () {
      connectionInfo = {
        gameName,
        hostName: playerName,
        hostIsSpectator,
        isConnected: true,
        players:
          trackerLayout !== 'spectator'
            ? [
                {
                  name: playerName,
                  gameData: {},
                },
              ]
            : [],
      };
      isConnecting = false;
      settingsDialogOpen = false;
    });

    currentPeer.on('close', function () {
      connectionInfo.isConnected = false;
    });

    currentPeer.on('disconnected', function () {
      connectionInfo.isConnected = false;
    });

    // Send all vars above this if block and connection info to connector
    currentPeer.on('connection', function (/** @type {any} */ conn) {
      // see if this is an existing player re-connecting
      const existingConnectionIndex = peerConnections.findIndex(pc => pc.peer === conn.peer);
      const connectionExists = existingConnectionIndex < 0;
      if (connectionExists) {
        peerConnections.push(conn);
      } else {
        peerConnections[existingConnectionIndex] = conn;
      }
      peerConnections = peerConnections;

      conn.on('open', function () {
        conn.send({
          connectionInfo,
          gameInfo: {
            baskets: startingBaskets,
            regionRevealOrder: startingRegionRevealOrder,
            regionPoints: startingRegionPoints,
            revealedRegions: startingRevealedRegions,
          },
        });
      });
      conn.on('data', function (/** @type {any} */ data) {
        const { playerToAdd, playerToUpdate, ...rest } = data;
        if (playerToAdd) {
          // Only add the player if they don't already exist (ie. if they've reconnected)
          if (
            connectionInfo.players.findIndex(
              (/** @type {Player} */ player) => player.name === playerToAdd
            ) < 0
          ) {
            connectionInfo.players = [
              ...connectionInfo.players,
              {
                name: playerToAdd,
                gameData: {
                  baskets: startingBaskets,
                  regionRevealOrder: startingRegionRevealOrder,
                  regionPoints: startingRegionPoints,
                  revealedRegions: startingRevealedRegions,
                },
              },
            ];
            peerConnections.forEach(connection => {
              connection.send({
                connectionInfo,
              });
            });
          }
        } else if (playerToUpdate) {
          // we're getting updated game data
          if (isHost && hostIsSpectator) {
            const indexToUpdate = connectionInfo.players.findIndex(
              (/** @type {Player} */ player) => player.name === playerToUpdate
            );
            connectionInfo.players[indexToUpdate].gameData = rest;
          }
        }
      });
    });
  }

  async function onStartClick() {
    if (spoilerFile != null) {
      ({
        baskets: startingBaskets,
        regionRevealOrder: startingRegionRevealOrder,
        regionPoints: startingRegionPoints,
      } = (await extractPointsInfoFromSpoiler(spoilerFile, keyItems, revealOrdering)) || {
        baskets: [],
        regionRevealOrder: [],
        regionPoints: [],
      });

      startingRevealedRegions = startingRegionRevealOrder.splice(0, initialRevealedRegions);

      // Make copies so we don't affect the originals
      baskets = startingBaskets.map(basket => ({ ...basket, items: [...basket.items] }));
      regionRevealOrder = startingRegionRevealOrder.map(rro => rro);
      regionPoints = startingRegionPoints.map(rp => ({ ...rp }));
      revealedRegions = startingRevealedRegions.map(rr => rr);

      if (activeTab === 'Host' && !currentPeer && playerName && gameName) {
        establishHostConnections();
        return;
      }
      settingsDialogOpen = false;
    }
  }

  /**
   * @param {{ trackerLayout: string; revealOrdering: string; initialRevealedRegions: number; spoilerFile: any; }} settings
   */
  function handleSettingsSubmit(settings) {
    isHost = activeTab === 'Host';
    ({ trackerLayout, revealOrdering, initialRevealedRegions, spoilerFile } = settings);
    hostIsSpectator = trackerLayout === 'spectator';
    onStartClick();
  }

  /** @param {string|void} id */
  function establishConnectionToHost(id) {
    hostConnection = currentPeer.connect(`${HOST_ID_PREFIX}${id || joinID}`);

    hostConnection.on('open', function () {
      hostConnection.send({
        playerToAdd: playerName,
      });

      hostConnection.on('data', function (/** @type {any} */ data) {
        connectionInfo = data.connectionInfo;
        // Don't need to update our existing game data if we already have the info from the spoiler (ie. we reconnected to the host)
        if (data.gameInfo && !regionPoints) {
          ({ baskets, regionRevealOrder, regionPoints, revealedRegions } = data.gameInfo);
        }
        ({ hostIsSpectator } = connectionInfo);
        connectionInfo.isConnected = true;
        isConnecting = false;
        settingsDialogOpen = false;
      });
    });

    hostConnection.on('close', function () {
      connectionInfo.isConnected = false;
    });
  }

  function onConnectClick() {
    isConnecting = true;
    // @ts-ignore
    currentPeer = new Peer(`${HOST_ID_PREFIX}${hostID}`, {
      config: peerJSConnectionConfig,
      debug: 0,
    });
    currentPeer.on('open', function () {
      establishConnectionToHost();
    });
  }

  function onDisconnectClick() {
    if (!isHost) {
      hostConnection.close();
    }
    currentPeer.disconnect();
  }

  /**
   * @param {string} id
   */
  function onReconnect(id) {
    if (!isHost) {
      isConnecting = true;
      if (currentPeer.disconnected) {
        currentPeer.reconnect();
        establishConnectionToHost(id);
      } else {
        // re-create a connection to the PeerServer so we can reconnect to the host
        // @ts-ignore
        currentPeer = new Peer(`${HOST_ID_PREFIX}${hostID}`, {
          config: peerJSConnectionConfig,
          debug: 0,
        });
        currentPeer.on('open', function () {
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

    if (isHost) {
      confirmAction = 'and end all connections to the current one';
    } else if (joinID) {
      confirmAction = 'and end your connection to the current one';
    }

    const confirmMessage = `Starting a new game will refresh the page ${confirmAction}. Are you sure you wish to start a new game?`;

    if (confirm(confirmMessage)) {
      if (currentPeer) {
        currentPeer.destroy();
      }
      confirmOnRefresh = false;
      window.location.reload();
    }
  }

  /**
   * @param {Basket} originalBasket
   * @param {Basket} targetBasket
   * @param {BasketItem} movedItem
   */
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

  /**
   * @param {string} swapInPlayerName
   * @param {string} activeSlot
   */
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

    setTimeout(() => (copiedHostId = false), 5000);
  }

  /**
   * @param {any} event
   */
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
  <meta
    property="description"
    content="Host or join a points hint tracker race without sharing the spoiler log to all participants"
  />
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
    <PointsHowToPlayButton />
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
          {openCustomPointsDialog}
          showNetworking={true}
          {hostID}
          {isConnecting}
          bind:playerName
          bind:gameName
        />
      {:else if activeTab === 'Solo'}
        <PointsSharedSettings onSubmit={handleSettingsSubmit} {openCustomPointsDialog} />
      {:else}
        <div class="join-wrapper">
          <span>
            <small> Do not stream this modal as unwanted players will be able to join </small>
          </span>
          <br /><br />
          <Textfield bind:value={playerName} label="Player Name" variant="outlined" />
          <Textfield bind:value={joinID} label="Host ID" variant="outlined" />
          <br /><br />
          <LayoutChooser bind:trackerLayout />
        </div>
        <br /><br /><br />
        <Button
          color="primary"
          disabled={!playerName || !joinID || isConnecting}
          on:click={onConnectClick}
          variant="raised"
        >
          <Label>Connect</Label>
        </Button>
        <PointsHowToPlayButton />
        <Button color="secondary" href="/" variant="outlined">
          <Label>Games Home</Label>
        </Button>
      {/if}
    </Content>
  </Dialog>

  <CustomPtsDialog bind:isOpen={customPtsMenuOpen} onConfirmPts={handleUpdatePointValues} />

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
      {#if connectionInfo && isHost && hostID}
        <p>
          My Host ID:&nbsp;
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <span on:click={showHostID}>
            {#if revealHostID}
              <b><i>{hostID}</i></b>
            {:else}
              <u><i>Click To Reveal</i></u>
            {/if}
          </span>
          <br />
          <span><small>Do not stream this ID as unwanted players will be able to join</small></span>
        </p>
      {/if}
      {#if isHost && hostIsSpectator}
        <PointsSpectatorHelpButton />
      {:else}
        <PointsHowToPlayButton />
      {/if}
      <br /><br />
      <Button color="primary" on:click={handleStartNewGame} variant="raised">
        <Label>Start New Game</Label>
      </Button>
      <br /><br />
      <h3>Credits</h3>
      <p class="credits">
        Key Item image sprites courtesy of&nbsp;
        <a href="https://gitlab.com/Sekii/pokemon-tracker" rel="noreferrer" target="_blank">
          Sekii's Pokémon Tracker
        </a>
        &nbsp;and Kovolta.&nbsp;
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

  <Dialog bind:open={newHostConnectionDialogOpen} surface$style="min-height: 200px">
    <Title>Create New Host Connection</Title>
    <Content>
      <!-- This is duplicated from PointsSharedSettings and should be moved in a separate component -->
      <span><small>Do not stream this modal as unwanted players will be able to join</small></span>
      <br /><br />
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
          {copiedHostId
            ? 'Copied!!!'
            : 'Click here to copy this ID for players to connect to your game'}
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
              {regionPoints}
              revealedRegions={player.gameData.revealedRegions}
            />
          {/each}
          <div class="spectator-actions">
            <Button color="secondary" on:click={openInGameMenu} variant="raised">
              <Label>Menu</Label>
            </Button>
          </div>
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
                {regionPoints}
                revealedRegions={player.gameData.revealedRegions}
              />
            {/each}
          </div>
        {/if}
      {/if}
      <br /><br />
    {:else if trackerLayout === 'compact1'}
      <CompactRegion1
        bind:baskets
        {connectionInfo}
        {handleCheckToExposeRegion}
        {isHost}
        onDisconnect={onDisconnectClick}
        {onReconnect}
        {openInGameMenu}
        {regionPoints}
        {revealRegionPoints}
        {revealedRegions}
        {showSolution}
      />
    {:else}
      <ClassicRegion
        bind:baskets
        {connectionInfo}
        {handleCheckToExposeRegion}
        {isHost}
        onDisconnect={onDisconnectClick}
        {onReconnect}
        {openInGameMenu}
        {regionPoints}
        {revealRegionPoints}
        {revealedRegions}
        {showSolution}
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

  .spectator-actions {
    display: flex;
    margin: 1rem 2rem;
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
