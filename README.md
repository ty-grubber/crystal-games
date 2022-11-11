# Hidden Rivals Treasure Hunt

This is a tracker app for playing Hidden Rivals Treasure Hunt in Pokemon Crystal.

This app was developed using [Svelte](https://svelte.dev) and includes the Svelte Material UI (SMUI) component library for its designs

![image](https://user-images.githubusercontent.com/19674202/201390031-40045ea3-a19c-4949-af67-221dc9d9b51c.png)


## Developing & Running Locally

Once you've created a project, run the following steps to get the project running locally:

```bash
npm install
npm run dev
```

An `npm run prepare` script exists in package.json that compiles the SMUI styles so they're available when starting the server. If you add another SMUI package or update any theme values in `./src/theme/*`, this command will need to be run so the updates are available.

## How To Play

When the page initially loads you will be presented with a dialog to input the settings for the tracker:

* *Rivals To Defeat* - The number of rivals you need to defeat to win Hidden Rivals. If 0, a list of rivals will not be generated.
* *Searchable Treasure Locations* - The number of possible locations on the map where treasures could be located. This number cannot be smaller than the *Number of Treasures*.
* *Number of Treasures* - The total number of treasures you need to find. If this and Searchable Treasure Locations are 0, a list of treasure locations will not be generated.
* *Seed* - A string used for randomization purposes. Type one your choice or click the Randomize Seed button to have one generated for you.

### Treasure Hunt

Treasure Hunt requires you to explore Johto and Kanto to interact with specific NPCs, items or other interactive objects in order to find treasure. Each potential treasure location is listed under the Location column of the tracker. Find all treasures to win!

If you complete a task where a treasure could be found, check the box in the Found? column of the appropriate row. If there is a treasure there, the Result column will display "TREASURE!!!". If there is not a treasure there, the Result column will display a hint to another location where there is actually treasure. These hints will only double up if there are more non-treasure locations than treasure locations.

### Hidden Rivals

Hidden Rivals is pretty straightforward. The tracker provides a list of trainers that you need to seek out and defeat in battle. When you have defeated all their Pokemon in battle, check the box in the Defeated? column. Check off all boxes to win!

**Note:** it is recommended to play without randomizing trainer names and class names in Universal Pokemon Randomizer so the trainers in this list are easily verified when fighting them.

**Note:** some rivals are missable due to various reasons (like plot or defeating a gym leader). These rivals are marked with an `*` so you are aware of this potential to miss them. This `*` assumes that the setting isn't on where all trainers are spinners, but does assume an item randomizer has been applied (so some missable trainers won't actually be missable if you are playing vanilla).

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
