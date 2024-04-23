// https://dev.to/samanthaming/how-to-deep-clone-an-array-in-javascript-3cig
const cloneArray = (items) => items.map(item => Array.isArray(item) ? cloneArray(item) : item);

class Coordinate {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    static applyCoordinatesToPosition(coordinate, position){
        return new Coordinate(coordinate.x+position.x, coordinate.y+position.y);
    }

    isEqual(anotherCoordinate){
        if (this.x !== anotherCoordinate.x){
            return false;
        }
        if (this.y !== anotherCoordinate.y){
            return false;
        }
        return true;
    }

    toString(){
        return "("+this.x.toString()+","+this.y.toString()+")"; 
    }
}

function getAll2dIndexes(arr, val) {
    var indexes = [];
    for(var i = 0; i < arr.length; i++){
        for (var j=0; j < arr[i].length; j++){
            if (arr[j][i] === val)
                indexes.push(new Coordinate(j,i));
        }
    }
    return indexes;
}

class Material {
    /// Shape is a 3*3 array with True meaning solid and false meaning empty
    /// Color is in ["R", "B", "G", "Y", "W"]
    /// basePoint is integer
    /// index is 1-index
    constructor(shape, color, basePoint, index, pointGroup) {
        this.shape = shape;
        this.color = color;
        this.basePoint = basePoint;
        this.index = index;
        this.pointGroup = pointGroup;
    }

    get jsonObject(){
        return {"Shape": this.shape, "Color": this.color, "BasePoint": this.basePoint, "PointGroup": this.pointGroup};
    }

    isSolid(position){
        return this.shape[position.y][position.x];
    }

    isEmptyRow(rowIndex){
        for (var i = 0; i < 3; i++){
            if (this.shape[rowIndex][i]){
                return false;
            }
        }
        return true;
    }

    isEmptyColumn(columnIndex){
        for (var i = 0; i < 3; i++){
            if (this.shape[i][columnIndex]){
                return false;
            }
        }
        return true;
    }

    getCoordinatesToApply(position){
        var allCoordinates = getAll2dIndexes(this.shape, 1);
        var returnCoordinates = [];
        for(var i =0; i < allCoordinates.length; i++){
            returnCoordinates.push(Coordinate.applyCoordinatesToPosition(allCoordinates[i], position));
        }
        return returnCoordinates;
    }

    flipMaterial(position){
        if (this.shape[position.y][position.x] === 0){
            this.shape[position.y][position.x] = 1;
        } else {
            this.shape[position.y][position.x] = 0;
        }
    }
    changeColor(targetColor){
        this.color = targetColor;
    }
    changeBasePoint(basePointTo){
        this.basePoint = basePointTo;
    }
}

class Cell {
    /// grade is of [0,1,2,3]
    /// color is in ["R", "B", "G", "Y", "W"]
    /// isHole is boolean
    constructor(grade, color, isHole, isPlaced=false, placeMaterialIndex=-1, placedColor="") {
        this.grade = grade;
        this.color = color;
        this.isHole = isHole;
        this.isPlaced = isPlaced;
        this.placedMaterialIndex = placeMaterialIndex;
        this.placedColor = placedColor;
    }

    clone(){
        return new Cell(this.grade,this.color, this.isHole, this.isPlaced, this.placedMaterialIndex, this.placedColor);
    }
    
    // for calculation of points
    isSameColor(material) {
        return this.color === material.color;
    }

    // for adjacency cell 
    increaseGrade(){
        if (this.grade < 3 && !this.isPlaced){
            this.grade = this.grade + 1;
        }
    }

    // Major method to handle logic on placing material
    // return whether there is any material overlapped and give the index of it
    // if no material is overlapped return -999
    placeMaterial(material){
        var overlapped = false;
        var releaseIndex = -1;
        if (this.isPlaced){
            overlapped = true;
            releaseIndex = this.placedMaterialIndex;
        }
        this.grade = 0
        this.isPlaced = true;
        this.placedColor = material.color;
        this.placedMaterialIndex = material.index;
        if (overlapped){
            return releaseIndex;
        } else return -999;
    }

