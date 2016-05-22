# MLB Rankings 
[![Documentation Status](https://readthedocs.org/projects/mlb-ranking/badge/?version=latest)](http://mlb-ranking.readthedocs.org/en/latest/?badge=latest)

## Documentation
Documentation for this project is avaiable at [Read the Docs - MLB Rankings](http://mlb-ranking.readthedocs.org/en/latest/)

## Version 
0.0.1

## What is this repo? 
This is the computation engine to run the statistic calculations using the mesaures listed below. 

## Project Goals
A application to predict which MLB teams will be contenders in the range of 3-5 years. Also suggest what a particular team can do to make their team a contender in 3-5 years. Focus which stage a team is in (buying, selling, rebuilding, etc.) and how aggressive they are in that mode. Determine value of players focused on WAR and years of control as primary factors.

This will also be an exploration of [ES2015 / ES6][ES6],  [Map and Reduce], and draw many ideas and algorithms from [Data Science]. 

## Preface
Having played baseball for such a long time this project is very interesting to me on many levels. Much of the baseball specific analysis will be based upon is [The Hidden Game] by John Thorn and Pete Palmer. However, a significant portion of the project will be based on principles of data science not specific to baseball including data mining (with scheduling), association rules, recommender systems utilizing [Jaccard Similarity]. 

## Statistical Components 

### Stat and Player Based Similarities (Collaborative Filtering)
Basis of the prediction simulator is to determine similarities between players and teams to provide a better model to predict player and therefore team performance. Requires a **learning** phase to be successful and gauge accuracy. This should be easy for most of the common stats as there is a massive amount of data dating back many years. 

#### Measures 
* [Jaccard Similarity] - is a statistic used for comparing the similarity and diversity of sample sets of individual player stats
* [Pearson Correlation Coefficient] - measures how well two stats fit on a straight line 
* [Adjusted Cosine Similarity] - treat stats for each player as vectors in n-dimensional space (n = number of players) and determine the angle between the two vectors. 
  * **Important Adjustment** -  weight all values with the average of each stat for that particular year as year to year factors change. 

## Determining Accuracy 
To determine the accuracy of the predictions the models have we allocate all previous data for the system to be *trained* on and compare the predicted values with the known values. 

## Algorithms and Models
Many of the algorithms that employed will be that of [Collaborative Filtering] which often used in recommender systems to give recommendations of products, movies or shows. However, in this case the recommendation will either be players that are similar or in a more narrow scope stats that are similar to predict players that are similar which can lead to the ultimate goal of predicting how teams will ultimately perform.   

#### Variables 

| Name            | Description     | 
|:-------------:  |---------------  |
n | number of unique **stats** we are analyzing
p | number of **players**
v | number of **values** for the stats (includes stats over years)
u | **undermined stats** for a given player
Pt | **prediction time** of all players and all of their stats
Lt | **learning time** used by the algorithm to build a dataset in order to determine predictions

*all players of the same high level position should have all of the stats*

The table belows some of the algorithms that will be used to create a hybrid between memory and model based collaborative filtering. 

| Name         | Description     | Performance     | Use Case        |
-------------  | -------------   | :-------------: | -------------   |
| [K-Nearest Neighbors][k-nearest]  | Training phase stores only *feature* vectors. Classification phase assigns labels which is most frequent among the k training samples *nearest to the query point*.  | **TBD** |  Very simplistic uses *lazy learning* |
| [Slope One]  | description | *Lt = pn <sup>2</sup> <br/> Pt = (n-x)* | USE CASE |

#### Potential Problems


 
## Dev
* [Node.js] - event-driven I/O server-side JavaScript environment based on V8
* [ES6] - NoSQL database system which stores data similar to JSON documents
* [Mongo DB] - standardized single modern database management system 
* [Nginx] - high performance HTTP server
* [Digital Ocean] - simple cloud infrastructure for hosting
* Front End Framework - TBD
* Statistical Analysis Framework - TBD

#### Sections
* [Home][wiki]
* [Database][wiki-db]
* [Simulator][wiki-sm]

[//]: # (Links for cleaner markdown)
  [wiki]: <https://github.com/JoshuaRogan/mlb-ranking/wiki>
  [wiki-db]: <https://github.com/JoshuaRogan/mlb-ranking/wiki/Database>
  [wiki-sm]: <https://github.com/JoshuaRogan/mlb-ranking/wiki/Simulator>
  [The Hidden Game]: <http://www.amazon.com/The-Hidden-Game-Baseball-Revolutionary/dp/022624248X/ref=dp_ob_title_bk>
  [ES6]: <https://babeljs.io/docs/learn-es2015/>
  [Gulp]: <http://gulpjs.com>
  [nginx]: <https://www.nginx.com/resources/wiki/>
  [Digital Ocean]: <https://www.digitalocean.com/features/scaling/>
  [Node.js]: <https://nodejs.org/en/>
  [Mongo DB]: <https://www.mongodb.com/mongodb-architecture>
  [Map and Reduce]: <http://webmapreduce.sourceforge.net/docs/User_Guide/sect-User_Guide-Introduction-What_is_Map_Reduce.html>
  [k-nearest]: <http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.31.1422>
  [Slope One]: <http://arxiv.org/abs/cs/0702144>
  [Data Science]: <http://cacm.acm.org/magazines/2013/12/169933-data-science-and-prediction/abstract>
  [Jaccard Similarity]: <https://www.cs.utah.edu/~jeffp/teaching/cs5955/L4-Jaccard+Shingle.pdf>
  [Pearson Correlation Coefficient]: <https://en.wikipedia.org/wiki/Pearson_product-moment_correlation_coefficient>
  [Adjusted Cosine Similarity]: <http://www10.org/cdrom/papers/519/node14.html>
  [Collaborative Filtering]: <https://en.wikipedia.org/wiki/Collaborative_filtering>
