<script>
  import { NATIONAL_DEX } from '../../constants/pokedex';
</script>

<div class="container">
  <h1>Pokémon Crystal Minesweeper</h1>

  <div class="dex-grid">
    {#each NATIONAL_DEX as pokemon, i (pokemon.id)}
      <div class="dex-mon">
        <img class="mon-icon" src={`/pokedex/${pokemon.id}.png`} alt={pokemon.name} />
      </div>
    {/each}
  </div>
</div>

<style>
  .dex-grid {
    display: flex;
    flex-wrap: wrap;
    max-width: 700px;
  }

  .dex-grid > .dex-mon {
    max-width: calc(100% / 16);
  }

  .mon-icon {
    width: 100%;
  }
</style>
