<script>
  import Button, { Label } from '@smui/button';
</script>

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
</style>

