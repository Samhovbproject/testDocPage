---
title: Synthesis Problem in Atelier Sophie the Alchemist of the Mysterious books DX
layout: default
nav_order: 3
has_children: true
---

Atelier Sophie is a game that is selling on [Steam](https://store.steampowered.com/app/1502970/Atelier_Sophie_The_Alchemist_of_the_Mysterious_Book_DX/). The game involve player trying to create things by alchemist and has a synthesis problem where different materials are used and the product depends on how the alchemy is performed.

The problem involves 3 stages:
1. Player choose which product to make and then the crafting materials
2. Player choose which cauldron for the process
3. Player places the crafting materials inside the cauldron and obtain their product based on the result .

The demo and the solver will only focus on the 3rd stage as it will involves user to input a lot of values for the first 2 stages. This stage will determine the product quality by how many points the player obtained through placing the materials. Materials and product quality are divided into groups, points obtained from placing materials of one group will only affect the product quality of the respective group. Inside each group, there will be several band of points e.g. 0-30, 30-50, >50, points falling inside the band will determine the final quality. Players sometime may desire less point in order to fall inside their desired band like 30-50 but solver will focus on achieving the highest points as possible (Players can still use solver to get the result they want by manipulating the input to it).

Cauldron is a n*n grid and each cell inside the grid will have different color and may have different grade of shard. Points will be obtained when the material is placed on shards inside the cauldron, there are 3 different grades of shards which will earn more points with higher grade. Shards under the material will be consumed after placement. If the cell containing the shard is of the same color with the material, there will be bonus points. Placing materials will create or upgrade shards on all adjacent cells. Upon placing all the shards, the point earning process is completed and will go through a bonus stage. If a material is placed on top of a currently placed material, the old material will disappear from the grid and the space previously occupied by the material will not gain shards from this placment. All points obtained materials with the same color as the color with the highest occupancy percentage will be multiply by (1+ the occupancy percentage).

To report bug on demo, please [create issue](https://github.com/Samhovbproject/SolverProjectGithubPage/issues/new?assignees=Samhovbproject&labels=bug&projects=&template=bug-report-for-atelier-demo.md&title=Bug+report+for+atelier+demo).

To report bug on solver, please [create issue here](https://github.com/Samhovbproject/SolverProjectGithubPage/issues/new?assignees=Samhovbproject&labels=bug&projects=&template=bug-report-for-atelier-solver.md&title=).