    // release function, used as broadcast, ignore whether the cell is overlapped or not
    // ignore when the releaseIndex is -999, which just means nothing happen
    releaseCell(releaseIndex){
        if (releaseIndex == -999){
            return;
        }
        if (this.isPlaced && this.placedMaterialIndex == releaseIndex){
            this.isPlaced = false;
            this.placedMaterialIndex = -1;
            this.placedColor = "";
        }
    }
}

class Board{
    /// initialGradeGrid is a 2d array 
    /// colorGrid is also a 2d array and have the same dimension as initialGradeGrid
    /// isHoleGrid is the same as above
    constructor(initialGradeGrid, colorGrid, isHoleGrid) {
        this.CellArray = [];
        this.allColor = new Set();
        for (var i=0; i < initialGradeGrid.length; i++){
            var row = [];
            for (var j=0; j < initialGradeGrid[i].length; j++){
                row.push(new Cell(initialGradeGrid[i][j], colorGrid[i][j], isHoleGrid[i][j]));
                if(!this.allColor.has(colorGrid[i][j])){
                    this.allColor.add(colorGrid[i][j]);
                }
            }
            this.CellArray.push(row);
        }
        // used to pass to game for calculation of point
        this.CellGradePlacedChannel = [];
        this.SameColorChannel = [];
    }

    get dimension(){
        var maxY = this.CellArray.length;
        var maxX = 0;
        if (maxY > 0){
         maxX = this.CellArray[0].length;
        }
        return [maxY,maxX]
    }

    get colorOccupancyPercentage() {
        var allCellReadOnly = this.getAllCells();
        var colorOccupiedGrid = {};
        for (const color of this.allColor){
            colorOccupiedGrid[color] = 0;
        }
        var oneCellPercentage = 1.0 / allCellReadOnly.length;
        for (var i=0; i < allCellReadOnly.length; i++){
            var currentColor = allCellReadOnly[i].placedColor;
            // check if cell is placed
            if (currentColor !== ""){
                // check if there is any record for color
                if (currentColor in colorOccupiedGrid){
                    colorOccupiedGrid[currentColor] += oneCellPercentage;
                } else {
                    colorOccupiedGrid[currentColor] = oneCellPercentage;
                }
            }
        }
        return colorOccupiedGrid;
    }

    get highestColorOccupancy(){
        var maxValue = 0.0;
        var maxKey = [];
        for (const [key, value] of Object.entries(this.colorOccupancyPercentage)) {
            if (value > maxValue){
                maxKey = [key];
                maxValue = value;
            } else if (value === maxValue){
                maxKey.push(key);
            }
        }
        return {"color": maxKey, "percentage": maxValue};
    }

    // get the points for previous placement
    applyPointRule(pointRule){
        var totalPoint =0;
        for(var i=0; i < this.CellGradePlacedChannel.length; i++){
            totalPoint += pointRule(this.CellGradePlacedChannel[i], this.SameColorChannel[i]);
        }

        // check if 2 cells have the same color with material
        var sameColor = this.SameColorChannel.filter((i) => { return i;});
        if (sameColor.length >=2){
            // add bonus 1 point
            totalPoint += 1;
        }
        return Math.round(totalPoint);
    }

    //check if coordinate is valid on this board
    isValid(coordinate){
        if (coordinate.x >= this.dimension[0] || coordinate.y >= this.dimension[1] || coordinate.x < 0 || coordinate.y < 0) {
            return false;
        } 
        if (this.CellArray[coordinate.x][coordinate.y].isHole){
            return false;
        }
        return true;
    }

    // return value clone of board
    clone(){
        var aClone = new Board([],[],[]);
        //https://rahuulmiishra.medium.com/understanding-structuredclone-efficient-object-cloning-in-javascript-1ed18700fe47
        //structuredClone will return object without methods
        aClone.CellArray = structuredClone(this.CellArray);
        for (var i=0; i < this.dimension[0]; i++){
            for (var j=0; j < this.dimension[1]; j++){
                aClone.CellArray[i][j] = this.CellArray[i][j].clone();
            }
        }
        aClone.allColor = this.allColor;
        return aClone;
    }

