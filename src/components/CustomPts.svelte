<script>
// @ts-nocheck
  import Button, { Label } from '@smui/button';
  import DEFAULT_PRESET, { MAXIMUM } from '../constants/keyItemPresets';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import Select, { Option } from '@smui/select';
  export let onConfirmPts;
  export let isOpen = false;

  let preset = 'default';
  // Map to new item to avoid mutation imported constants
  let keyItems = DEFAULT_PRESET.map(item => ({...item}));
  $: {
    switch (preset) {
      case 'default':
        keyItems = DEFAULT_PRESET.map(item => ({...item}));
        break;

      case 'maximum':
        keyItems = MAXIMUM.map(item => ({...item}));
        break;

      default:
        break;
    }
  }

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
            on:change={() => preset = 'custom'}
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
    <Select bind:value={preset} variant="outlined" label="Points Preset" style="width: 220px;">
      <Option value="default">Default</Option>
      <Option value="maximum">Max FIR</Option>
      <Option value="custom">Custom</Option>
    </Select>
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
