/**
 * Basic Vector Class
 *
 */
export class Vector {

  /**
   * Vector of iterable.length dimensions
   * @param  {Iterable} iterable
   * @return {Vector}
   */
  constructor(iterable) {
    this.value = iterable;
  }

  /**
   * The number of dimensions for this vector
   * @return {Integer}
   */
  get length() {
    return this.value.length;
  }

  /**
   * Compute the distance between two vectors
   *
   * @param  {Vector} vector vector to compare to
   * @return {Number}        The distance between all of the dimensions
   */
  getdistance(vector) {
    return Vector.computeDistance(this, vector);
  }

  /**
   * Get the value of one of the dimensions
   * @param  {Integer} index Index of the value
   * @return {Number}       value at that index
   */
  get(index) {
    return this.value[index];
  }

  /**
   * Compute the distance between two vectors
   * @param  {Vector} vector1
   * @param  {Vector} vector2
   * @return {Number}         distance between the two vectors
   */
  // static computeDistance(vector1, vector2) {
  //   throw new Error('computeDistance Needs to be filled!');
  // }
}
