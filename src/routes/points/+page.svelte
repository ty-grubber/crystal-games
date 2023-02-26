<script>
  import DataTable, { Body, Cell, Head, Row } from '@smui/data-table';
	import extractRegionsFromSpoiler from '$lib/extractRegionsFromSpoiler';

  /**
	 * @type {File}
	 */
  let spoilerFile;
  let spoilerExtracted = false;

  /**
	 * @type {{ regionId: number; points: number; items: any[]; }[]}
	 */
  let regionPoints;

  /**
	 * @param {any} e
	 */
  async function handleSpoilerFileChange(e) {
    const file = e.target.files[0];
    if (file == null)
        return; // If user cancels file selection

    const spoilerText = await file.text();
    regionPoints = extractRegionsFromSpoiler(spoilerText);
  }
</script>

<div class="page">
  <h1>Pokémon Crystal Points Tracker</h1>

  <p>Under construction!</p>

  <label for="many">Upload spoiler file (.txt):</label>
  <input
    id="spoiler"
    accept=".txt"
    type="file"
    on:change={handleSpoilerFileChange}
  />

  {#if regionPoints?.length > 0}
    <h2>Location Spoilers</h2>
    <DataTable>
      <Head>
        <Row>
          <Cell>Region #</Cell>
          <Cell>Total Points</Cell>
          <Cell>Items Here</Cell>
        </Row>
      </Head>
      <Body>
        {#each regionPoints as rp (rp.regionId)}
          <Row>
            <Cell>{rp.regionId}</Cell>
            <Cell>{rp.points}</Cell>
            <Cell>
              {#each rp.items as item (item.id)}
                <img src={`/keyItems/${item.id}.png`} alt={item.name} title={item.name} />
              {/each}
            </Cell>
          </Row>
        {/each}
      </Body>
    </DataTable>
  {/if}
</div>

<style>
  img {
    height: 32px;
    width: 32px;
  }
</style>
