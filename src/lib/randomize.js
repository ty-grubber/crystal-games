import seedrandom from 'seedrandom';

/**
 * @param {Array<any>} arr
 * @param {String} seed
 * @returns {Array<any>}
 */
function randomizeArray(arr, seed) {
  if (!seed) {
    return arr;
  }

  const newArr = [...arr];
  const rng = seedrandom(seed);
  for (var i = newArr.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(rng() * (i + 1));
    const currentEntry = newArr[i];
    const entryToSwap = newArr[swapIndex];
    newArr[i] = entryToSwap;
    newArr[swapIndex] = currentEntry;
  }
  return newArr;
}

/**
 *
 * @param {Array<any>} arr
 * @param {String} direction
 * @param {String} seed
 * @returns {Array<any>}
 */
function randomTiesSorting(arr, direction, seed) {
  const newArr = [...arr];
  const rng = seedrandom(seed);

  return newArr.sort((a, b) => {
    if (a.points === b.points) {
      return Math.floor(rng() * 100) % 2;
    } else {
      switch (direction) {
        case "asc":
          return a.points - b.points;
        case "desc":
          return b.points - a.points;
        default:
          return 0;
      }
    }
  });
}

function getRandomHostID() {
  const randomAppend = (seedrandom()() * 100000000).toFixed(0).toString().padStart(8, '00000000');
  const now = new Date(Date.now());
  return `${now.getHours().toString().padStart(2, '00')}${now.getMinutes().toString().padStart(2, '00')}${randomAppend}`;
}

export {
  getRandomHostID,
  randomizeArray,
  randomTiesSorting
}
