<script>
// @ts-nocheck

  import Button, { Label } from '@smui/button';
  import KEY_ITEMS from '../constants/keyItems';
  export let onConfirmPts;
  export let onCancel;

  const keyItems = [ ...KEY_ITEMS];

  function handleOnConfirm() {
    onConfirmPts(keyItems);
  }
</script>

<div class="item-list">
  {#each keyItems as item, idx (item.id) }
    <div class="item-pt-card">
      <img
        class="icon"
        src={`/keyItems/${item.id}.png`}
        alt={item.name}
        title={item.name}
      />
      <input
        id={`${item.name}PointValue`}
        class="points"
        type="number"
        bind:value={keyItems[idx].points}
      />
    </div>
  {/each}
</div>
<br />
<Button color="primary" on:click={handleOnConfirm} variant="raised">
  <Label>Confirm Points</Label>
</Button>
<Button color="secondary" on:click={onCancel} variant="raised">
  <Label>Cancel</Label>
</Button>

<style>
  .item-list {
    display: flex;
    flex-wrap: wrap;
  }

  .item-pt-card {
    display: flex;
    padding: 1rem;
  }

  .icon {
    width: 40px;
    max-height: 40px;
  }

  input.points {
    font-size: 1.5rem;
    height: 40px;
    margin-left: 20px;
    text-align: center;
    width: 50px;
  }
</style>
