# Pokémon Crystal Games

This is a tracker app for playing various unique games in Pokémon Crystal. Set up your randomizer how you want and try out one of these games to add some extra spice to your randomizer night!

This app was developed using [Svelte](https://svelte.dev) and includes the Svelte Material UI (SMUI) component library for its designs

## Treasure Hunt

Treasure Hunt requires you to explore Johto and Kanto to interact with specific NPCs, items or other interactive objects in order to find treasure. Each potential treasure location is listed under the Location column of the tracker. Find all treasures to win!

If you complete a task where a treasure could be found, check the box in the `Found?` column of the appropriate row. If there is a treasure there, the `Result` column will display "TREASURE!!!". If there is not a treasure there, the `Result` column will display a hint to another location where there is actually treasure. These hints will only double up if there are more non-treasure locations than treasure locations.

## Hidden Rivals

Hidden Rivals provides a list of trainers that you need to seek out and defeat in battle. When you have defeated all their Pokémon in battle, check the box in the `Defeated?` column. Check off all boxes to win!

**Note:** it is recommended to play without randomizing trainer names and class names in Universal Pokémon Randomizer so the trainers in this list are easily verified when fighting them.

**Note:** some rivals are missable due to various reasons (like plot or defeating a gym leader). These rivals are marked with an `*` so you are aware of this potential to miss them. This `*` assumes that the setting isn't on where all trainers are spinners, but does assume an item randomizer has been applied (so some missable trainers won't actually be missable if you are playing vanilla).

## Pokédex Minesweeper

The object of Pokédex Minesweeper is to find all of the hidden mines in the Pokédex grid as fast as possible. This is ideally done by using logic to flag the Pokémon you know to be mines based on the clues given by other excavated Pokémon. In order to excavate a grid cell of the Pokédex, you must own that Pokémon in your game, but you don't have to immediately mine a grid cell when you own that Pokémon.

You can even play in hard mode where Pokémon that use SelfDestruct or Explosion in your game trigger an explosion on your grid, too. This will add some small penalties to your overall time, but might open up the grid in a good way for you.

Once all 40 mines have been found, stop your timer and add any accrued penalties to your time to find your final score. If you're racing, whoever has the fastest time wins!

## Points Hint Randomizer

Play whatever type of randomizer you like, but play it faster with a Points Hint system! All of the item checks in Johto and Kanto have been grouped into one of 16 different regions and every key item you can pick up for your randomizer has received a point value of 3, 5, 7, or 9 (based on the item's importance to defeating Red).

After uploading your ROM's spoiler file, a table will appear where each region is listed along with the total item points you can find in that region. When you find a key item from the grid on the right side of the page, simply drag its icon into the slot in the region you found it in. The total item points for that region will decrease based on the item you put in there, which means that you'll know when that region has no more key items! (or just trash)
