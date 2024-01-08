<script>
// @ts-nocheck
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import Tab, { Label as TabLabel } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import KEY_ITEMS from '../../../constants/keyItemPresets';

  let regionPoints;

  let settingsDialogOpen = true;
  let activeTab = 'Host';

  function openSettingsDialog() {
    settingsDialogOpen = true;
  }

  function openHowToDialog() {}
</script>

<svelte:head>
  <title>Pokémon Crystal Points Hint Tracker Race Connection</title>
  <meta property="description" content="Host or join a points hint tracker race without sharing the spoiler log to all participants" />
  {#each KEY_ITEMS as keyItem}
    <link rel="preload" as="image" href={`/keyItems/${keyItem.id}.png`} />
  {/each}
  <link rel="preload" as="image" href="/maps/johto-points-region-map.png" />
  <link rel="preload" as="image" href="/maps/kanto-points-region-map.png" />
</svelte:head>

<div class="page">
  {#if !regionPoints}
    <h1>Pokémon Crystal Points Tracker</h1>
    <Button color="primary" on:click={openSettingsDialog} variant="raised">
      <Label>New Game</Label>
    </Button>
    <Button color="secondary" on:click={openHowToDialog} variant="raised">
      <Label>How To Play</Label>
    </Button>
    <Button color="secondary" href="/" variant="outlined">
      <Label>Games Home</Label>
    </Button>
    <br /><br />
  {/if}

  <Dialog bind:open={settingsDialogOpen}>
    <Title id="settingsTitle">Pokémon Crystal Points Hint Tracker Settings</Title>
    <Content id="settingsTabbedContent">
      <TabBar tabs={['Host', 'Join']} let:tab bind:activeTab>
        <Tab {tab}>
          <TabLabel>{tab}</TabLabel>
        </Tab>
      </TabBar>
      {#if activeTab === 'Host'}
        This is the Host content
      {:else}
        This is the Join content
      {/if}
    </Content>
  </Dialog>
</div>
