<script>
	import REGIONS from '../../constants/regions';
	import Button, { Label } from '@smui/button';

	export let hideTitle = false;
	let mapSelected = 'johto';
</script>

<div class="references">
	{#if !hideTitle}
		<b style="font-size:18px;">References</b>
	{/if}
	<br />
	<Button
		color="primary"
		on:click={() => (mapSelected = 'johto')}
		style={`text-decoration: ${mapSelected === 'johto' ? 'underline' : 'none'}`}
	>
		<Label>Johto Map</Label>
	</Button>
	<Button
		color="primary"
		on:click={() => (mapSelected = 'kanto')}
		style={`text-decoration: ${mapSelected === 'kanto' ? 'underline' : 'none'}`}
	>
		<Label>Kanto Map</Label>
	</Button>
	<Button
		color="primary"
		on:click={() => (mapSelected = 'text')}
		style={`text-decoration: ${mapSelected === 'text' ? 'underline' : 'none'}`}
	>
		<Label>Text Regions</Label>
	</Button>
	<br />
	{#if mapSelected === 'text'}
		<ol start="1" type="1">
			{#each REGIONS as region (region.id)}
				<li>{region.description}</li>
			{/each}
		</ol>
	{:else}
		<img
			src={`/maps/${mapSelected}-points-region-map.png`}
			alt={`Points region map of ${mapSelected}`}
		/>
	{/if}
</div>

<style>
	.references ol {
		margin-top: 0;
		padding-left: 3rem;
		line-height: 1.35;
	}

	.references img {
		height: 325px;
		width: auto;
	}

	ol > li::marker {
		font-weight: bold;
	}
</style>
