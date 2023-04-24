<script>
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import Button from '@smui/button';

  export let isOpen = false;

  let classicTrackerDialogOpen = false;
  let compact1TrackerDialogOpen = false;
</script>

<Dialog bind:open={isOpen} slot="over" surface$style="height: 700px">
  <Title id="howToTitle">How To Use The Points Hint Tracker</Title>
  <Content id="howToContent">
    <p>
      The Points Hint Tracker is a different way to play your Pokémon Crystal Randomizer as it gives you hints as to where Key Items are located in your ROM. This tracker handles any logic settings, including Shopsanity (with Buena and Game Corner) and Nightmare modes, but it does assume that your goal is to beat Red.
    </p>
    <p>
      This tracker works for use with most versions of the Item Randomizer and has been tested to work on v7.1.16.
    </p>

    <h3>Initiating The Tracker</h3>
    <p>
      In order to start the tracker, you will need to upload the spoiler log you received when you generated your rom through the Item Randomizer. The page with this tracker should have popped up a settings dialog where you can first input your spoiler log. If it didn't, click the New Game button to bring it up. You will not be able to start the tracker until a spoiler log file is uploaded.
    </p>
    <p>
      After uploading your spoiler log, you can choose your settings for how you want the region points to be revealed (see Revealing Region Points below for details on how regions are revealed). You can choose between having them revealed in a random order, in descending order (highest total points to lowest total points), or in ascending order (lowest total points to highest total points). If you don't want to play with the revealing game mode, leave the above dropdown alone and check off the "Start with region points revealed?" checkbox. (You can change this later via the In-Game menu)
    </p>
    <p>
      Additionally, you can choose which tracker layout you'd like to play with. See below for information about each tracker type.
    </p>
    <p>
      There also is a button for customizing the point values of each key item in the tracker in this initial settings dialog. Clicking the Customize Item Points button will bring up a secondary dialog where you can set the point value for each item individually rather than rely on its default value (see below for the default values). It is important to note that some of these items have their point value improved based on certain randomizer modifiers added to your seed, so make sure you note these items. They are indicated by a red line under their icon.
    </p>
    <p>
      The upload process will log each Key Item into a region based on where the randomizer placed it in the ROM. If a Key Item has not been randomized (ie. does not appear in the spoiler log), the tracker assumes that the Key Item has been placed in its vanilla location. Each Key Item has been assigned a default point value based on its usefulness to defeating Red:
    </p>
    <ul>
      <li><b>9 Points:</b> Badges</li>
      <li><b>7 Points:</b> Large Region unlock items (such as HMs or Pokegear items)</li>
      <li><b>5 Points:</b> Any other Key Item that unlocks additional checks, like Escape Rope, Rock Smash, or Basement Key</li>
      <li><b>3 Points:</b> Useless Key Items that don't provide checks, like Silver Wing, Blue Card*, or Rods</li>
    </ul>

    <p><b>*</b>Both Blue Card and Coin Case get upgraded to 5-point items if the appropriate Modifiers have been turned on (namely, Buena Items and Game Corner respectively)</p>

    <h3>Tracker Overviews</h3>
    <p>There are two different trackers available for you two play with that cater to different types of players:</p>
    <ul>
      <li>
        <Button color="primary" on:click={() => classicTrackerDialogOpen = true}>Classic</Button>&nbsp;
        This tracker has a wider layout and is complete with all tracker and map references to help you through a seed.
      </li>
      <li>
        <Button color="primary" on:click={() => compact1TrackerDialogOpen = true}>Compact</Button>&nbsp;
        This tracker has a more compact layout and assumes that the runner is more familiar with the regions used in the tracker.
      </li>
    </ul>
  </Content>
  <Actions>
    <Button>Close</Button>
  </Actions>
</Dialog>

