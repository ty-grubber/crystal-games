import seedrandom from 'seedrandom';

/**
 * @param {Array<any>} arr
 * @param {String} seed
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
 * @returns
 */
function randomTiesSorting(arr, direction) {
  const newArr = [...arr];
  const rng = seedrandom();

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

export {
  randomizeArray,
  randomTiesSorting
}
