..  _first_results:

First Run Results
=================
The first similarity runs on the data were very simple. Using N-Dimensional euclidean distance analyzing the stats: 

.. csv-table:: Stats Analyzed
    :header: "Stat", "Abbrev", "Qualifier"

    "Plate Appearances", "pa", "> 502"
    "Hits", "h", "N/A"
    "Homeruns", "hr", "N/A"
    "Runs Batted In", "rbi", "N/A"
    "Batting Average", "ba", "N/A"

.. code:: JSON

    "meta": {
        "year": 2015,
        "stats": [
          "pa",
          "h",
          "hr",
          "rbi",
          "ba"
        ],
        "date": "2016-02-14T07:47:40.385Z",
        "distanceAlgorithm": "euclidean",
        "similairtyAlgorith": "1/(1 + distance)",
        "qualifier": "plate appearances > 502",
        "pairs": 5565
    },


Most Similar Players
--------------------

.. csv-table:: Most Similar Players
    :header: "Player", "Player", "Distance", "Similarity"

    "Avisail García", "Brett Lawrie", 5.1961532887319635, 0.16139045523914872
    "Christian Walker", "Nick Castellanos", 5.291503000093641, 0.15894453201168565
    "Asdrubal Cabrera", "Cameron Maybin", 6.557438829299134, 0.13231995952426898
    "Jean Segura", "Andrelton Simmons", 6.708208702776025, 0.12973182727134272
    "Yunel Escobar", "Cristhian Adames", 7.416211701401195, 0.11881830394469668
    "Matt Kemp", "Jesús Aguilar", 7.549834700177216, 0.11696132557735561
    "Stefen Romero", "Corey Seager", 7.615775469379333, 0.11606616299995552
    "Joe Mauer", "Elvis Andrus", 7.681148937496265, 0.1151921257427949
    "Charlie Blackmon", "Adam Eaton", 7.937253933193772, 0.11189119247086728
    "Cameron Maybin", "Derek Norris", 8.062275671297776, 0.11034755907583128
    "Asdrubal Cabrera", "Derek Norris", 8.831773604435295, 0.101711048304538
    "Alexei Ramírez", "Kolten Wong", 9.165160609612904, 0.09837522872529218
    "Darnell Sweeney", "Rob Refsnyder", 9.219544457292887, 0.09785171972967724
    "David Peralta", "Alex Dickerson", 9.327380393229387, 0.09682997642418578
    "Billy Butler", "Avisail García", 9.433983040052594, 0.0958406771566843
    "Francisco Cervelli", "Leury García", 9.486836353600708, 0.09535764326642181
    "Francisco Cervelli", "Daniel Castro", 9.94988889385203, 0.09132512756010375
    "Chris Coghlan", "Pablo Sandoval", 10.049876864917302, 0.0904987460244865
    "Yangervis Solarte", "Starlin Castro", 10.148892796753742, 0.08969500543508438
    "Yangervis Solarte", "Keon Broxton", 10.246951205114621, 0.08891298466247846
    "Neil Walker", "Nick Castellanos", 10.24696032977585, 0.08891291252735571
    "Jean Segura", "Didi Gregorius", 10.295633249101291, 0.08852978650661861
    "Kyle Seager", "Kole Calhoun", 10.295634997415167, 0.08852977280417035
    "Brandon Belt", "Dariel Álvarez", 10.44030693993237, 0.08741024215963139
    "Freddy Galvis", "Marcus Semien", 10.44030823299772, 0.08741023227990148


Conclusions
-----------