<Dialog bind:open={classicTrackerDialogOpen} slot="over">
  <Title>Classic Tracker Overview</Title>
  <Content>
    <p>
      Once the upload is complete, a table will appear with each row being a region where a key item could be placed in the ROM. Beside the name of each region is the remaining number of points of Key Items contained in that region, as well as an empty space for you to put found items in. Some items may have already been placed in this empty space. If so, it means those items were not randomized (ie. they're vanilla) or you have started with them (such as the Bicycle).
    </p>
    <p>
      As well, a table containing the remaining available Key Items will be located on the right including the point value of each Key Item. <b><u>Only Key Items that have been randomized according to your seed settings will show in this list.</u></b> For example, if you are playing on standard Crazy with Hidden Item settings, items like the Map Card will not appear in this table, because they are in their vanilla location. Additionally, if you have the Start With Bike modifier active, then the Bicycle will not appear in this table. The last row of this table contains the amount of points remaining to be found (1) and the total points in the seed (2) in the format of `(1) / (2)`.
    </p>
    <p>
      Underneath this table you will find a more descriptive list of all the locations in Pokémon Crystal and what region number they have been placed in. If a city is listed in a region, then any subareas within that city are also included in that region. For example, Tin Tower is located in Ecruteak City, so item locations in Tin Tower are a part of Region #6.
    </p>
    <p>
      Finally, you can access the In-Game menu via the green button in the top right corner of the page (or under the Region table for smaller screens). This menu is useful for toggling certain settings, accessing this How To Play dialog, and starting a new game.
    </p>

    <h3>Revealing Region Points</h3>
    <p>
      The total number of points of Key Items for each region will remain hidden with `??`. Every time you find a 9-point item in your game and place them into the region table (see Using The Tracker below), a region's remaining point value will be revealed and bolded according to the ordering you chose when initiating the tracker. If you replace the 9-point item back into the item table, the last region's remaining point value that was revealed will become hidden again and will also be the next region to reveal its point value when another 9-point item is placed in the table.
    </p>
    <p>
      At any time, you can toggle the reveal mode by clicking the `Show/Hide Region Points` in the In-Game menu, which will reveal all remaining point values of all regions. If you are hiding the region points via this button, the regions that have already been revealed with 9-point items found will not become hidden.
    </p>

    <h3>Using The Tracker</h3>
    <p>
      As you play your ROM, you can note the region where you found a Key Item by dragging the item's icon from the items table on the right into the appropriate region slot on the table on the left. For example, if you found the Boulder Badge in Cherrygrove Mart, drag the Boulder Badge icon from the 9 row of the right items table into Region #1's row on the table on the left.
      <br />
      You can note, that when you drop the icon into a revealed region's row in the table, the Points Left value of that region will decrease based on the value of the item you placed there. If you ever make a mistake, you can always freely drag icons from region rows to other region rows, or even back to the available items table on the right.
    </p>

    <p>
      Instead of dragging, you can also click items in any list to move them to a different list. Clicking an item will bring up a black border around the clicked item. As well, any logical slot that item can be placed will highlight in green (a region showing `??` is always assumed to have enough points to fit the item). Clicking a green section will place the selected item in that slot. To deselect a selected item, click anywhere outside the region table or the available item table.
    </p>

    <p>
      If you are unsure what item an icon represents, simply hover your mouse over the icon and a tooltip should display with the item's name and how many points it is worth.
    </p>

    <h3>References</h3>
    <p>
      Underneath the available items table is a small section containing various references that can help you use this tracker effectively:
    </p>
    <ul>
      <li><b>Johto Map:</b> A map of Johto displaying the boundaries of the Johto regions. (1-12)</li>
      <li><b>Kanto Map:</b> A map of Kanto displaying the boundaries of the Kanto regions. (13-16)</li>
      <li><b>Text Regions:</b> A list of all the regions and the major locations contained within them, including routes and dungeons.</li>
      <li><b>Point Sums:</b> A list of various Points Left amounts and what combinations of Key Item points it would take to add up to that number. This assumes you are using the default preset for item point values, that is: 9, 7, 5, and 3.</li>
    </ul>

    <h3>Additional Info</h3>
    <p>
      At any time, you can peek the solution of the tracker by clicking the Show Solution button in the In-Game menu. This will cause an extra column to display in the Region table showing which region each Key Item can be found in. These key items in the solution are listed in descending points order. <br />
      <b>Note: </b> if you have progressive Rods turned on, the Rod icons might be in different Regions in the solution compared to where you found them, but they're all worth the same number of points anyway.
    </p>
    <p>
      To start a new game, click the Start New Game button in the In-Game menu. The tables will reset and the initial game settings dialog will show so you can upload your next spoiler log.
    </p>
  </Content>
  <Actions>
    <Button>Close</Button>
  </Actions>
</Dialog>

<Dialog bind:open={compact1TrackerDialogOpen} slot="over">
  <Title>Compact Tracker Overview</Title>
  <Content>
    <p>
      This tracker has certain functionality that is the same as the Classic tracker. This includes:
    </p>
    <ul>
      <li>Key Items showing according to your seed's settings</li>
      <li>Dragging or clicking items between the grids and region grid rows</li>
      <li>Region point values getting revealed as 9-pt items are placed</li>
      <li>Labels for item point values, region point values, and total point values</li>
    </ul>

    <p>
      Besides the look of the tracker being different from Classic, there are a few notable functionality differences, too.
    </p>
    <ul>
      <li>Whenever you set an item into the region grid, it does not disappear from the available item grid. Instead, the icon lights up and shows a number indicating which region it was placed into.</li>
      <li>You can right-click any item in the region grid to reset its position back to the available item grid.</li>
      <li>If an item could be found on a pokemon, such as a held item or a field move, you can click the item in the available item grid and click the `Found On Pokémon` button. This will light up the item and place a `P` on it, but will not contribute to any totals in the region grid.</li>
      <li>Region ids and titles have been replaced by an appropriate image that loosely describes the checks within th region. They are still presented in the same order as in the Classic tracker (left-right, then top-bottom). You can still hover over each image to gets its id, name, and description.</li>
      <li>Revealing the solution from the Menu button will show the items in each region you have not found as a faded-out version. It does not indicate if an item you found there is incorrect, though.</li>
    </ul>
  </Content>
  <Actions>
    <Button>Close</Button>
  </Actions>
</Dialog>
