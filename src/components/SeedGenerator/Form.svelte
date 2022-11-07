<script>
  import short from 'short-uuid';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let seed = '';
  let locations = 10;
  let treasures = 5;

  function onRandomize() {
    seed = short.generate().substring(0, 10).toUpperCase();
  }

  function onStartClick() {
    dispatch('startGame', {
      gameOptions: {
        locations,
        treasures,
        seed,
      }
    })
  }
</script>

<label>
  Searchable Treasure Locations:&nbsp;
  <input type=number name="number-locations" bind:value={locations} />
</label>
<br /><br />
<label>
  Number of Treasures:&nbsp;
  <input type=number name="number-treasures" bind:value={treasures} />
</label>
<br /><br />
<label>
  Seed:&nbsp;
  <input type=text name="seed" bind:value={seed} />
</label>
<button on:click={onRandomize}>
  Randomize Seed
</button>
<br /><br />

<button on:click={onStartClick} disabled={!seed}>
  Start Game!
</button>
