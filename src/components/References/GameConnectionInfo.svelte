<div class="game-info">
  <b>Game Name:</b>
  <br />
  <b>Host: </b>Test Host
  <br />
  <b>Players:</b>
  <br />
  <ul class="player-list">
    <li class="player">Test Host</li>
    <li class="player">Player 1</li>
    <li class="player">Really Long Player Name just because</li>
    <li class="player">Player 3</li>
    <li class="player">Player 4</li>
    <li class="player">Player 5</li>
    <li class="player">Player 6</li>
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
  }

  .player {
    list-style-type: circle;
    margin-bottom: 0.5rem;
    width: 50%;
  }
</style>
