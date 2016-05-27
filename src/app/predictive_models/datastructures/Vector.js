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
  constructor(values, names) {
    this.values = []; // The actual value of the vector
    this.names = [];  // Maintain a list of variable names

    if (values && values.length) {
      const validNames = values.length === names.length;

      for (let i = 0; i < values.length; i++) {
        this.values[i] = values[i];
        if (validNames) {
          this.names[i] = names[i];
        } else {
          this.names[i] = false;
        }
      }
    }
  }

  /**
   * Add a dimension value to this vector
   * @param {Mixed} value
   * @return {Vector} itself
   */
  add(value, name) {
    this.values.push(value);

    if (name !== undefined) {
      this.names.push(name);
    } else {
      this.names.push(false);
    }
  }


  /**
   * The number of dimensions for this vector
   * @return {Integer}
   */
  get length() {
    return this.values.length;
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
    if (index >= this.values.length) {
      throw new Error('Vector out of bounds error!');
    }

    return this.values[index];
  }

  /**
   * Compute the distance between two vectors
   * @param  {Vector} vector1
   * @param  {Vector} vector2
   * @return {Number}         distance between the two vectors
   */
  static computeDistance(vector1, vector2) {
    let innerSum = 0;

    for (let i = 0; i < vector1.length; i++) {
      innerSum += Math.pow((vector1.get(i) - vector2.get(i)), 2);
    }

    return Math.sqrt(innerSum);
  }

}
