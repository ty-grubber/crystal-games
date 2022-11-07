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

export {
  randomizeArray
}
