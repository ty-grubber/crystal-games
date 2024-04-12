<script>
  import Button, { Label } from '@smui/button';
  import Dialog, { Content, Title } from '@smui/dialog';
  import Textfield from '@smui/textfield';

  /**
   * @type {{ gameName: string; hostName: string; isConnected: boolean, players: {name: string; gameData: object}[]; }}
   */
  export let connectionInfo;
  /**
   * @type boolean
   */
  export let isHost;

  export let onReconnect = (/** @type {any} */ id) => {};
  export let onDisconnect = () => {};

  let reconnectDialogOpen = false;
  /**
   * @type {string}
   */
  let reconnectJoinID = '';

  function handleConnectButtonClicked() {
    if (connectionInfo.isConnected && !isHost) {
      if (
        confirm(
          'You are attempting to disconnect from your current game and will be unable to send any updates to the host? This will not affect your ability to use your tracker. Are you sure you wish to disconnect?'
        )
      ) {
        onDisconnect();
      }
    } else if (connectionInfo.isConnected && isHost) {
      if (
        confirm(
          'You are attempting to disconnect from your current game and will be unable to receive any updates from other players and cannot send game info to new players. Are you sure you wish to disconnect?'
        )
      ) {
        onDisconnect();
      }
    } else if (!isHost) {
      reconnectDialogOpen = true;
    } else {
      onReconnect();
    }
  }

  /**
   * @param {any} id
   */
  function handleReconnect(id) {
    reconnectDialogOpen = false;
    onReconnect(id);
  }
</script>

<div class="game-info" class:disconnected={!connectionInfo.isConnected}>
  <b>Game Name: </b>{connectionInfo.gameName}
  <br />
  {#if connectionInfo.hostName !== connectionInfo.players[0]?.name}
    <b>Host Name: </b>{connectionInfo.hostName}
    <br />
  {/if}
  <b>Players:</b>
  <br />
  <ul class="player-list">
    {#each connectionInfo.players as player, playerIndex}
      <li class="player">
        {player.name}{player.name === connectionInfo.hostName ? ' (Host)' : ''}
      </li>
    {/each}
  </ul>
  <br />
  <Button color="primary" on:click={handleConnectButtonClicked}>
    {connectionInfo.isConnected ? 'Disconnect' : 'Reconnect'}
  </Button>
</div>

<Dialog bind:open={reconnectDialogOpen} surface$style="min-height: 200px">
  <Title>Reconnect To Host</Title>
  <Content>
    <span><small>Do not stream this modal as unwanted players will be able to join</small></span>
    <br /><br />
    <Textfield bind:value={reconnectJoinID} label="Host ID" variant="outlined" />
    <br /><br />
    <Button color="primary" disabled={!reconnectJoinID} on:click={handleReconnect} variant="raised">
      <Label>Reconnect To Host</Label>
    </Button>
  </Content>
</Dialog>

<style>
  .game-info {
    border: 2px solid #454;
    margin-top: 1rem;
    padding: 1rem 1rem 0.5rem;
  }

  .game-info.disconnected {
    border-color: #aa0000;
  }

  .player-list {
    display: inline-flex;
    flex-wrap: wrap;
    margin-top: 0.25rem;
    margin-bottom: 0;
    min-width: 400px;
  }

  .player {
    list-style-type: circle;
    margin-bottom: 0.5rem;
    width: 50%;
  }
</style>
