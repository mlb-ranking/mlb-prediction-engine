MLB Ranking Documentation 
=========================

.. toctree::
   :maxdepth: 2

   project-goals
   ...

Welcome to the MLB Ranking Documentation!




Example Table:

+------------------------+------------+----------+----------+
| Header row, column 1   | Header 2   | Header 3 | Header 4 |
| (header rows optional) |            |          |          |
+========================+============+==========+==========+
| body row 1, column 1   | column 2   | column 3 | column 4 |
+------------------------+------------+----------+----------+
| body row 2             | Cells may span columns.          |
+------------------------+------------+---------------------+
| body row 3             | Cells may  | - Table cells       |
+------------------------+ span rows. | - contain           |
| body row 4             |            | - body elements.    |
+------------------------+------------+---------------------+

+------------------------+------------+----------+----------+
| Header row, column 1   | Header 2   | Header 3 | Header 4 |
| (header rows optional) |            |          |          |
+========================+============+==========+==========+
| body row 1, column 1   | column 2. adding some more content  | column 3 | column 4 |
+------------------------+------------+----------+----------+
| body row 2             | Cells may span columns.          |
+------------------------+------------+---------------------+
| body row 3             | Cells may  | - Table cells       |
+------------------------+ span rows. | - contain           |
| body row 4             |            | - body elements.    |
+------------------------+------------+---------------------+


Simple Table 

=====  =====  =======
  A      B    A and B
=====  =====  =======
False  False  False
True   False  False
False  True   False
True   True   True
=====  =====  =======

=====  =====  =======
  A      B    A and B
=====  =====  =======
False  False  False
True with some more content  False  False
False  True   False
True   True   True
=====  =====  =======

.. csv-table:: a title
   :header: "name", "firstname", "age"
   :widths: 20, 20, 10

   "Smith", "John", 40
   "Smith", "John, Junior", 20


## Navigation
* [Database Page](https://github.com/JoshuaRogan/mlb-ranking/wiki/Database)
* [Assumptions & Constants - Draft](https://github.com/JoshuaRogan/mlb-ranking/wiki/Assumptions-and-Constants)
* [Simulator / Front End Application](https://github.com/JoshuaRogan/mlb-ranking/wiki/Simulator)
