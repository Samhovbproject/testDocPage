---
title: Explanation of solver
parent: Tetris Packing
layout: default
nav_order: 2
has_children: true
---

The solver is just a small modification on the original comment by sascha that can be seen [here](https://stackoverflow.com/questions/47918792/2d-bin-packing-on-a-grid).

Original solution involves the materials to be used 0 to infinite times where not every materials need to be present in the solution. It also only consider a N*M board without any holes.

Holes can easily be added to the solution by removing the decision variables that represent the placement on the holes.

Reference:
1. [TETRIS-PACKING PROBLEM WITH MAXIMIZING FILLED GRID SQUARES ](https://broncoscholar.library.cpp.edu/bitstream/handle/10211.3/116668/ToPaulJohnAlonte_Thesis2006.pdf?sequence=6)
2. [Two-Dimensional Packing For Irregular Shaped Objects](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.68.8042&rep=rep1&type=pdf)
3. [Two-Dimensional Packing using genetic algorithms](https://www.researchgate.net/publication/225239357_Two-Dimensional_Packing_Problems_Using_Genetic_Algorithms)
4. [Using SAT solver to find optimal packing for tetraminos](https://stackoverflow.com/questions/47918792/2d-bin-packing-on-a-grid)