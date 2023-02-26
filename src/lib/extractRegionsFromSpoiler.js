/**
 * @param {any} spoilerFile
 */
function extractRegionsFromSpoiler(spoilerFile) {
  /**
   * Algorithm:
   * - Need Region -> Points array [{regionId: #, totalPoints: #}, ...]
   * - Extract Solution from file
   *    - Starts at line that contains `Solution:`
   *    - Ends at line that contains `Useless Stuff:`
   * - For each line from the extraction:
   *    1. Grab Item Name from line (everything up to `:`)
   *    2. Grab location string from line (everything after `:`)
   *    3. Match Item Name to constant (returns a points number)
   *    4. Match Location string to constant (returns an ID)
   *    5. Add item points number to correct region object in regionPoints array
   *    6. Likely need to note somewhere that the key item has been tracked
   * - At this point we are missing various junk items: (* denotes might be in solution)
   *    - Pokedex, Unown Dex, Bicycle*, Map Card, Blue Card*, Coin Case*, Itemfinder, Rods x3
   * - Iterate line by line from `Useless Stuff` for each remaining junk item
   *    - Follow same extraction method for the solution
   *    - Replace spaces with _
   *    - Look specifically for _ROD for the rods
   */
  return spoilerFile;
}

export default extractRegionsFromSpoiler;
