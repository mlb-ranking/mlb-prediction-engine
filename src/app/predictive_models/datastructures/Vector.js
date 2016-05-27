// import { logger } from 'js-utils';

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
      const validNames = names && (names.length === values.length);

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
   * The euclidean distance between itself and another vector
   *
   * @param  {Vector} vector vector to compare to
   * @return {Number}        The distance between all of the dimensions
   */
  getEuclideandistance(vector) {
    return Vector.euclideanDistance(this, vector);
  }

  /**
   * The euclidean simliarity between itself and another vector
   * @param  {Vector} vector
   * @param  {Number} [distance] precomputed euclidean distance value
   * @return {Number}          euclidean similarity
   */
  getEuclideanSimilarity(vector, distance) {
    if (distance) {
      return 1.0 / (1.0 + distance);
    }
    return 1.0 / (1.0 + Vector.euclideanDistance(this, vector));
  }

  /**
   * The similarity between itself and another vector
   * @param  {Vector} vector
   * @return {Number}       similarity between two vectors
   */
  getJaccardSimilarity(vector) {
    return Vector.jaccardSimilarity(this, vector);
  }

  /**
   * The cosine similarity between itself and another vector
   * @param  {Vector} vector
   * @return {Number}        similarity between two vectors
   */
  getCosineSimilarity(vector) {
    return Vector.cosineSimilarity(this, vector);
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
  static euclideanDistance(vector1, vector2) {
    let innerSum = 0;

    for (let i = 0; i < vector1.length; i++) {
      innerSum += Math.pow((vector1.get(i) - vector2.get(i)), 2);
    }

    return Math.sqrt(innerSum);
  }

  /**
   * Compute the jaccard similarity for two vectors.
   * --- Probably want to remove (not a set)
   * @param  {Vector} vector1
   * @param  {Vector} vector2
   * @return {Number}         similarity between two vectors
   */
  static jaccardSimilarity(vector1, vector2) {
    let num = 0;
    let denom = 0;

    for (let i = 0; i < vector1.length; i++) {
      num += Math.min(vector1.get(i), vector2.get(i));
      denom += Math.max(vector1.get(i), vector2.get(i));
    }

    return num / denom;
  }

  /**
   * Compute the cosine simliarity for two vectors
   * @param  {Vector} vector1
   * @param  {Vector} vector2
   * @return {Number}        similarity between the two vectors
   */
  static cosineSimilarity(vector1, vector2) {
    let dotProduct = 0;
    let vector1SquaredSum = 0;
    let vector2SquaredSum = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1.get(i) * vector2.get(i);
      vector1SquaredSum += Math.pow(vector1.get(i), 2);
      vector2SquaredSum += Math.pow(vector2.get(i), 2);
    }

    vector1SquaredSum = Math.sqrt(vector1SquaredSum);
    vector2SquaredSum = Math.sqrt(vector2SquaredSum);

    return dotProduct / (vector1SquaredSum * vector2SquaredSum);
  }

}
