//https://stackoverflow.com/questions/8342667/jquery-get-position-of-element-relative-to-another-element
function getOffsetTopFromRootParent(ele) {
    let elem = $(ele)[0];
    let offset = 0;
    while (elem.offsetParent != null) {
        offset += elem.offsetTop;
        elem = $(elem.offsetParent)[0];
        if (elem.offsetParent === null) {
            offset += elem.offsetTop;
        }
    }
    return offset;
};
function getOffsetLeftFromRootParent(ele) {
    let elem = $(ele)[0];
    let offset = 0;
    while (elem.offsetParent != null) {
        offset += elem.offsetLeft;
        elem = $(elem.offsetParent)[0];
        if (elem.offsetParent === null) {
            offset += elem.offsetLeft;
        }
    }
    return offset;
};

function drag(e){
    var currentpos = $(e.target).attr('pos');
    var currentPieceId = $(e.target).closest("table").attr("id");
    e.dataTransfer.setData("pieceId", currentPieceId);
    e.dataTransfer.setData("dragpos", currentpos);
    var dragImage = $(e.target).closest("table")[0].cloneNode(true);
    document.body.appendChild(dragImage);
    setTimeout(function() { dragImage.parentNode.removeChild(dragImage) });
    //set dragImage pos back to the td actually dragged
    var actualPos = JSON.parse(currentpos);
    console.log(actualPos);
    var offsetLeft = getOffsetLeftFromRootParent(e.target) - getOffsetLeftFromRootParent($(e.target).closest("table").get(0));
    var offsetTop = getOffsetTopFromRootParent(e.target) - getOffsetTopFromRootParent($(e.target).closest("table").get(0));
    console.log(offsetLeft);
    console.log(offsetTop);
    var browserZoomLevel = window.devicePixelRatio ;
    //console.log(browserZoomLevel);
    e.dataTransfer.setDragImage(dragImage,offsetLeft , offsetTop);
    //e.dataTransfer.setDragImage(dragImage,offsetLeft*browserZoomLevel , offsetTop*browserZoomLevel);
}
function reDrag(e){
    var currentpos = $(e.target).attr('pos');
    var actualPos = JSON.parse(currentpos);
    var currentPieceId = grid[actualPos[0]][actualPos[1]];
    if (currentPieceId == 0){
        return;
    }
    grid = removePiece(actualPos,currentPieceId);
    //console.log(grid);
    //refreshGrid();
    e.dataTransfer.setData("pieceId", currentPieceId);
    e.dataTransfer.setData("dragpos", "[0,0]");
    var dragImage = $("table#"+currentPieceId).get(0).cloneNode(true);
    document.body.appendChild(dragImage);
    setTimeout(function() { dragImage.parentNode.removeChild(dragImage) });
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    softRefreshGrid();
}
function reset(e){
    refreshCountGap();
}

function allowDrop(ev) {
    ev.preventDefault();
}
function arrayAdd(base, arrayToAdd, pos){
    var originalBase = arrayCopy(base); 
    try {
        for (var i=0; i < arrayToAdd.length; i++){
            for (var j=0; j <arrayToAdd[i].length; j++){
                if (arrayToAdd[i][j] > 0){
                    if (base[pos[0]+i][pos[1]+j] == -1){
                        return originalBase;
                    }
                    if (pos[1] + j < 0 || pos[0]+i < 0){
                        return originalBase;
                    }
                    if (pos[0]+i >= base.length || pos[1]+j >= base[0].length){
                        return originalBase;
                    }
                    base[pos[0]+i][pos[1]+j] += arrayToAdd[i][j];
                } 
            }
        }
    } catch (e) {
        console.log(e);
        return originalBase;
    }
    return base;
}
function arrayCopy(base){
    return JSON.parse(JSON.stringify(base));
}
function arrayRotate(matrix){
    if (matrix.length == 0){
        return matrix;
    }
    //https://stackoverflow.com/questions/15170942/how-to-rotate-a-matrix-in-an-array-in-javascript
    return matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
}
function arrayHFlip(array){
    var basearray = arrayCopy(array);
    for(var i=0; i < array.length; i++){
        for (var j=0; j < array[i].length; j++){
            array[i][j] = basearray[i][array[i].length - j -1];
        }
    }
    return array;
}
function arrayVFlip(array){
    var basearray = arrayCopy(array);
    for(var i=0; i < array.length; i++){
        for (var j=0; j < array[i].length; j++){
            array[i][j] = basearray[array.length - i -1][j];
        }
    }
    return array;
}


function drop(ev) {
    ev.preventDefault();
    var droppedPieceId = ev.dataTransfer.getData("pieceId");
    if (droppedPieceId <= 0){
        return;
    }
    var dragPos = JSON.parse(ev.dataTransfer.getData("dragpos"));
    var currentpos = JSON.parse($(ev.target).attr('pos'));
    console.log([currentpos[0]-dragPos[0], currentpos[1]-dragPos[1]]);
    grid = dropPiece(droppedPieceId, [currentpos[0]-dragPos[0], currentpos[1]-dragPos[1]]);
    refreshGrid();
}