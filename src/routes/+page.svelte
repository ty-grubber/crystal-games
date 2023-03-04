<script>
  import Button, { Label } from '@smui/button';
</script>

<svelte:head>
  <title>Pokémon Crystal Randomizer Games Home</title>
</svelte:head>

<div class="page">
  <h1>Pokémon Crystal Randomizer Games</h1>
  <div class="game-cell">
    <Button color="primary" href="/hunt" variant="raised">
      <Label>Rival Treasure Hunt</Label>
    </Button>
    <p>Race to find hidden treasures and defeat rivals around Johto and Kanto!</p>
  </div>
  <div class="game-cell">
    <Button color="primary" href="/minesweeper" variant="raised">
      <Label>Pokédex Minesweeper</Label>
    </Button>
    <p>Clear the minefield by using logic and catching Pokémon!</p>
  </div>
  <div class="game-cell">
    <Button color="primary" href="/points" variant="raised">
      <Label>Points Hint Tracker</Label>
    </Button>
    <p>Streamline your randomizer by using a point location hint system!</p>
  </div>
  <br /><br /><br />
  <b>Credits:</b>
  <p class="credits">
    Designed & created by tigertygr28 (TyGr) & Kovolta<br />
    Like these games? We make board games, too! Check out <a href="https://www.thegamecrafter.com/designers/dastardly-fun-entertainment" target="_blank" rel="noreferrer">our games on TheGameCrafter</a>
  </p>
</div>

<style>
  .page {
    width: 800px;
    margin: auto;
  }

  .game-cell {
    display: inline-flex;
    align-items: center;
  }

  .game-cell > p {
    margin-left: 1rem;
  }

  .credits {
    font-size: 14px;
  }
</style>

