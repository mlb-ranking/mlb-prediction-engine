import natural from 'natural';
import fsp from 'fs-promise';
import Article from './Article.js';
import Articles from './Articles.js';

// dev
import { logger } from 'js-utils';

const ARTICLE_DIR = './data/articles/';
const EXAMPLE_DOCS = [
  'this document is about node.',
  'this document is about ruby.',
  'this document is about ruby and node.',
  'this document is about node. it has node examples',
];


function readArticle(filePath) {
  return fsp.readFile(filePath)
    .then((contents) => {
      return contents.toString();
    })
    .catch(logger);
}

function getArticles(dir) {
  const files = fsp.readdirSync(dir);
  const articles = [];

  for (const file of files) {
    const content = fsp.readFileSync(`${dir}${file}`).toString();
    articles.push(new Article(content, file));
  }

  return articles;
}

function parseArticle(article) {
  let stems = natural.PorterStemmer.tokenizeAndStem(article);

  const tfidf = new natural.TfIdf();
  tfidf.addDocument(stems);

  tfidf.tfidfs('cory seager', (i, measure) => {
    logger(`document ${i} is ${measure}`);
  });
}

function frequencyTest(docs) {
  const freq = new Articles(docs);
  logger(freq.inverseDocumentFrequency('Corey Ray'));
  logger(freq.inverseDocumentFrequency('Michael Trout'));
  logger(freq.inverseDocumentFrequency('Jason Groome'));

}


function articleTest() {
  const article = new Article('hello wolrd Josh Rogan is awesome!');
  logger(article.nGrams(2));
}


function playerClassifierCreation() {
  const classifier = new natural.BayesClassifier();
  classifier.addDocument('A.J. Puk', 'Player');
  classifier.addDocument('Mickey Moniak', 'Player');
  classifier.addDocument('Nick Senzel', 'Player');
  classifier.addDocument('Riley Pint', 'Player');
  classifier.addDocument('ljdf as', 'ignore');

  classifier.train();

  logger(classifier.getClassifications('John Smoltz'));
  logger(classifier.getClassifications('asdf fdsa'));
}



try {
  const docs = getArticles(ARTICLE_DIR);
  frequencyTest(docs);
  // articleTest();
  // playerClassifierCreation();



} catch (err) {
  logger(err);
}