//https://stackoverflow.com/questions/3231459/how-can-i-create-unique-ids-with-javascript
//Note length is inconsistent
function uniqueId(){
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

//https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
// Only work on https and certain browser
function cryptoUniqueId(){
    try {
        return crypto.randomUUID();
    } catch {
        return "";
    }
}

function arrayCopy(base){
    return JSON.parse(JSON.stringify(base));
}
function arrayRotate(matrix){
    if (matrix.length == 0){
        return matrix;
    }
    //https://stackoverflow.com/questions/15170942/how-to-rotate-a-matrix-in-an-array-in-javascript
    var array = matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
    return pushValuesOf2DArrayToTopLeft(array);
}
function pushValuesOf2DArrayToTopLeft(array){
    var newarray = [];
    var emptyrow = [];
    for (var i=0;i < array[0].length; i++){
        emptyrow.push(false);
    }
    // push array values to top
    for (var i=0; i < array.length; i++){
        var rowAllFalse = true;
        for (var j=0; j < array[i].length;j++){
            if (array[i][j]){
                rowAllFalse = false;
            }
        }
        if (!rowAllFalse){
            for (var k=i; k < array.length; k++){
                newarray.push(array[k]);
            }
            for (var k=0; k < i; k++){
                newarray.push(emptyrow);
            }
            break;
        } 
    }
    var resultarray = [];
    //push values to left
    for (var j=0; j < array[0].length;j++){
        //get the array of column
        var columnArray = newarray.map(function(value,index) { return value[j]; });
        var columnAllFalse = true;
        for (var i=0; i < columnArray.length; i++){
            if (columnArray[i]){
                columnAllFalse = false;
            }
        }
        if (!columnAllFalse){
            for (var i=0; i < array.length;i++){
                var newRowArray = [];
                for (var k=j; k < array[0].length;k++){
                    newRowArray.push(newarray[i][k]);
                }
                for (var k=0; k < j;k++){
                    newRowArray.push(false);
                }
                resultarray.push(newRowArray);
            }
            break;
        }
    }
    return resultarray;
}
function arrayHFlip(array){
    var basearray = arrayCopy(array);
    for(var i=0; i < array.length; i++){
        for (var j=0; j < array[i].length; j++){
            array[i][j] = basearray[i][array[i].length - j -1];
        }
    }
    return pushValuesOf2DArrayToTopLeft(array);
}
function arrayVFlip(array){
    var basearray = arrayCopy(array);
    for(var i=0; i < array.length; i++){
        for (var j=0; j < array[i].length; j++){
            array[i][j] = basearray[array.length - i -1][j];
        }
    }
    return pushValuesOf2DArrayToTopLeft(array);
}

//Input : int, int, any
//Output: 2d array
function create2dEmptyArray(height, width, baseValue){
    var basearray = [];
    for (var i=0; i < height; i++){
        var row = [];
        for (var j=0; j < width; j++){
            row.push(baseValue);
        }
        basearray.push(row);
    }
    return basearray;
}
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

class Shape {
    constructor(shapeArray){
        this.shapeArray = shapeArray;
    }
    vFlip(){
        return new Shape(arrayVFlip(this.shapeArray));
    }
    hFlip(){
        return new Shape(arrayHFlip(this.shapeArray));
    }
    rotate(){
        return new Shape(arrayRotate(this.shapeArray));
    }
    copy(){
        return new Shape(this.shapeArray);
    }

    //Input : Coordinate
    //Output: array of Coordinate
    getFilledPosition(position){
        var result = [];
        for (var i=0; i < this.shapeArray.length; i++){
            for (var j=0; j< this.shapeArray[i].length; j++){
                if (this.shapeArray[i][j]){
                    result.push(new Coordinate(i+position.x,j+position.y));
                }
            }
        }
        return result;
    }
    //Input : Index (int/string)
    //Output: 2D array with 0 and index only 
    getIndexShapeArray(index){
        var result = [];
        for (var i=0; i < this.shapeArray.length; i++){
            var row = [];
            for (var j=0; j< this.shapeArray[i].length; j++){
                if (this.shapeArray[i][j]){
                    row.push(index);
                } else {
                    row.push(0);
                }
            }
            result.push(row);
        }
        return result;
    }

    //Input : Index (int/string)
    //Output: 2D array with 0 and index only 
    getBooleanShapeArray(index){
        var result = [];
        for (var i=0; i < this.shapeArray.length; i++){
            var row = [];
            for (var j=0; j< this.shapeArray[i].length; j++){
                if (this.shapeArray[i][j]){
                    row.push(true);
                } else {
                    row.push(false);
                }
            }
            result.push(row);
        }
        return result;
    }

    //Input : Coordinate
    makeSolidAt(position){
        // ignore error of position
        try {
            this.shapeArray[position.x][position.y] = true;
        } catch {

        }
    }

    //Input : Coordinate
    makeEmptyAt(position){
        // ignore error of position
        try {
            this.shapeArray[position.x][position.y] = false;
        } catch {

        }
    }

    getFirstTrueAtFirstRow(){
        for (var j=0; j< this.shapeArray[0].length; j++){
            if (this.shapeArray[0][j]){
                return j;
            }
        }
        return 0;
    }
}
class Material{
    constructor(shapeArray, index){
        this.shape = new Shape(shapeArray);
        this.originalShape = new Shape(shapeArray);
        this.index = index; 
    }
    vFlip(){
        this.shape = this.shape.vFlip();
    }
    hFlip(){
        this.shape = this.shape.hFlip();
    }
    rotate(){
        this.shape = this.shape.rotate();
    }
    revert(){
        this.shape = this.originalShape.copy();
    }

    //Input : Coordinate
    //Output: array of Coordinate
    getFilledPosition(position){
        return this.shape.getFilledPosition(position);
    }

    //Input : Index (int/string)
    //Output: 2D array with 0 and index only 
    getIndexShapeArray(index){
        return this.shape.getIndexShapeArray(index);
    }

    //Input : Index (int/string)
    //Output: 2D array with 0 and index only 
    getBooleanShapeArray(index){
        return this.shape.getBooleanShapeArray(index);
    }

    //Input : Coordinate
    makeSolidAt(position){
        this.shape.makeSolidAt(position);
    }

    //Input : Coordinate
    makeEmptyAt(position){
        this.shape.makeEmptyAt(position);
    }

    getMaterialOffset(){
        return this.shape.getFirstTrueAtFirstRow();
    }
}

class Board {
    constructor(boardJson){
        var boardObject = JSON.parse(boardJson);
        this.boardIndex = [];
        this.boardUniqueIndex = [];
        for(var i=0; i < boardObject.length; i++){
            this.boardIndex.push([]);
            this.boardUniqueIndex.push([]);
            for (var j=0; j < boardObject[i].length; j++){
                if (boardObject[i][j] != -1){
                    this.boardIndex[i].push(0);
                } else {
                    this.boardIndex[i].push(-1);
                }
                this.boardUniqueIndex[i].push("");
            }
        }
    }

    get gapCount(){
        return this.boardIndex.flat().filter(function (x){ return x== 0;}).length;
    }

    get dimension(){
        return [this.boardIndex.length, this.boardIndex[0].length];
    }

    //Input : Coordinate
    isCoordinateOutOfBoard(position){
        if (position.x < 0 || position. y < 0 || position.x >=this.boardIndex.length || position.y >= this.boardIndex[0].length){
            return true;
        } else {
            return false;
        }
    }

    //Input : Coordinate
    getCurrentIndexOnBoard(position){
        return this.boardIndex[position.x][position.y];
    }

    //Input : Material, Coordinate
    placeMaterialOnPosition(material, position){
        var positionToFill = material.getFilledPosition(position);
        // check if position is out of board
        var anyOutOfBoard = [];
        var filledBefore = [];
        for (var i=0; i < positionToFill.length; i++){
            if (this.isCoordinateOutOfBoard(positionToFill[i])){
                anyOutOfBoard.push(true);
            }
            if (this.getCurrentIndexOnBoard(positionToFill[i])){
                filledBefore.push(true);
            }
        }
        if (anyOutOfBoard.length == 0 && filledBefore == 0){
            // use unique index to highlight the same material
            var uniqueIndex = cryptoUniqueId();
            if (!uniqueIndex){
                uniqueIndex = uniqueId();
            }
            for (var i=0; i< positionToFill.length; i++){
                var pos = positionToFill[i];
                this.boardIndex[pos.x][pos.y] = material.index;
                this.boardUniqueIndex[pos.x][pos.y] = uniqueIndex;
            }
        }
    }
    //Input : Coordinate
    //Output: materialIndex
    pullMaterialFromBoard(position){
        if (this.boardIndex[position.x][position.y] > 0){
            var materialIndex = this.boardIndex[position.x][position.y];
            var materialUniqueIndex = this.boardUniqueIndex[position.x][position.y];
            for(var i=0; i < this.boardUniqueIndex.length; i++){
                for (var j=0; j < this.boardUniqueIndex[i].length; j++){
                    if (this.boardUniqueIndex[i][j] == materialUniqueIndex){
                        this.resetBoardOnPosition(new Coordinate(i,j));
                    }
                }
            }
            this.resetBoardOnPosition(position);
            return materialIndex;
        } else{
            return 0;
        }
    }

    //Input : Coordinate
    resetBoardOnPosition(position){
        this.boardIndex[position.x][position.y] = 0;
        this.boardUniqueIndex[position.x][position.y] = "";
    }

    //Input : Coordinate
    makeHole(position){
        this.boardIndex[position.x][position.y] = -1;
    }
}

class Game{
    constructor(boardJson, materialsJsons, allowFlip, allowRotation, allowInfinite){
        this.boardJson = boardJson;
        this.board = new Board(boardJson);
        this.materialsJsons = materialsJsons;
        var materialsObject = JSON.parse(materialsJsons);
        this.materials = [];
        this.materialsOnDock = [];
        for (var i=0; i < materialsObject.length; i++) {
            this.materials.push(new Material(materialsObject[i], i+1));
            this.materialsOnDock.push(this.materials[i].index);
        }
        this.allowFlip = allowFlip;
        this.allowRotation = allowRotation;
        this.allowInfinite = allowInfinite;
    }

    get gapCount(){
        return this.board.gapCount;
    }

    get boardDimension(){
        return this.board.dimension;
    }

    getAllIndexFromBoard(){
        return this.board.boardIndex;
    }

    getAllMaterialsShape(){
        var result = [];
        for(var i=0; i < this.materials.length; i++){
            var material = this.materials[i];
            result.push(material.getIndexShapeArray(this.materials[i].index));
        }
        return result;
    }

    getAllMaterialJSONObject(){
        var result = [];
        for(var i=0; i < this.materials.length; i++){
            var material = this.materials[i];
            result.push(material.getBooleanShapeArray(this.materials[i].index));
        }
        return result;
    }

    getAllIndex(){
        var result = [];
        for(var i=0; i < this.materials.length; i++){
            result.push(this.materials[i].index);
        }
        return result;
    }

    //Input: materialIndex(int/string)
    //Output: Material
    findMaterialByIndex(materialIndex){
        for (var i=0; i < this.materials.length; i++){
            if (this.materials[i].index == materialIndex){
                return this.materials[i];
            }
        }
        return null;
    }

    //Input: materialIndex(int/string)
    //Output: success
    pullMaterialFromDock(materialIndex){
        if (this.allowInfinite){
            return true;
        } else {
            var index = this.materialsOnDock.indexOf(materialIndex);
            if (index !== -1){
                this.materialsOnDock.splice(index, 1);
                return true;
            } else {
                return false;
            }
        }
    }

    //Input: materialIndex(int/string)
    putMaterialBackOnDock(materialIndex){
        if (!this.allowInfinite){
            if (this.materialsOnDock.indexOf(materialIndex) == -1){
                this.materialsOnDock.push(materialIndex);
            }
        }
    }

    //Input: materialIndex(int/string), Coordinate
    placeMaterialOnBoard(materialIndex, position){
        var material = this.findMaterialByIndex(materialIndex);
        if (material){
            this.pullMaterialFromDock(material.index);
            this.board.placeMaterialOnPosition(material, position);
        }
    }

    //Input : Coordinate
    //Output: materialIndex
    pullMaterialFromBoard(position){
        var index = this.board.pullMaterialFromBoard(position);
        this.putMaterialBackOnDock(index);
        return index;
    }

    vFlipAllMaterialOnDock(){
        if (this.allowFlip){
            for (var i=0; i < this.materials.length; i++){
                this.materials[i].vFlip();
            }
        }
    }

    hFlipAllMaterialOnDock(){
        if (this.allowFlip){
            for (var i=0; i < this.materials.length; i++){
                this.materials[i].hFlip();
            }
        }
    }

    rotateAllMaterialOnDock(){
        if (this.allowRotation){
            for (var i=0; i < this.materials.length; i++){
                this.materials[i].rotate();
            }
        }
    }

    //Input : Coordinate
    makeHoleOnBoard(position){
        this.board.makeHole(position);
    }

    //Input : Coordinate
    resetBoardOnPosition(position){
        this.board.resetBoardOnPosition(position);
    }

    //Input : integer, Coordinate
    makeMaterialSolidAt(materialIndex, position){
        var material = this.findMaterialByIndex(materialIndex);
        if (material){
            material.makeSolidAt(position);
        }
    }

    //Input : integer, Coordinate
    makeMaterialEmptyAt(materialIndex,position){
        var material = this.findMaterialByIndex(materialIndex);
        if (material){
            material.makeEmptyAt(position);
        }
    }

    //Input: integer
    removeMaterial(materialIndex){
        var material = this.findMaterialByIndex(materialIndex);
        if (material){
            var removeIndex = 0;
            for (var i=0; i < this.materials.length; i++){
                if (this.materials[i].index == materialIndex){
                    removeIndex = i;
                }
            }
            this.materials.splice(removeIndex, 1);
        }
    }

    // Input: int
    // Output: int
    getMaterialOffsetFromTopToDownLeftToRight(materialIndex){
        var material = this.findMaterialByIndex(materialIndex);
        if (material){
            return material.getMaterialOffset();
        }
        return 0;
    }

    clone(){
        return new Game(JSON.stringify(this.getAllIndexFromBoard()), JSON.stringify(this.getAllMaterialJSONObject()), this.allowFlip, this.allowRotation, this.allowInfinite);
    }
}