    getCell(coordinate){
        return this.CellArray[coordinate.x][coordinate.y];
    }

    getAllCells(){
        return this.CellArray.flat();
    }

    getJsonString() {
        var gradeGrid = [];
        var colorGrid = [];
        var isHoleGrid = [];
        for (var i=0; i < this.dimension[0]; i++){
            var gradeGridRow = [];
            var colorGridRow = [];
            var isHoleGridRow = [];
            for (var j=0; j < this.dimension[1]; j++){
                if (this.CellArray[i][j].isPlaced){
                    gradeGridRow.push("P");
                } else {
                    gradeGridRow.push(this.CellArray[i][j].grade);
                }
                colorGridRow.push(this.CellArray[i][j].color);
                isHoleGridRow.push(this.CellArray[i][j].isHole);
            }
            gradeGrid.push(gradeGridRow);
            colorGrid.push(colorGridRow);
            isHoleGrid.push(isHoleGridRow);
        }
        return JSON.stringify({"GradeGrid":gradeGrid, "ColorGrid": colorGrid, "isHoleGrid":isHoleGrid})
    }

    // return valid adjacent cells for position
    getAdjacentCells(position, cannotBeEqualCoordinates){
        var adjacentCells = [];
        var adjacentCoordinates = [new Coordinate(-1,-1), new Coordinate(-1,0), new Coordinate(-1,1),
            new Coordinate(0,-1), new Coordinate(0,1),
            new Coordinate(1,-1), new Coordinate(1,0), new Coordinate(1,1)];
        for (var i=0; i < adjacentCoordinates.length; i++){
            var pos = Coordinate.applyCoordinatesToPosition(adjacentCoordinates[i], position);
            if (this.isValid(pos)){
                var haveEqual = false;
                for (var j=0; j < cannotBeEqualCoordinates.length; j++){
                    if (cannotBeEqualCoordinates[j].isEqual(pos)){
                        haveEqual = true;
                    }
                }
                if (!haveEqual){
                    adjacentCells.push(pos);
                }
            }
        }    
        return adjacentCells;
    }

    // get all Adjacent Cell for 1 placement
    getAdjacencyForPlacement(coordinateToApply){
        var adjacentCoordinates = [];
        for (var i=0; i < coordinateToApply.length; i++){
            var newAdj = this.getAdjacentCells(coordinateToApply[i], coordinateToApply.concat(adjacentCoordinates));
            adjacentCoordinates.push(...newAdj);
        }
        return adjacentCoordinates;
    }

    // place material on board
    // input: material: Material, position: Coordinate
    // return: boolean on whether the material is placed
    placeMaterial(material, position){
        // check can be placed
        // get the actual position to apply the material
        var coordinateToApply = material.getCoordinatesToApply(position);
        //check actual position can be placed
        for (var i=0; i < coordinateToApply.length; i++){
            if (!this.isValid(coordinateToApply[i])){
                return false;
            }
        }

        this.CellGradePlacedChannel = [];
        this.SameColorChannel = [];
        // Apply placement 
        var releaseMaterial = [];
        for (var i=0; i < coordinateToApply.length; i++){
            var placedCell = this.getCell(coordinateToApply[i]);
            // apply placement and also store up the index of material to release
            this.CellGradePlacedChannel.push(placedCell.grade);
            this.SameColorChannel.push(placedCell.isSameColor(material));
            releaseMaterial.push(placedCell.placeMaterial(material));
        }
        // find all adjacent cells
        var allAdjacentCell = this.getAdjacencyForPlacement(coordinateToApply);
        // Apply adjacency
        for (var i=0; i < allAdjacentCell.length; i++){
            var adjacentCell = this.getCell(allAdjacentCell[i]); 
            adjacentCell.increaseGrade();
        }
        // Release material
        for (var i=0; i < releaseMaterial.length; i++){
            this.getAllCells().forEach((j)=>{ j.releaseCell(releaseMaterial[i])});
        }
        return true;
    }

    setGrade(x,y,grade){
        var cell = this.getCell(new Coordinate(x,y));
        if (grade >= 0 && grade <= 3){
            cell.grade = grade;
        }
    }

