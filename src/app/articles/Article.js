import natural from 'natural';


export default class Article {
  /**
   * Create an article to parse our players and words
   *
   */
  constructor(contents = '', name = '') {
    if (typeof contents !== 'string') {
      throw new Error('Article contents must be a string!');
    }

    this.contents = contents;
    this.name = name;
  }

  /**
   * Tokenize this article
   * @param  {Object} options Configurable options such as nGrams, stemming
   * @return {Array}         Array of the tokens
   */
  tokenize(options = {}) {
    if (!this.tokens) {
        // Tokenize the article
      if (options) {
        // Run the tokenizer with the options
      }
    }

    return this.tokens;
  }

  /**
   * Create nGrams for this article
   * @param  {Object} options
   * @return {Array}  tokenized ngrams
   */
  nGrams(n = 2) {
    const NGrams = natural.NGrams;
    return NGrams.ngrams(this.contents, n);
  }

  /**
   * Classify players names to help better identify players within an article
   * @param  {File} classifierJSON object containing the results from training
   * @return {Classifer}
   */
  classifyPlayers(classifierJSON) {
    if (!classifierJSON) throw new Error('Must specify a training object!');
    // TODO
  }

  /**
   * Classify teams to help better identify players within an article
   * @param  {File} classifierJSON object containing the results from training
   * @return {Classifer}
   */
  classifyTeams(classifierJSON) {
    if (!classifierJSON) throw new Error('Must specify a training object!');
    // TODO
  }

  /**
   * The number of times a term occurs in a document
   * @param  {String} term term wer are checking for in the articles
   * @return {Object}      Results object
   */
  termFrequency(term) {
    return { term };
  }

  /**
   * Replace pronouns with proper names
   * @param  {String} content
   * @return {String}
   */
  pronounReplacement(content) {
    // TODO
    return content;
  }

  /**
   * Check the validatidy of an article
   * @param  {Article}  article Article to check
   * @return {Boolean}
   */
  static isArticle(article) {
    return article instanceof Article;
  }
}
