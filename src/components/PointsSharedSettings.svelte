<script>
  // @ts-nocheck
  import Button, { Label } from '@smui/button';
  import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';
  import LayoutChooser from './LayoutChooser.svelte';

  export let onSubmit;
  export let openHowToDialog;
  export let openCustomPointsDialog;

  export let showNetworking = false;
  export let isConnecting = false;
  export let playerName = '';
  export let gameName = '';
  export let hostID = '';

  let isSpectatorMode = false;
  let copiedHostId = false;
  let trackerLayout = 'classic';
  let revealOrdering = 'random';
  let initialRevealedRegions = 1;
  let spoilerFile;

  function onStartClick() {
    onSubmit({
      initialRevealedRegions,
      revealOrdering,
      spoilerFile,
      trackerLayout: isSpectatorMode ? 'spectator' : trackerLayout,
    });
  }

  function handleSpoilerFileChange(e) {
    spoilerFile = e.target.files[0];
  }

  function toggleSpectatorMode() {
    isSpectatorMode = !isSpectatorMode;
  }

  function copyHostID() {
    navigator.clipboard.writeText(hostID);
    copiedHostId = true;

    setTimeout(() => copiedHostId = false, 5000);
  }

  $: disableStartButton = showNetworking
    ? !spoilerFile || !playerName || !gameName || isConnecting
    : !spoilerFile;
</script>

<div class="settings-wrapper">
  {#if showNetworking}
    <Textfield
      bind:value={playerName}
      label="*Player Name"
      variant="outlined"
    />
    <input
      id="spectatorCheckbox"
      type="checkbox"
      class="checkbox"
      on:click={() => toggleSpectatorMode()}
      value={isSpectatorMode}
    />
    <label for="spectatorCheckbox" style="vertical-align: text-bottom;">
      Host Game as Spectator
    </label>
    <br /><br />
    <Textfield
      bind:value={gameName}
      label="*Public Game Name (ex: 'Max Shopsanity Race')"
      style="width: 100%;"
      variant="outlined"
    />
    <br /><br />
    <div >
      <Textfield
        disabled
        label="Private Host ID"
        value={hostID}
        variant="outlined"
      />
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div class="field-blurb" on:click={copyHostID}>
        <span>
          {copiedHostId ? 'Copied!!!' : 'Click here to copy this ID for players to connect to your game'}
        </span>
      </div>
    </div>
    <br /><br /><hr /><br />
  {/if}
  <label for="spoiler">
    {!spoilerFile ? '*Upload spoiler file (.txt):' : 'Spoiler Uploaded!'}
  </label>
  <input
    id="spoiler"
    accept=".txt"
    type="file"
    on:change={handleSpoilerFileChange}
    style="margin-right: 1rem;"
  />
  {#if !isSpectatorMode}
    <br /><br />
    <LayoutChooser bind:trackerLayout={trackerLayout} />
  {/if}
  <br /><br />
  <Select bind:value={revealOrdering} variant="outlined" label="Game Region Reveal Order" style="width: 214px;">
    <Option value="random">Random</Option>
    <Option value="desc">Highest First</Option>
    <Option value="asc">Lowest First</Option>
  </Select>
  <Textfield
    bind:value={initialRevealedRegions}
    label="Game Initial Revealed Regions"
    variant="outlined"
    type="number"
    input$min="0"
    input$max="16"
    style="margin-left: 1rem; width: 214px;"
  />
  <br /><br />
  <Button
    color="primary"
    variant="outlined"
    on:click={openCustomPointsDialog}
  >
    Customize Item Points
  </Button>
</div>
<br /><br />
{#if isConnecting}
<span>Setting up connection...</span>
{/if}
<br />
<Button
  color="primary"
  on:click={onStartClick}
  disabled={disableStartButton}
  variant="raised"
>
  <Label>Start Game</Label>
</Button>
<Button color="secondary" on:click={openHowToDialog} variant="raised">
  <Label>How To Play</Label>
</Button>
<Button color="secondary" href="/" variant="outlined">
  <Label>Games Home</Label>
</Button>

<style>
  .settings-wrapper {
    border: 1px solid #ff3e00;
    padding: 1rem;
  }

  .field-blurb {
    cursor: copy;
    display: inline-block;
    font-size: 0.8rem;
    line-height: 1.5;
    margin-left: 1rem;
    vertical-align: middle;
    width: 225px;
  }

  .checkbox {
    accent-color: #ff3e00;
    border: 2px solid black;
    height: 18px;
    width: 18px;
    margin: 5px 5px 5px 1rem;
  }
</style>
