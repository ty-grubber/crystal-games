<script>
  import { randomizeArray } from '$lib/randomize';
  import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';
  import seedrandom from 'seedrandom';

  const TREASURE_STR = 'TREASURE!!!';

  /**
	 * @type {any[]}
	 */
  export let rivals = [];
  /**
	 * @type {any[]}
	 */
  export let locations = [];
  /**
   * @type {any[]}
   */
  export let treasures = [];


  /**
	 * @type {string | any[]}
	 */
  let defeated = [];
  /**
	 * @type {any[]}
	 */
  let formattedLocations = [];
  $: {
    const treasureIds = treasures.map(treasure => treasure.id)
    const treasureIdSeed = treasureIds.join(',');
    const randomizedTreasures = randomizeArray(treasures, treasureIdSeed);

    const nonTreasureLocations = locations.filter(location => !treasureIds.includes(location.id));
    const randomizedNonTreasureLocationIds = randomizeArray(nonTreasureLocations, treasureIdSeed).map(l => l.id);

    const getTreasureForNonTreasureHint = (/** @type {any} */ locationId) => {
      const nonTreasureIndex = randomizedNonTreasureLocationIds.findIndex(id => locationId === id);
      // use modulus to make sure we don't look outside the index of randomizedTreasures
      return randomizedTreasures[nonTreasureIndex % randomizedTreasures.length];
    }

    const rng = seedrandom(treasureIdSeed);

    formattedLocations = locations.map(location => ({
      id: location.id,
      description: location.description,
      found: false,
      result:
        treasureIds.includes(location.id)
        ? TREASURE_STR
        : getTreasureForNonTreasureHint(location.id).hintOpts[Math.floor((rng() * 100)) % 2],
    }));
  };


  /**
	 * @param {number} locationIndex
	 */
  function handleCheckboxClick(locationIndex) {
    formattedLocations[locationIndex].found = !formattedLocations[locationIndex].found;
  }

  /**
	 * @param {any} rivalId
	 */
  function handleRivalDefeated(rivalId) {
    const index = defeated.indexOf(rivalId);

    if (index === -1) {
      defeated = [...defeated, rivalId];
    } else {
      const temp = defeated;
      // @ts-ignore
      temp.splice(index, 1);
      defeated = temp;
    }
  }
</script>

<div class="container">
  {#if formattedLocations.length > 0}
    <h2>
      Treasure Hunt&nbsp;
      <span class="gold heading">
        ({formattedLocations.filter(l => l.found && l.result === TREASURE_STR).length}/{treasures.length})
      </span>
    </h2>

    <DataTable>
      <Head>
        <Row>
          <Cell><h3>Location</h3></Cell>
          <Cell><h3>Found?</h3></Cell>
          <Cell style="max-width: 350px;"><h3>Result</h3></Cell>
        </Row>
      </Head>
      <Body>
        {#each formattedLocations as location, i (location.id)}
          <Row style={location.found && 'background-color: rgba(235, 251, 233, 0.5);'}>
            <Cell style="width: 300px; white-space: normal; height: 42px;">{location.description}</Cell>
            <Cell style="text-align: center">
              <input
                type="checkbox"
                class="checkbox"
                on:click={() => handleCheckboxClick(i)}
                value={location.found}
              />
            </Cell>
            <Cell style="width: 275px; white-space: normal;">
              <span class={`${!location.found ? 'hidden' : ''}`}>
                <span class={`${(location.result === TREASURE_STR && location.found) ? 'gold' : ''}`}>
                  {location.found ? location.result : 'Location not found'}
                </span>
              </span>
            </Cell>
          </Row>
        {/each}
      </Body>
    </DataTable>
  {/if}
  {#if rivals.length > 0}
    <h2>Hidden Rivals&nbsp;
      <span class="green heading">
        ({defeated.length}/{rivals.length})
      </span>
    </h2>

    <DataTable>
      <Head>
        <Row>
          <Cell><h3>Location</h3></Cell>
          <Cell><h3>Trainer</h3></Cell>
          <Cell><h3>Defeated?</h3></Cell>
        </Row>
      </Head>
      <Body>
        {#each rivals as rival (rival.id)}
          <Row style={defeated.includes(rival.id) ? 'background-color: rgba(235, 251, 233, 0.5);' : ''}>
            <Cell>{rival.location}</Cell>
            <Cell>{rival.name}{#if rival.missable}{@html '<span style="color: red;">*</span>'}{/if}</Cell>
            <Cell style="text-align: center">
              <input
                type="checkbox"
                class="checkbox"
                on:click={() => handleRivalDefeated(rival.id)}
                value={defeated.includes(rival.id)}
              />
            </Cell>
          </Row>
        {/each}
      </Body>
    </DataTable>
    <br />
    <span style="font-size: 0.75rem"><span style="color: red;">*</span> = Trainer is Missable</span>
  {/if}
</div>

<style>
  .hidden {
    visibility: hidden;
  }

  .gold {
    color: goldenrod;
    font-weight: bold;
    font-size: 1.25rem;
    line-height: 1.25;
  }

  .gold.heading {
    font-size: unset;
  }

  .green.heading {
    color: #155c10;
  }

  .missable {
    color: red;
  }

  .checkbox {
    accent-color: #155c10;
    border: 2px solid black;
    height: 18px;
    width: 18px;
    margin: 5px;
  }

  h2 {
    margin: 0.75rem 0 0.5rem;
  }

  h3 {
    margin: 0.5rem 0;
  }
</style>
