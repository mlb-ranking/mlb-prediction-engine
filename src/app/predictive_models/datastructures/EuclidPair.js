export class EuclidPair {

  /**
   *
   * @param  {Vector} v1 [description]
   * @param  {Vector} v2 [description]
   * @return {[type]}    [description]
   */
  constructor(v1, v2) {
    if (v1.length !== v2.length) {
      throw new Error('Must be the same length');
    } else {
      this.v1 = v1;
      this.v2 = v2;
    }
  }

  get distance() {
    return this.computed === undefined ? this.computeDistance() : this.computed;
  }

  get similarity() {
    return 1.0 / (1.0 + this.distance);
  }

  computeDistance() {
    let innerSum = 0;

    for (let i = 0; i < this.v1.length; i++) {
      innerSum += Math.pow((this.v1.get(i) - this.v2.get(i)), 2);
    }

    this.computed = Math.sqrt(innerSum);
    return this.computed;
  }
}
