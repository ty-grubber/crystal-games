<script>
  import short from 'short-uuid';
  import { createEventDispatcher } from 'svelte';
  import TextField from '@smui/textfield';
  import Button, { Label } from '@smui/button';

  const dispatch = createEventDispatcher();

  let seed = '';
  let rivals = 10;
  let locations = 10;
  let treasures = 5;
  let warning = '';

  function onRandomize() {
    seed = short.generate().substring(0, 12).toUpperCase();
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

<br />
<TextField variant="outlined" bind:value={rivals} label="Rivals to Defeat:" type="number" />
<br /><br />
<TextField variant="outlined" bind:value={locations} label="Searchable Treasure Locations:" type="number" />
<br /><br />
<TextField variant="outlined" bind:value={treasures} label="Number of Treasures:" type="number" />
<br /><br />
<TextField variant="outlined" bind:value={seed} label="Seed:" />
<Button color="secondary" on:click={onRandomize} variant="unelevated">
  <Label>Randomize Seed</Label>
</Button>
<br /><br />

<Button color="primary" on:click={onStartClick} disabled={!seed} variant="raised">
  <Label>Start Game!</Label>
</Button>

{#if warning}
<span>{warning}</span>
{/if}
