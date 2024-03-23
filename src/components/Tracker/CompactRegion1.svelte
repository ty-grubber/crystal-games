<script>
	// @ts-nocheck
	import { clickOutside } from '$lib/clickOutside';
	import Button, { Label } from '@smui/button';
	import REGIONS from '../../constants/regions';
	import GameConnectionInfo from '../References/GameConnectionInfo.svelte';

	export let baskets = [];
	export let regionPoints = [];
	export let revealedRegions = [];

	export let revealRegionPoints = false;
	export let showSolution = false;

	/**
	 * @type {{ gameName: string; hostName: string; players: string[]; }}
	 */
	export let connectionInfo;
	export let isHost;

	export let handleCheckToExposeRegion = () => {};
	export let openInGameMenu = () => {};
	export let onDisconnect = () => {};
	export let onReconnect = () => {};

	let hoveringOverBasket;
	let selectedAvailableItem = {};
	let selectedFoundItem = {};

	function updateRegionFoundFromRegionTransfer(
		movedItem,
		newRegionFoundValue,
		originalBasketIndex
	) {
		const movedItemAvailableBasketIndex = baskets.findIndex(
			basket => basket.type === 'item' && basket.name === movedItem.points.toString()
		);
		const movedItemAvailableBasket = baskets[movedItemAvailableBasketIndex];

		const matchingAvailableItemIndex = movedItemAvailableBasket.items.findIndex(
			aItem =>
				aItem.name === movedItem.name && aItem.regionFound === baskets[originalBasketIndex].name
		);

		movedItemAvailableBasket.items[matchingAvailableItemIndex] = {
			...movedItemAvailableBasket.items[matchingAvailableItemIndex],
			regionFound: newRegionFoundValue,
		};

		baskets[movedItemAvailableBasketIndex] = movedItemAvailableBasket;
		baskets = baskets;
	}

	/**
	 * @param {DragEvent & { currentTarget: EventTarget & HTMLLIElement; }} event
	 * @param {any} basketIndex
	 * @param {number} itemIndex
	 */
	function dragStart(event, basketIndex, itemIndex) {
		// The data we want to make available when the element is dropped
		// is the index of the item being dragged and
		// the index of the basket from which it is leaving.
		const data = { basketIndex, itemIndex };
		event.dataTransfer?.setData('text/plain', JSON.stringify(data));
	}

	/**
	 * @param {DragEvent & { currentTarget: EventTarget & HTMLUListElement; }} event
	 * @param {number} basketIndex
	 */
	function regionDrop(event, basketIndex) {
		event.preventDefault();
		if (event.dataTransfer) {
			const json = event.dataTransfer.getData('text/plain');
			let origItemLocation;
			try {
				origItemLocation = JSON.parse(json);
			} catch {
				return;
			}

			if (!origItemLocation || !origItemLocation.basketIndex || origItemLocation.itemIndex < 0) {
				return;
			}

			let targetBasket = baskets[basketIndex];

			const originalBasket = baskets[origItemLocation.basketIndex];
			// Remove item if item came from another region, otherwise just copy it to its new location
			let item;
			if (originalBasket.type === 'item') {
				[item] = originalBasket.items.slice(
					origItemLocation.itemIndex,
					origItemLocation.itemIndex + 1
				);
				// update the original item to include the new region where it was found
				originalBasket.items[origItemLocation.itemIndex] = {
					...originalBasket.items[origItemLocation.itemIndex],
					regionFound: targetBasket.name,
				};
				baskets[origItemLocation.basketIndex] = originalBasket;
			} else {
				[item] = originalBasket.items.splice(origItemLocation.itemIndex, 1);

				updateRegionFoundFromRegionTransfer(item, targetBasket.name, origItemLocation.basketIndex);
			}

			// Add the item to the drop target basket and update our baskets.
			targetBasket.items.push(item);
			baskets = baskets;

			handleCheckToExposeRegion(originalBasket, targetBasket, item);

			hoveringOverBasket = null;
			selectedAvailableItem = {};
			selectedFoundItem = {};
		}
	}

	/**
	 * @param {number} basketIndex
	 */
	function setSelectedItemIntoBasket(basketIndex) {
		let targetBasket = baskets[basketIndex];
		const itemGettingPlaced = selectedAvailableItem.points
			? selectedAvailableItem
			: selectedFoundItem;

		if (
			itemGettingPlaced.points &&
			(itemGettingPlaced.regionFound === 'P' || !itemGettingPlaced.regionFound)
		) {
			// Remove item if item came from another region, otherwise just copy it to its new location
			const originalBasket = baskets[itemGettingPlaced.currBasketIndex];
			const draggedItemIndexInBasket = baskets[itemGettingPlaced.currBasketIndex].items.findIndex(
				(item, idx) => item.id === itemGettingPlaced.id && idx === itemGettingPlaced.currItemIndex
			);

			let freedItem;
			if (originalBasket.type === 'item') {
				[freedItem] = originalBasket.items.slice(
					draggedItemIndexInBasket,
					draggedItemIndexInBasket + 1
				);
				// update the original item to include the new region where it was found
				originalBasket.items[draggedItemIndexInBasket] = {
					...originalBasket.items[draggedItemIndexInBasket],
					regionFound: targetBasket.name,
				};
				baskets[itemGettingPlaced.currBasketIndex] = originalBasket;
			} else {
				[freedItem] = originalBasket.items.splice(draggedItemIndexInBasket, 1);

				updateRegionFoundFromRegionTransfer(
					freedItem,
					targetBasket.name,
					itemGettingPlaced.currBasketIndex
				);
			}

			// Add the item to the drop target basket.
			targetBasket.items.push(freedItem);
			baskets = baskets;

			handleCheckToExposeRegion(originalBasket, targetBasket, freedItem);
		}

		selectedAvailableItem = {};
		selectedFoundItem = {};
	}

	function toggleHighlightItem(basketIndex, itemIndex) {
		let highlightedItem = {
			...baskets[basketIndex].items[itemIndex],
		};

		highlightedItem = {
			...highlightedItem,
			highlighted: !highlightedItem.highlighted,
		};

		baskets[basketIndex].items[itemIndex] = highlightedItem;
		baskets = baskets;
	}

	function handleFoundItemClick(event, item, currBasketIndex, currItemIndex) {
		event.stopPropagation();
		selectedAvailableItem = {};

		if (
			selectedFoundItem?.id === item.id &&
			selectedFoundItem?.currBasketIndex === currBasketIndex &&
			selectedFoundItem?.currItemIndex === currItemIndex
		) {
			// Highlight the item if they double click on the item
			toggleHighlightItem(currBasketIndex, currItemIndex);
			selectedFoundItem = {};
		} else {
			selectedFoundItem = {
				...item,
				currBasketIndex,
				currItemIndex,
			};
		}
	}

	function handleAvailableItemClick(event, item, currBasketIndex, currItemIndex) {
		event.stopPropagation();
		selectedAvailableItem = {
			...item,
			currBasketIndex,
			currItemIndex,
		};
		selectedFoundItem = {};
	}

	function handleClearItem(event, basketIndex, itemIndex) {
		event.preventDefault();

		const [removedItem] = baskets[basketIndex].items.splice(itemIndex, 1);

		updateRegionFoundFromRegionTransfer(removedItem, undefined, basketIndex);
		baskets = baskets;

		handleCheckToExposeRegion(baskets[basketIndex], baskets[REGIONS.length + 1], removedItem);
		selectedAvailableItem = {};
		selectedFoundItem = {};
	}

	function assignToPokemon() {
		if (selectedAvailableItem.points) {
			baskets[selectedAvailableItem.currBasketIndex].items[selectedAvailableItem.currItemIndex] = {
				...baskets[selectedAvailableItem.currBasketIndex].items[
					selectedAvailableItem.currItemIndex
				],
				regionFound: 'P',
			};
			baskets = baskets;
			selectedAvailableItem = {};
		}
	}

	function getRemainingSolutionItems(rpIndex) {
		const solutionItems = regionPoints[rpIndex].items.map(item => item);
		const basketItems = baskets[rpIndex].items.map(item => item.name);

		return solutionItems.reduce((all, curr) => {
			if (basketItems.includes(curr.name)) {
				basketItems.splice(
					basketItems.findIndex(item => item === curr.name),
					1
				);
			} else {
				all.push(curr);
			}

			return all;
		}, []);
	}

	function handleOutsideRegionTableClick(e) {
		if (
			e.explicitOriginalTarget &&
			e.explicitOriginalTarget.tagName.toLowerCase() !== 'img' &&
			e.explicitOriginalTarget.parentElement.tagName.toLowerCase() !== 'button'
		) {
			selectedAvailableItem = {};
			selectedFoundItem = {};
		}
	}

	$: totalPointsAvailable = baskets
		.filter(basket => basket.type === 'item')
		.reduce((sum, curr) => {
			return sum + curr.items.reduce((itemSum, itemCurr) => itemSum + itemCurr.points, 0);
		}, 0);

	$: totalPointsRemaining = baskets
		.filter(basket => basket.type === 'item')
		.reduce((sum, curr) => {
			return (
				sum +
				curr.items
					.filter(item => !item.regionFound || item.regionFound === 'P')
					.reduce((itemSum, itemCurr) => itemSum + itemCurr.points, 0)
			);
		}, 0);
