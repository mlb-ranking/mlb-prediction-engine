..  _player_model:

Player Model
============

Stats
-----
General idea is to stick with runs/wins as the primary unit of measurement. All stats shouldn't be counters, they should be averaged and weighted. Counters should only be used to permit the stats as statistically relevant. Common stats such as batting average, era, and more traditional stats should all be weighted in the current season. However, stats that don't have as much as a history might not be possible to be accurately weighted per season.

The simulator will allow the user to weight other stats differently but the goal will be to have defaults with the best accuracy.

** Important: Different resources calculate some stats differently. Most notably WAR. **

Resources
~~~~~~~~~
* `Fangraphs Counting vs Rate <http://www.fangraphs.com/library/principles/counting-v-rate/>`_
* `Normalization <http://howto.commetrics.com/methodology/statistics/normalization//>`_

Emphasis
~~~~~
These are the stats my initial thoughts are to focus on and weigh the most heavily.

Definitions
^^^^^^^^^^^^
Counting Stat
    A raw "tallying" number (ex. number of hits)
Rate Stat
    A value divided by other value (ex. hits per at bat)
Traditional w/weight
    A commonly used baseball stat but weighted across years for more accuracy. 
Overall Value
    A catch all stat that encapsulates as many factors as possible into one number.

Overall
^^^^^^^^^
**Qualifiers** - Innings played

.. csv-table:: Overall Stats
    :header: "Stat", "Description", "Stat Type", "Justification", "Notes"

    "WAR", "All inclusive Wins above replacement", "Overall Value", "Cross comparable stat", "N/A"

Offensive
^^^^^^^^^
**Qualifiers** - Plate Appearances

.. csv-table:: Offensive Stats
    :header: "Stat", "Description", "Stat Type", "Justification", "Notes"

    "RC/27", "Runs created per 27 outs", "Rate Stat", "`Accuracy <https://en.wikipedia.org/wiki/Runs_created#Accuracy>`_", "N/A"
    "AVG", "Batting average normalized across years.", "Traditional w/weight", "Popularity", "N/A"
    "wOBA", "Credit a hitter for the value of each outcome", "Overall Value", "`Sabermetrics Popularity & Accuracy <http://www.fangraphs.com/library/offense/woba/>`_", "N/A"

Pitching
^^^^^^^^
**Qualifiers** - Innings Pitched (differentiate starters and relievers)

.. csv-table:: Pitching Stats
    :header: "Stat", "Description", "Stat Type", "Justification", "Notes"

    "ERA", "Earned runs per 9 innings normalized across years", "Traditional w/weight", "Popularity", "N/A"
    "dERA", "Projects what a pitcher's earned run average (ERA) would have been, if not for the effects of defense and luck on the actual games in which he pitched.", "Overall Value", "Sabermetrics Popularity", "Notes"
    "BABIP", "How often non-home run batted balls fall for hits", "Rate Stat", "`Sabermetrics Popularity & Accuracy <http://www.fangraphs.com/library/pitching/babip/>`_", "N/A"

Defensive
^^^^^^^^^
**Qualifiers** - Innings played

.. csv-table:: Defensive Stats
    :header: "Stat", "Description", "Stat Type", "Justification", "Notes"

    "dWAR", "Defensive wins above replacement", "Overall Value", "Sabermetrics Popularity & Accuracy", "N/A"

Non Statistical Based Measurements
----------------------------------
Analyzing prospects (domestic & international) will be one of the most difficult parts to build on the database. It will based on a lot of different baseball analysts top prospect lists. 

Ideas
~~~~~
* Position on top ranking lists 
* Scouting power rankings (difficult to analyze many different sites have different definitions for this)
* High school stats **difficult to acquire**
* Analyze bio, height, etc when predicting. 

Additional Ideas
~~~~~~~~~~~~~~~~
* Mainting the movement a player undergoes on top lists 





