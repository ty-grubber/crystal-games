<script>
  import Button, { Label } from '@smui/button';
  /**
	 * @type {{ name: any; }}
	 */
   export let spoilerFile;
  /**
	 * @type {any}
	 */
   export let showMenuButton;
  /**
	 * @type {((e: CustomEvent<any>) => void) | null | undefined}
	 */
   export let openInGameMenu;
</script>

{#if spoilerFile}
  <p>
    Spoiler file name: {spoilerFile.name}
  </p>
{/if}
{#if showMenuButton}
  <div class='floating-menu'>
    <Button color="primary" on:click={openInGameMenu} variant="raised">
      <Label>Menu</Label>
    </Button>
  </div>
{/if}
<p class="credits">
  Key Item image sprites courtesy of <a href="https://gitlab.com/Sekii/pokemon-tracker" rel="noreferrer" target="_blank">Sekii's Pokémon Tracker</a> and Kovolta.<br />
  Region map images created by Kovolta.
</p>

<style>
  .floating-menu {
    position: absolute;
    top: 1%;
    right: 1%;
    z-index: 10;
  }

  @media(max-width: 1024px) {
    .floating-menu {
      position: unset;
    }
  }

  .credits {
    font-size: 12px;
  }
</style>