</script>

<svelte:window on:dragend={() => (hoveringOverBasket = null)} />

<div class="container" use:clickOutside on:click_outside={handleOutsideRegionTableClick}>
	<div class="region-boxes">
		{#each regionPoints as rp, i (rp.regionId)}
			{@const missingSolutionItems = showSolution ? getRemainingSolutionItems(i) : []}
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class="box"
				class:hovering={hoveringOverBasket === `${baskets[i].type}_${baskets[i].name}`}
				class:dumpable={(!revealRegionPoints &&
					!revealedRegions.includes(rp.regionId) &&
					(selectedAvailableItem?.points || selectedFoundItem?.points)) ||
					((revealRegionPoints || (!revealRegionPoints && revealedRegions.includes(rp.regionId))) &&
						selectedAvailableItem?.points <=
							rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0)) ||
					selectedFoundItem?.points <=
						rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0)}
				class:new-revealed={revealedRegions[0] === rp.regionId}
				on:dragenter={() => (hoveringOverBasket = `${baskets[i].type}_${baskets[i].name}`)}
				on:drop={e => regionDrop(e, i)}
				ondragover="return false;"
				on:click={() => setSelectedItemIntoBasket(i)}
				on:keypress={() => setSelectedItemIntoBasket(i)}
			>
				<div class="region-image">
					<img
						src={`/regions/${rp.regionId}.png`}
						alt={`Region ${rp.regionId} - ${rp.name}`}
						title={`Region ${rp.regionId} - ${rp.name}: ${rp.description}`}
					/>
				</div>
				<div class="side-section">
					<div class="remaining">
						{revealRegionPoints || revealedRegions.includes(rp.regionId)
							? rp.points - baskets[i].items.reduce((acc, curr) => acc + curr.points, 0)
							: '??'}
					</div>
				</div>
				<div
					class={`items ${
						baskets[i].items.concat(missingSolutionItems).length > 11 ? 'big-list' : ''
					}`}
				>
					{#each baskets[i].items as item, itemIndex (`${item.id}_${itemIndex}`)}
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<img
							src={`/keyItems/${item.id}.png`}
							alt={item.name}
							class="region"
							class:selected={selectedFoundItem?.id === item.id &&
								selectedFoundItem?.currItemIndex === itemIndex &&
								selectedFoundItem?.currBasketIndex === i}
							class:highlighted={item.highlighted}
							title={`${item.name} - ${item.points}pts`}
							draggable={true}
							on:dragstart={e => dragStart(e, i, itemIndex)}
							on:click={e => handleFoundItemClick(e, item, i, itemIndex)}
							on:keypress={e => handleFoundItemClick(e, item, i, itemIndex)}
							on:contextmenu={e => handleClearItem(e, i, itemIndex)}
						/>
					{/each}
					{#if showSolution}
						{#each missingSolutionItems as solutionItem, sItemIndex (`${solutionItem.id}_${sItemIndex}`)}
							<!-- TODO: Adding an item to a region when solution is up does not refresh missing solution items -->
							<!-- * Can just toggle the button in the menu to get it to refresh -->
							<img
								alt={solutionItem.name}
								src={`/keyItems/${solutionItem.id}.png`}
								class="region solution"
							/>
						{/each}
					{/if}
					<div class="found-region-points">
						{#if baskets[i].items.length > 0}
							{baskets[i].items.reduce((sum, curr) => sum + curr.points, 0)}
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
<br />
<div class="item-tracker">
	{#each baskets.filter(basket => basket.type === 'item') as itemBasket, basketIndex (itemBasket)}
		<div class="basket-wrapper">
			<div class="point-label">{itemBasket.items[0].points}</div>
			<div class="item-row">
				{#each itemBasket.items as item, itemIndex (`${item.id}_${itemIndex}`)}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="item-wrapper"
						class:draggable={!item.regionFound || item.regionFound === 'P'}
						class:selected={selectedAvailableItem?.id === item.id &&
							selectedAvailableItem?.currItemIndex === itemIndex}
						draggable={!item.regionFound || item.regionFound === 'P'}
						on:dragstart={e => {
							if (!item.regionFound || item.regionFound === 'P') {
								dragStart(e, REGIONS.length + basketIndex, itemIndex);
							}
						}}
						on:click={e =>
							handleAvailableItemClick(e, item, REGIONS.length + basketIndex, itemIndex)}
						on:keypress={e =>
							handleAvailableItemClick(e, item, REGIONS.length + basketIndex, itemIndex)}
					>
						<img
							alt={item.name}
							class="icon"
							class:owned={!!item.regionFound}
							src={`/keyItems/${item.id}.png`}
							title={`${item.name} - ${item.points}pts${
								!!item.regionFound
									? `: Found ${
											item.regionFound === 'P' ? 'On Pokémon' : `In Region ${item.regionFound}`
									  }`
									: ''
							}`}
						/>
						{#if item.regionFound}
							<span class="region-found">{item.regionFound}</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/each}
	{#if regionPoints.length > 0}
		<div class="extra-actions">
			<Button color="primary" on:click={openInGameMenu} variant="raised">
				<Label>Menu</Label>
			</Button>
			<Button
				color="primary"
				on:click={e => assignToPokemon(e)}
				variant="raised"
				style={!selectedAvailableItem.points || !selectedAvailableItem.onPoke
					? 'visibility: hidden'
					: ''}
			>
				Found On Pokémon
			</Button>
			<div class="points-remaining">
				{totalPointsRemaining} / {totalPointsAvailable}
			</div>
		</div>
	{/if}
	{#if connectionInfo}
		<GameConnectionInfo {connectionInfo} {isHost} {onDisconnect} {onReconnect} />
	{/if}
</div>

<style>
	.container {
		display: flex;
	}

	.region-boxes {
		display: flex;
		flex-flow: column wrap;
		max-width: 620px;
		max-height: 512px;
	}

	.box {
		border: 2px solid #444;
		display: flex;
		flex-basis: calc(50% - 4px);
		max-height: 60px;
		max-width: 300px;
		position: relative;
		text-align: center;
	}

	.box.hovering,
	.box.dumpable {
		background-color: rgba(10, 182, 47, 0.25);
	}

	.box.new-revealed {
		border-color: green;
	}

	.box.new-revealed .remaining {
		font-weight: bold;
		color: green;
		text-decoration: underline 4px;
	}

	.region-image {
		display: flex;
		flex: 0 0 auto;
		width: 60px;
	}

	.region-image > img {
		cursor: grab;
		object-fit: scale-down;
	}

	.side-section {
		width: 30px;
	}

	.side-section > div.remaining {
		font-size: 1.5rem;
		height: 100%;
		line-height: 60px;
	}

	.items {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		height: 60px;
		object-fit: contain;
		padding-left: 5px;
		position: relative;
		width: 205px;
	}

	.items > img.region {
		border: 1px solid transparent;
		cursor: grab;
		max-height: 28px;
		max-width: 28px;
	}

	.items > img.region.highlighted {
		border-color: orangered;
	}

	.items > img.region.selected {
		border-color: purple;
	}

	.items > img.region.solution {
		opacity: 0.3;
	}

	.items.big-list > img.region {
		max-height: 19px;
		max-width: 19px;
	}

	.found-region-points {
		bottom: 1%;
		font-size: 0.8rem;
		position: absolute;
		right: 2%;
	}

	.item-tracker {
		max-width: 610px;
	}

	.item-tracker .basket-wrapper {
		display: flex;
		align-items: center;
		margin-bottom: 15px;
	}

	.item-tracker .point-label {
		font-size: 1.5rem;
		margin-right: 10px;
	}

	.item-tracker .item-row {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
	}

	.item-tracker .item-wrapper {
		border: 1px solid transparent;
		position: relative;
	}

	.item-tracker .item-wrapper.draggable {
		cursor: grab;
	}

	.item-tracker .item-wrapper.selected {
		border-color: purple;
	}

	.item-tracker .icon {
		display: inline-block;
		max-height: 30px;
		max-width: 30px;
		padding: 0 2px;
		opacity: 0.3;
	}

	.item-tracker .icon.owned {
		opacity: 1;
		position: relative;
	}

	.item-tracker .region-found {
		background-color: black;
		color: white;
		font-size: 0.6rem;
		padding: 2px;
		position: absolute;
		right: 2%;
	}

	.extra-actions {
		position: relative;
		width: 100%;
	}

	.points-remaining {
		position: absolute;
		top: 0;
		right: 0;
		font-size: 1.5rem;
	}
</style>
