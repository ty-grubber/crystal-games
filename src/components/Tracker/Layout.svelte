<script>
  /**
	 * @type {string | any[]}
	 */
  export let rivals = [];
  /**
	 * @type {string | any[]}
	 */
   export const locations = [];
  /**
	 * @type {never[]}
	 */
   export const treasures = [];
</script>

<div class="container">
  {#if locations.length > 0}
    <h2>Treasure Hunt</h2>

    <div class="tracker-container">
      <div class="tracker-heading">Location</div>
      <div class="tracker-heading">Found?</div>
      <div class="tracker-heading">Result</div>
      <div class="tracker-end-row" />
    </div>
  {/if}
  {#if rivals.length > 0}
    <h2>Hidden Rivals</h2>

    <div class="tracker-container">
      <div class="tracker-heading location">Location</div>
      <div class="tracker-heading name">Trainer</div>
      <div class="tracker-heading checkbox">Defeated?</div>
      <div class="tracker-end-row" />
      {#each rivals as rival (rival.id)}
        <div class="tracker-row location"><span>{rival.location}</span></div>
        <div class="tracker-row name">
          <label for={`rival${rival.id}`}><span>{rival.name}</span></label>
        </div>
        <div class="tracker-row checkbox">
          <input type=checkbox id={`rival${rival.id}`} />
        </div>
        <div class="tracker-end-row" />
      {/each}
    </div>
  {/if}
</div>

<style>
  .tracker-container {
    display: flex;
    flex-wrap: wrap;
    font-size: 1.25rem;
    line-height: 1.25;
  }

  .tracker-container > .location {
    width: 250px;
  }

  .tracker-container > .name {
    width: 200px;
  }

  .tracker-container > .checkbox {
    width: 75px;
    text-align: center;
  }

  .tracker-row span {
    vertical-align: middle;
  }

  .checkbox > input {
    height: 25px;
    width: 25px
  }

  .tracker-end-row {
    width: 100%;
  }

  .tracker-heading {
    font-weight: bold;
  }
</style>
