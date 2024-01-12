<script>
  // @ts-nocheck
  import Button, { Label } from '@smui/button';
  import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';

  export let onSubmit;
  export let openHowToDialog;
  export let openCustomPointsDialog;
  export let showNetworking = false;

  let trackerLayout = 'classic';
  let revealOrdering = 'random';
  let initialRevealedRegions = 1;
  let spoilerFile;

  function onStartClick() {
    onSubmit({
      initialRevealedRegions,
      revealOrdering,
      spoilerFile,
      trackerLayout,
    });
  }

  function handleSpoilerFileChange(e) {
    spoilerFile = e.target.files[0];
  }
</script>

<div class="settings-wrapper">
  <label for="spoiler">
    {!spoilerFile ? 'Upload spoiler file (.txt):' : 'Spoiler Uploaded!'}
  </label>
  <input
    id="spoiler"
    accept=".txt"
    type="file"
    on:change={handleSpoilerFileChange}
    style="margin-right: 1rem;"
  />
  <br /><br />
  <Select bind:value={trackerLayout} variant="outlined" label="Tracker Layout Style" style="width: 220px;">
    <Option value="classic">Classic</Option>
    <Option value="compact1">Compact</Option>
  </Select>
  <div class="tracker-blurb">
    <span>
      {#if trackerLayout === 'classic'}
        A wider layout with all references to help you complete a seed.
      {:else}
        A compact layout for a runner more familiar with the regions and point values.
      {/if}
    </span>
  </div>
  <br /><br />
  <Select bind:value={revealOrdering} variant="outlined" label="Region Reveal Order" style="width: 220px;">
    <Option value="random">Random</Option>
    <Option value="desc">Highest First</Option>
    <Option value="asc">Lowest First</Option>
  </Select>
  <Textfield
    bind:value={initialRevealedRegions}
    label="Initial Revealed Regions"
    variant="outlined"
    type="number"
    input$min="0"
    input$max="16"
    style="margin-left: 1rem;"
  />
  <br /><br />
  <Button
    color="primary"
    variant="outlined"
    on:click={openCustomPointsDialog}
  >
    Customize Item Points
  </Button>
  {#if showNetworking}
    <br /><br /><hr /><br />
    This is the networking section.
  {/if}
</div>
<br /><br /><br />
<Button color="primary" on:click={onStartClick} disabled={!spoilerFile} variant="raised">
  <Label>Start Game</Label>
</Button>
<Button color="secondary" on:click={openHowToDialog} variant="raised">
  <Label>How To Play</Label>
</Button>
<Button color="secondary" href="/" variant="outlined">
  <Label>Games Home</Label>
</Button>

<style>
  .tracker-blurb {
    display: inline-block;
    font-size: 0.8rem;
    line-height: 1.5;
    margin-left: 10px;
    vertical-align: middle;
    width: 240px;
  }

  .settings-wrapper {
    border: 1px solid grey;
    padding: 1rem;
  }
</style>