    setColor(x,y,color){
        var cell = this.getCell(new Coordinate(x,y));
        cell.color = color;
    }

    setIsHole(x,y,isHole){
        var cell = this.getCell(new Coordinate(x,y));
        cell.isHole = isHole;
    }
}

class Game {

    /// boardJson: json of dictionary containing keys: GradeGrid, ColorGrid, isHoleGrid, check board constructor
    // materialsJson: json of array of dictionary containing keys: Shape, Color, BasePoint, PointGroup, check material constructor
    // constraints: dictionary of array 
    // applyWhichPointRule: string description of pointRule
    constructor(boardJson, materialsJson, constraints, applyWhichPointRule) {
        var boardVar = JSON.parse(boardJson);
        this.board = new Board(boardVar["GradeGrid"], boardVar["ColorGrid"], boardVar["isHoleGrid"]);
        this.initialBoard = new Board(boardVar["GradeGrid"], boardVar["ColorGrid"], boardVar["isHoleGrid"]);
        this.materials = [];
        var materialVar = JSON.parse(materialsJson);
        // record all color of materials just for future reference
        this.allColor = new Set();
        for(var i=0; i < materialVar.length; i++){
            var currentMaterial = new Material(materialVar[i]["Shape"], materialVar[i]["Color"], materialVar[i]["BasePoint"],i+1, materialVar[i]["PointGroup"]);
            this.materials.push(currentMaterial);
            if (!this.allColor.has(materialVar[i]["Color"])){
                this.allColor.add(materialVar[i]["Color"]);
            }
        }
        this.constraints = constraints;
        this.completedConstraints = [];
        this.setPointRuleByApply(applyWhichPointRule);
        var group = Object.keys(this.constraints);
        // create intermediate points variables for each color in each point group for display and calculation
        this.currentPointInPointGroupColor = {};
        for (var i=0; i < group.length; i++){
            this.currentPointInPointGroupColor[group[i]] = {};
            this.allColor.forEach((c) => this.currentPointInPointGroupColor[group[i]][c] = 0);
        }
        this.History = [];
        this.placedMaterial = [];
        this.pointHistory = [];
    }

    get jsonString(){
        return JSON.stringify({"boardJson":this.boardJsonString, "materialsJson": this.materialsJsonString, "constraints": this.constraints, "applyWhichPointRule":this.pointRuleString});
    }
    
    get boardJsonString() {
        return this.board.getJsonString();
    }

    get initialBoardJsonString() {
        return this.initialBoard.getJsonString();
    }
    get materialsJsonString() {
        var objectToJson = [];
        for(var i=0; i < this.materials.length; i++){
            objectToJson.push(this.materials[i].jsonObject);
        }
        return JSON.stringify(objectToJson);
    }
    get pointRuleString(){
        return this.applyWhichPointRule;
    }

    get getConstraints(){
        return this.constraints;
    }

    get totalPoint() {
        var totalPoint = {};
        var group = Object.keys(this.constraints);
        for (var i=0; i < group.length; i++){
            var pointGroup = group[i];
            totalPoint[pointGroup] = 0;
            for (const [key, value] of Object.entries(this.currentPointInPointGroupColor[pointGroup])) {
                totalPoint[pointGroup] += value;
            }
        }
        return totalPoint;
    }

    get colorOccupancyPercentage(){
        return this.board.colorOccupancyPercentage;
    }

    get gameEnded(){
        return this.placedMaterial.length == this.materials.length;
    }

    get highestColorOccupancyColor(){
        return this.board.highestColorOccupancy["color"];
    }

    get endGamePoints(){
        if (!this.gameEnded){
            return this.totalPoint;
        }
        var matchColor = this.board.highestColorOccupancy["color"];
        var bonusPercentage = this.board.highestColorOccupancy["percentage"];
        var group = Object.keys(this.constraints);
        var endGamePoints = {};
        for (var i=0; i < group.length; i++){
            var pointGroup = group[i];
            endGamePoints[pointGroup] = 0;
            for (const [key, value] of Object.entries(this.currentPointInPointGroupColor[pointGroup])) {
                if (matchColor.includes(key)){
                    endGamePoints[pointGroup] = Math.round(this.totalPoint[pointGroup] * (1.0+bonusPercentage));
                }
            }
        }
        return endGamePoints;
    }

