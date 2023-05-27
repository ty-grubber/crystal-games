<script>
// @ts-nocheck

  import Button, { Label } from '@smui/button';
  import KEY_ITEMS from '../constants/keyItemsPresets';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  export let onConfirmPts;
  export let isOpen = false;

  const keyItems = [ ...KEY_ITEMS];

  function handleOnConfirm() {
    onConfirmPts(keyItems);
  }
</script>

<Dialog bind:open={isOpen} slot="over" surface$style="height: 700px; width: 800px;">
  <Title>Customize Key Item Points</Title>
  <Content>
    <div class="item-list">
      {#each keyItems as item, idx (item.id) }
        <div class="item-pt-card">
          <img
            class={`icon ${item.upgradeModifier ? 'upgradable' : ''}`}
            src={`/keyItems/${item.id}.png`}
            alt={item.name}
            title={item.name}
          />
          <input
            id={`${item.name}PointValue`}
            class="points"
            type="number"
            min="1"
            max="9"
            bind:value={keyItems[idx].points}
          />
        </div>
      {/each}
    </div>
    <br />
  </Content>
  <Actions style="justify-content: flex-start;">
    <p style="font-size: 12px; text-decoration: 1px underline red;">
      *red underlined items have upgradable points if certain modifiers are on
    </p>
    <Button color="primary" on:click={handleOnConfirm} variant="raised">
      <Label>Confirm Points</Label>
    </Button>
    <Button color="secondary" on:click={() => isOpen = false} variant="raised">
      <Label>Cancel</Label>
    </Button>
  </Actions>
</Dialog>


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

  .icon.upgradable {
    border-bottom: 2px solid red;
  }

  input.points {
    font-size: 1.5rem;
    height: 40px;
    margin-left: 20px;
    text-align: center;
    width: 50px;
  }
</style>
