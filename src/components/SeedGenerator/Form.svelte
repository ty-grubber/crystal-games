<script>
  import short from 'short-uuid';

  let seed = '';
  function onRandomize() {
    seed = short.generate().substring(0, 10).toUpperCase();
  }
</script>

<label>
  Searchable Treasure Locations:&nbsp;
  <input type=number name="number-locations" value={10} />
</label>
<br /><br />
<label>
  Number of Treasures:&nbsp;
  <input type=number name="number-treasures" value={5} />
</label>
<br /><br />
<label>
  Seed:&nbsp;
  <input type=text name="seed" bind:value={seed} />
</label>
<button on:click={onRandomize}>
  Randomize Seed
</button>
