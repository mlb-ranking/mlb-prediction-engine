..  _algorithms:

Algorithms 
==========
The data science algorithms that will be used to determine similarities among players will be determined based on how accurate the results are during the learning phase. 

Basis of the prediction simulator is to determine similarities between players and teams to provide a better model to predict player and therefore team performance. Requires a **learning phase** to be successful and determine accuracy. This should be easy for most of the common stats as there is a massive amount of data dating back many years.

Determining Accuracy 
--------------------
To determine the accuracy of the predictions the models have we allocate all previous data for the system to be trained on and compare the predicted values with the known values.

Algorithms & Models
-------------------
Many of the algorithms that employed will be that of **collaborative filtering** which often are used in recommender systems to give recommendations of products, movies, shows etc. However, in this case the recommendation will either be players that are similar. Biographical information will be used along with stats to determine how similar to players are. 

Variables
~~~~~~~~~
.. csv-table:: Variables Table
    :header: "Name", "Description"

    "**n**", "number of unique stats we are analyzing"
    "**p**", "number of players"
    "**v**", "number of values for the stats (includes stats over years)"
    "**u**", "undermined stats for a given player"
    "**Pt**", "prediction time of all players and all of their stats"
    "**Lt**", "learning time used by the algorithm to build a dataset in order to determine predictions"

Similarity Measures
~~~~~~~~~~~~~~~~~~~
`Jaccard Similarity <https://www.cs.utah.edu/~jeffp/teaching/cs5955/L4-Jaccard+Shingle.pdf>`_
    A statistic used for comparing the similarity and diversity of sample sets of individual player stats.
`Pearson Correlation Coefficient <https://en.wikipedia.org/wiki/Pearson_product-moment_correlation_coefficient>`_
    Measures how well two stats fit on a straight line
`Adjusted Cosine Similarity <http://www10.org/cdrom/papers/519/node14.html>`_
    Treat stats for each player as vectors in n-dimensional space (n = number of players) and determine the angle between the two vectors. **Important Adjustment** - weight all values with the average of each stat for that particular year as year to year factors change.



Algorithms
~~~~~~~~~~
The table belows some of the algorithms that will be used to create a hybrid between memory and model based collaborative filtering. 

.. csv-table:: Algorithms Table
    :header: "Name", "Description", "Performance", "Use Case"
    
    "`K Nearest Neighbors <http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.31.1422>`_", "Training phase stores only feature vectors. Classification phase assigns labels which is most frequent among the k training samples nearest to the query point.", "TBD", "Very simplistic uses lazy learning"
    "`Slope One <http://arxiv.org/abs/cs/0702144>`_", "Item-based collaborative filtering.", "Lt = pn 2, Pt = (n-x)", "Simple to use"

Potential Problems
------------------
This entire approach of collaborative filtering might produce poor predictions. 


Stats
~~~~~

* Look up the `Curse of dimensionality <https://en.wikipedia.org/wiki/Curse_of_dimensionality>`_ when choosing which stats and what **distance algorithm** to use. *Most often not euclidean.*




