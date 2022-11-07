<script>
  import short from 'short-uuid';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let seed = '';
  let rivals = 10;
  let locations = 10;
  let treasures = 5;
  let warning = '';

  function onRandomize() {
    seed = short.generate().substring(0, 10).toUpperCase();
  }

  function onStartClick() {
    warning = '';
    if (locations >= treasures) {
      dispatch('startGame', {
        gameOptions: {
          rivals,
          locations,
          treasures,
          seed,
        }
      });
    } else {
      warning = 'Number of locations cannot be less than the number of treasures (which cannot be 0).'
    }
  }
</script>


<label>
  Rivals to Defeat:&nbsp;
  <input type=number name="number-rivals" bind:value={rivals} />
</label>
<br /><br />
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
{#if warning }
<span>{warning}</span>
{/if}
