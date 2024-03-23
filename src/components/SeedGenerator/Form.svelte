<script>
	import short from 'short-uuid';
	import { createEventDispatcher } from 'svelte';
	import TextField from '@smui/textfield';
	import Button, { Label } from '@smui/button';

	const dispatch = createEventDispatcher();

	let seed = '';
	let rivals = 10;
	let locations = 10;
	let treasures = 5;
	let warning = '';

	function onRandomize() {
		seed = short.generate().substring(0, 12).toUpperCase();
	}

	function onStartClick() {
		warning = '';
		if ((locations >= treasures && treasures > 0) || (locations === 0 && treasures === 0)) {
			dispatch('startGame', {
				gameOptions: {
					rivals,
					locations,
					treasures,
					seed,
				},
			});
		} else {
			if (treasures === 0) {
				warning = 'Number of treasures cannot be 0 if number of locations is greater than 0';
			} else {
				warning = 'Number of locations cannot be less than the number of treasures';
			}
		}
	}

	function onHowToClick() {
		dispatch('howToClick', {});
	}
</script>

<br />
<TextField variant="outlined" bind:value={rivals} label="Rivals to Defeat:" type="number" />
<br /><br />
<TextField
	variant="outlined"
	bind:value={locations}
	label="Searchable Treasure Locations:"
	type="number"
/>
<br /><br />
<TextField variant="outlined" bind:value={treasures} label="Number of Treasures:" type="number" />
<br /><br />
<TextField variant="outlined" bind:value={seed} label="Seed:" />
<Button color="secondary" on:click={onRandomize} variant="unelevated">
	<Label>Randomize Seed</Label>
</Button>
<br /><br />

<Button color="primary" on:click={onStartClick} disabled={!seed} variant="raised">
	<Label>Start Game!</Label>
</Button>
<Button color="secondary" on:click={onHowToClick} variant="raised">
	<Label>How To Play</Label>
</Button>
<br />
{#if warning}
	<span class="red">{warning}</span>
{/if}

<style>
	span.red {
		color: darkred;
		font-size: 0.8rem;
	}
</style>
