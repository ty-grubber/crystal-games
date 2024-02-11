<script>
  /**
	 * @type {{ gameName: string; hostName: string; players: {name: string; gameData: object}[]; }}
	 */
  export let connectionInfo;
</script>

<div class="game-info">
  <b>Game Name: </b>{connectionInfo.gameName}
  <br />
  <b>Players:</b>
  <br />
  <ul class="player-list">
    {#each connectionInfo.players as player, playerIndex}
      <li class="player">{player.name}{playerIndex === 0 ? ' (Host)' : ''}</li>
    {/each}
  </ul>
</div>

<style>
  .game-info {
    border: 2px solid #444;
    margin-top: 1rem;
    padding: 1rem 1rem 0.5rem;
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
