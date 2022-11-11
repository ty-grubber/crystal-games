<script>
// @ts-nocheck

  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import Checkbox from '@smui/checkbox';
	import { randomizeArray } from '$lib/randomize';


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

    const getTreasureForNonTreasureHint = locationId => {
      const nonTreasureIndex = randomizedNonTreasureLocationIds.findIndex(id => locationId === id);
      // use modulus to make sure we don't look outside the index of randomizedTreasures
      return randomizedTreasures[nonTreasureIndex % randomizedTreasures.length];
    }

    formattedLocations = locations.map(location => ({
      id: location.id,
      description: location.description,
      found: false,
      result:
        treasureIds.includes(location.id)
        ? 'TREASURE!!!'
        : getTreasureForNonTreasureHint(location.id).hintOpts[Math.floor((Math.random() * 100)) % 2],
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
      temp.splice(index, 1);
      defeated = temp;
    }
  }
</script>

<div class="container">
  {#if formattedLocations.length > 0}
    <h2>Treasure Hunt</h2>

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
          <Row style={location.found && 'background-color: #ebfbe9;'}>
            <Cell>{location.description}</Cell>
            <Cell>
              <Checkbox
                on:click={() => handleCheckboxClick(i)}
                valueKey={location.id}
              />
            </Cell>
            <Cell style="max-width: 350px; white-space: normal;">
              <span class={`${!location.found && 'hidden'}`}>
                <span class={`${location.result === 'TREASURE!!!' && 'gold'}`}>{location.result}</span>
              </span>
            </Cell>
          </Row>
        {/each}
      </Body>
    </DataTable>
  {/if}
  {#if rivals.length > 0}
    <h2>Hidden Rivals</h2>

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
          <Row style={defeated.includes(rival.id) && 'background-color: #ebfbe9;'}>
            <Cell>{rival.location}</Cell>
            <Cell>{rival.name}</Cell>
            <Cell>
              <Checkbox
                on:click={() => handleRivalDefeated(rival.id)}
                valueKey={rival.name}
              />
            </Cell>
          </Row>
        {/each}
      </Body>
    </DataTable>
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
  }
</style>
