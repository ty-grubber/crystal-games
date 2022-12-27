/**
 *
 * @param {Array<any>} arr
 * @param {number} columns
 * @returns
 */
function convertTo2DArray(arr, columns) {
  var arr1d = [...arr];
  var arr2d = [];

  while (arr1d.length > 0) {
    arr2d.push(arr1d.splice(0, columns))
  }

  return arr2d;
}

/**
 *
 * @param {Array<any>} arr2d
 * @returns
 */
function flatten2DArray(arr2d) {
  return arr2d.reduce((prev, next) => {
    return prev.concat(next);
  });
}

/**
 *
 * @param {number} index
 * @param {number} columns
 * @returns
 */
function convertIndexTo2DIndex(index, columns) {
  const i = Math.floor(index / columns);
  const j = index % columns;

  return { i, j };
}

/**
 *
 * @param {any} ddIndex
 * @param {number} columns
 * @returns
 */
function convert2DIndexToIndex(ddIndex, columns) {
  return ddIndex.i * columns + ddIndex.j;
}

export {
  convert2DIndexToIndex,
  convertIndexTo2DIndex,
  convertTo2DArray,
  flatten2DArray,
}
