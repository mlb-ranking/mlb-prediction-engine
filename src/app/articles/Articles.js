import natural from 'natural';
import Article from './Article.js';

// dev
import { logger } from 'js-utils';

export default class Articles {

  /**
   * Ability to perform various document frequency stats on
   * many different articles
   * @param  {<Articles>Iterable}  articles
   */
  constructor(articles = []) {
    this.articles = [];
    this.addArticles(articles);
  }

  /**
   * Add articles
   * @param {Article||<Article>Iterable} articles
   */
  addArticles(articles) {
    if (Symbol.iterator in Object(articles)) {
      for (const article of articles) {
        this.addArticle(article);
      }
    } else {
      this.addArticle(articles);
    }
  }

  /**
   * Add a single article
   * @param {Article||String} article
   */
  addArticle(article) {
    let tmpArticle = article;

    if (!Article.isArticle(article)) {
      tmpArticle = new Article(article);
    }

    this.dirtyTFIDF = true;  // Flag for when there are new articles
    this.articles.push(tmpArticle);
  }


  /**
   * Determine the term frequency in each document for this term
   * @param  {String} term string that we are checking for in the articles
   * @return {Object}      Results object
   */
  inverseDocumentFrequency(term) {
    const results = {
      term,
      docs: {},
    };

    if (this.dirtyTFIDF) {
      this.tfidf = Articles.createTFIDF(this.articles);
      this.dirtyTFIDF = false;
    }

    this.tfidf.tfidfs(term, (i, measure) => {
      results.docs[this.articles[i].name] = measure;
    });

    return results;
  }

  /**
   * Create a TFIDF that can be used as a utility class as well
   * @param  {<Article||String>Iterable} articles
   * @return {TfIdf}          a term frequency class from the natural npm library
   */
  static createTFIDF(articles) {
    const tfidf = new natural.TfIdf();

    for (let doc of articles) {
      if (!Article.isArticle(doc)) {
        doc = new Article(doc);
      }

      tfidf.addDocument(doc.contents);
    }
    return tfidf;
  }
}
