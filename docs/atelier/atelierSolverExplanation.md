---
title: Explanation of problem and solver
layout: default
parent: Synthesis Problem in Atelier Sophie the Alchemist of the Mysterious books DX
nav_order: 2
has_children: false
---

## Problem definition
To optimize the output of the alchemy process by constraining the following:
1. material used
2. panel used

Optimization means maximize the number of traits gained in the alchemy process translated to mathematically maximizing the number of conditions met with the constraints.

Input: recipe , board , materials

Output: placement of the materials in order

Rules:
1. We have scores (S1, S2.. Sn) to optimize in the output corresponding to n groups (G1, G2.. Gn) of materials
2. Points are generated at random spot at start on the board
3. Board is at least 4*4 and is covered by random color (PC) (fixed for the whole process)
4. Points are in 3 different grade (G1, G2, G3) giving 3 different points (P1,P2,P3) 
5. Each material has a shape which is at most 3*3
6. For certain board, materials can be flipped or rotated by 90 degree
7. Placing material will cover color (PC) on the baord and will increase the score by Rule 1 and 4, the formula is Summation of points covered + summation of grade with the same color + 1 if multiple same color grid is covered 
8. Placing material will increase the grade points of adajcent panel by 1 or more e.g. G0-> G1, G1-> G2, G2-> G3, G3-> G3 
9. adjacent means the following example:
<img width="514" alt="" src="adjacentImage.png">
where A means adjacent and P means placement

10. Rule 9 will not apply to panel already covered by other materials and the material itself
11. Overlapping material (M1) with new material (M2) will clear out the covered area of M1 and the area will not apply rule 9
12. After placing all materials, materials with the color of the highest occupying percentage will have its score obtained multipled by the percentage
13. There are board that have 50% increase in obtaining points if placing materials on the same color cell that has grade >= 1 (bonus board)
14. The board can have holes inside where you can't place materials on it

Note: rule 13 is not considered in the solver at all as randomness cannot be accounted for.

## Problem further analysis
We can actually encode the rules of the problem into a finite state transition machine. 

Let's start with the smallest building block of the state machine, the grade system of the problem. It can be easily seen from rule 9 that there are at least 4 possible grade in any cell on the grid, e.g. G0, G1, G2, G3 and it will only increase in grade when adjacent block is placed, and will remain if it is not close to the block being placed. When getting placed, it will go down to G0 regardless of current graded. We can then summarize the grade system into the below state machine.

<img width="514" alt="gradeStateMachine" src="https://user-images.githubusercontent.com/49157980/200170946-9b8b87e7-2861-497f-85ad-6699875ff2e9.png">

There are only 3 transitions for the grade states e.g. irrelevant (I), adjacent (A) and placement (P).
We added a placed state (P) in order to satisfy rule 10 and overlap (O) is the only transition that will occur at P by rule 11.

Then, we can start building up the state machine for the whole grid. As it is apparent that placement(P) on one cell will result in adjacency(A) on another nearby cell and also irrelevant(I) to other cell. So the state machine can be described as below:

1. P(i,j) = {A(i-1, j-1), A(i-1, j), A(i-1, j+1), A(i,j-1), A(i,j+1), A(i+1, j-1), A(i+1,j), A(i+1, j+1), I(others)}
2. P(i,j) on placed cell = overlap on placed cell
3. Priority: P > O > A > I

We will need to define overlap more precisely as we don't have the logic for overlap. Overlap only occur when there is a collision in overall placement on those placed by the previous placement but not involved in the collision. There cannot be any collision in between the two transitions. We can define overlap as follow:

1. Collision C(1,2) Exist = Exist {P(i1,j1,n1), P(i2,j2,n2) where n1(x1,y1) == n2(x2,y2) == 1} for x1,x2 in {-1,1} and y1,y2 in {-1,1}
2. Between S1, S2, no C(1, other) Exist, but C(other, 2) can exist for another overlap

The whole problem can then be defined as a state machine below:

1. S0 + P(i1,j1,n1) -> S1 + P(i2,j2, n2) -> S2 ... -> Sn
2. P(i,j,n) = {P(i+x,j+y iff n(x,y) == 1)} for x in {-1,1} and y in {-1,1}