    get satisfiedConstraint() {
        var satisfiedConstraint = {};
        var group = Object.keys(this.constraints);
        for (var i=0; i < group.length; i++){
            satisfiedConstraint[group] = [];
            for (var j=0; j < this.constraints[i].length;j++){
                if (this.endGamePoints[group] >= this.constraints[i][j]) {
                    satisfiedConstraint[group].push(true);
                } else {
                    satisfiedConstraint[group].push(false);
                }
            }
        }
        return satisfiedConstraint;
    }

    setPointRuleByApply(applyWhichPointRule){
        this.applyWhichPointRule = applyWhichPointRule;
        switch(applyWhichPointRule){
            case "357bonus":
                this.pointRule = (grade, isSameColor) =>{
                    var point= 0;
                    switch(grade){
                        case 1:
                            point = 3;
                            break;
                        case 2:
                            point = 5;
                            break;
                        case 3:
                            point = 7;
                            break;
                        default:
                            break;
                    }
                    if (isSameColor){
                        point += grade;
                        point *= 1.5;
                    }
                    return point;
                }
                break;
            case "246":
                this.pointRule = (grade, isSameColor) =>{
                    var point= 0;
                    switch(grade){
                        case 1:
                            point = 2;
                            break;
                        case 2:
                            point = 4;
                            break;
                        case 3:
                            point = 6;
                            break;
                        default:
                            break;
                    }
                    if (isSameColor){
                        point += grade;
                    }
                    return point;
                }
                break;
            default:
                this.pointRule = (grade, isSameColor) =>{
                    return 0;
                }
                break;
        }
    }

    constraintsInGroup(groupKey){
        return this.constraints[groupKey];
    }

    placeMaterial(materialIndex, position){
        // check if material is already placed
        if (this.placedMaterial.includes(materialIndex)){
            return false;
        }
        
        var currentMaterial = this.materials[materialIndex-1];
        // Save history before applying changes
        this.History.push(this.board.clone());
        this.pointHistory.push(structuredClone(this.currentPointInPointGroupColor));

        // Place material
        var placed = this.board.placeMaterial(currentMaterial,position);
        if (!placed){
            // reset save
            this.History.pop();
            this.pointHistory.pop();
            return false;
        }
        // Get Points
        var earnedPoints = this.board.applyPointRule(this.pointRule);
        earnedPoints += currentMaterial.basePoint;
        this.currentPointInPointGroupColor[currentMaterial.pointGroup][currentMaterial.color] += earnedPoints;

        // Indicate placed for material
        this.placedMaterial.push(materialIndex);
        return true;
    }

    undo() {
        if (this.History.length == 0){
            return;
        }
        this.board = this.History.pop();
        this.currentPointInPointGroupColor = this.pointHistory.pop();
        this.placedMaterial.pop();
    }

    flipSpecificMaterialShape(materialIndex, y, x){
        this.materials[materialIndex].flipMaterial(new Coordinate(x,y));
    }

    setBoardSize(targetSize){
        var gradeGrid = [];
        for (var i=0; i < targetSize; i++){
            gradeGrid.push(Array(targetSize).fill(0));
        }
        var colorGrid = [];
        for (var i=0; i < targetSize; i++){
            colorGrid.push(Array(targetSize).fill("W"));
        }
        var isHoleGrid = [];
        for (var i=0; i < targetSize; i++){
            isHoleGrid.push(Array(targetSize).fill(false));
        }
        this.board = new Board(gradeGrid, colorGrid, isHoleGrid);
    }
    
    removeAllMaterialsInPointGroup(pointGroup){
        var removeIndex = [];
        for (var i=0; i < this.materials.length; i++){
            if (this.materials[i].pointGroup == pointGroup){
                removeIndex.push(i);
            }
        }
        for (var j=0; j < removeIndex.length; j++){
            this.materials.splice(removeIndex[j]);
        }
    }
}