We can then transform this state machine logic into CNF form by using the techniques mentioned in [8](https://baldur.iti.kit.edu/sat/files/2017/l02.pdf). The variables are classified as below:

1. Decision variables: Placing material M at position (i,j) in stage S (S > 0) M(i,j)S
2. Objective variables: Traits gained T
3. Initial board variables: Cell (i,j) having grade G at stage S (S >= 0) G(i,j)S
4. Overlap variables: Material M is being overlapped at stage S (S > 1) OverlapMS
5. Overlap at position variables: position (i, j) being overlapped at stage S (S >1) Overlap(i,j)S
6. Placement variables: cell position (i, j) being placed by material M at stage S (S > 0) PlacedM(i,j)S
7. Last placement variables: Material M still exist on board at last stage lastM
8. Material point variables: Points earned by material M in 8 bits + 1 decimal point PointsM
9. 2 cell has same color with material M variables when placed 2cellM
10.  Sum of material point variables: Sum of 8 SumM
11. Sum of points by group G and color C before calculating color occupying percentage SumBeforeGC
12. variable representing color occupying percentage (0 - 1) COP
13. whether to apply color occupying percentage on color C COPC
14. Multiplication intermediate result of color occupying percentage for group G color C MIGC
15. Sum of points by group G and color C after calculating color occupying percentage SumAfterGC
16. Current total points of group G in 8 bit CTPG
17. Final points obtained by group G in integer form FPG

Calculation of the points in the problem is using binary form as seen in the variables above but attaching the final points to the traits obtained is using Onehot encoding as mentioned in [9](https://content.iospress.com/download/journal-on-satisfiability-boolean-modeling-and-computation/sat190085?id=journal-on-satisfiability-boolean-modeling-and-computation%2Fsat190085). Onehot encoding is used as it can represent inequality easily (e.g 2>=n>0 <=> n == 1 or n == 2).

The flow of the variables are as follows:
1. State progression of board : M(i,j)S and G(i,j)S-1 -> G(i,j)S according to state machine logic
2. Placement representation: M(i,j)S -> PlacedM(I,J)S (Note case is used to denote the positions may be different)
3. Overlap checking: Placedm(I,J)S-1 and M(i,j)S -> OverlapmS and Overlap(I,J)S (Note m and M are 2 different materials)
4. Earn points clause: M(i,j)S and G(i,j)S-1 -> PointsM and 2cellM
5. Sum up points of material: PointsM + 2cellM? 1 : 0 = SumM
6. Sum up points in group of same color: SumM + Summ + ... = SumBeforeGC
7. Last Placement representation: PlacedM(I,J)S -> LastM (when S is last)
8. Color occupying percentage representation: LastM -> COP (explained later)
9. Multiplication of color occupying percentage: SumBeforeGC * COP = SumAfterGC
10. All points in group: SumAfterGC round up-> CTPG
11. Points encoding change CTPG <-> FPG
12. Traits representation FPG > base -> T

For color occupying percentage in 8, we can precompute all possible combination of each material present on the last board or not (2^M) and come up with the color occupying percentage of it and encode it. Addition and multiplication is just basic binary computation. All clause above can be transformed to CNF form by using techniques mentioned in [4](https://ozanerdem.github.io/jekyll/update/2019/11/17/representation-in-sat.html). 



## Reference tools
1. [cryptominisat 5](https://github.com/msoos/cryptominisat)

## Reference
1. [Solving hard industrial combinatorial problems with SAT](https://www.tdx.cat/bitstream/handle/10803/117608/TIAR1de1.pdf?sequence=1&isAllowed=y])
2. [SAT-to-SAT: Declarative Extension of SAT Solvers with New Propagators](https://ojs.aaai.org/index.php/AAAI/article/view/10111)
3. [Solving QBF Instances with Nested SAT Solvers](https://www.researchgate.net/publication/287208991_Solving_QBF_Instances_With_Nested_SAT_Solvers)
4. [Constraint Satisfication and Optimization blog](https://ozanerdem.github.io/)
5. [MAX-SAT and applications](https://sat-group.github.io/ruben/media/p02c24-mxm.pdf)
6. [Fast Linear Temporal Logic checking with SAT solvers](https://arxiv.org/pdf/1401.5677.pdf)
7. [Illustration of LTL in SAT solvers](https://www.birs.ca/cmo-workshops/2018/18w5208/files/RozierKristin.pdf)
8. [State Transition encoding in SAT](https://baldur.iti.kit.edu/sat/files/2017/l02.pdf)
9. [Successful SAT Encoding Techniques](https://content.iospress.com/download/journal-on-satisfiability-boolean-modeling-and-computation/sat190085?id=journal-on-satisfiability-boolean-modeling-and-computation%2Fsat190085)
10. [Handbook of satisfiablity](https://homepage.cs.uiowa.edu/~tinelli/papers/BarSST-09.pdf)



