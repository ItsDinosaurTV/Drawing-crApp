/*
window.onbeforeunload = function () {
    return 'Your changes will be lost!';
};
*/

//Set onscreen canvas and its context
let drawArea = document.getElementById("drawArea");

let onScreenCVS = document.getElementById("onScreen");
let onScreenCTX = onScreenCVS.getContext("2d");
//improve sharpness
let ocWidth = onScreenCVS.offsetWidth;
let ocHeight = onScreenCVS.offsetHeight;
let sharpness = window.devicePixelRatio; //4;
onScreenCVS.width = ocWidth * sharpness;
onScreenCVS.height = ocHeight * sharpness;
onScreenCTX.scale(sharpness, sharpness);

//Get the undo buttons
let undoBtn = document.getElementById("undo");
let redoBtn = document.getElementById("redo");

//Get swatch
//let swatch = document.querySelector(".swatch");
//let backSwatch = document.querySelector(".back-swatch");
let colorArray = [
    "#000000",
    "#7e7e7e",
    "#bebebe",
    "#ffffff",
    "#7e0000",
    "#fe0000",
    "#047e00",
    "#06ff04",
    "#7e7e00",
    "#ffff04",
    "#00007e",
    "#0000ff",
    "#7e007e",
    "#fe00ff",
    "#047e7e",
    "#06ffff"
];

//Get tool buttons
let toolsCont = document.querySelector(".tools");
let toolBtn = document.querySelector("#pencil");
toolBtn.style.background = "rgb(192, 45, 19)";

//let modesCont = document.querySelector(".modes");
//let modeBtn = document.querySelector("#draw");
//modeBtn.style.background = "rgb(192, 45, 19)";

/*
//Create an offscreen canvas. This is where we will actually be drawing, in order to keep the image consistent and free of distortions.
let offScreenCVS = document.createElement('canvas');
let offScreenCTX = offScreenCVS.getContext("2d");
//Set the dimensions of the drawing canvas
offScreenCVS.width = 128;
offScreenCVS.height = 128;
*/

//Create history stacks for the undo functionality
let undoStack = [];
let redoStack = [];
// save undo
let dirty = false;

//Other global variables
let lastX;
let lastY;
let lineX;
let lineY;
let points = [];

//We only want the mouse to move if the mouse is down, so we need a variable to disable drawing while the mouse is not clicked.
let clicked = false;
let lastOnX;
let lastOnY;

//Base settings
//let brushColor = "rgba(255, 0, 0, 255)";
//let brushColor = { color: "rgba(255, 0, 0, 255)", r: 255, g: 0, b: 0, a: 255 };
let penColor = 0;
let brushColor = 1;
let toolColor = "rgba(255, 255, 255, 255)";
//let backColor = {color: "rgba(255, 255, 255, 255)", r: 255, g: 255, b: 255, a: 255};
let toolSize = 1;
let toolErase = false;
//let modeType = "draw";
let toolType = "pencil";
let toolLayer = 1;

//Add event listeners for the mouse moving, downclick, and upclick
// used to be drawArea.addEventListener but is there a benefit to restricting buttons to just the canvas?
addEventListener('mousemove', handleMouseMove);
addEventListener('mousedown', handleMouseDown);
addEventListener('mouseup', handleMouseUp);
//onScreenCVS.addEventListener('mouseover', handleMouseOver);
//onScreenCVS.addEventListener('mouseout', handleMouseOut);

addEventListener("touchmove", handleMouseMove, false);
addEventListener("touchstart", handleMouseDown, false);
addEventListener("touchend", handleMouseUp, false);
addEventListener("touchcancel", handleMouseUp, false);

//Add event listeners for the toolbox
undoBtn.addEventListener('click', handleUndo);
redoBtn.addEventListener('click', handleRedo);

//swatch.addEventListener('click', randomizeColor);
//backSwatch.addEventListener('click', randomizeColor);

toolsCont.addEventListener('click', handleTools);
//modesCont.addEventListener('click', handleModes);


// Save
let saveBtn = document.getElementById("save");
saveBtn.addEventListener('click', saveAsPNG);

// palette
let selectedSwatch;

// layers
const layers = [];

//Create an offscreen canvas. This is where we will actually be drawing, in order to keep the image consistent and free of distortions.
let offScreenCVS = document.createElement('canvas');
let offScreenCTX = offScreenCVS.getContext("2d");

//Set the dimensions of the drawing canvas
offScreenCVS.width = 128;
offScreenCVS.height = 128;

//layers.push(offScreenCVS.getContext("2d"));

addLayer();
addLayer();

function addLayer() {
    let layerCVS = document.createElement('canvas');
    let layerCTX = layerCVS.getContext("2d");
    layerCVS.width = offScreenCVS.width;
    layerCVS.height = offScreenCVS.height;
    let layer = { cvs: layerCVS, ctx: layerCTX, x: 0, y: 0, scale: 1, opacity: 1 }
    layers.push(layer);
}

//Create an Image with a default source of the existing onscreen canvas
let img = new Image;
let source = offScreenCVS.toDataURL();

// keyboard shortcuts
document.addEventListener('keydown', handleKeyDown);
function handleKeyDown(e) {
    switch (e.code) {
        case "KeyZ":
            if (e.ctrlKey) {//control+z
                handleUndo()
            }
            break;
        case "KeyY":
            if (e.ctrlKey) {//control+y
                handleRedo()
            }
            break;
        case "KeyQ":
            selectPencil();
            break;
        case "KeyW":
            selectBrush();
            break;
        case "KeyE":
            selectEraser();
            break;
        default:
            break;
    }
    //console.log(e.code + " " + e.ctrlKey)
}

// temp: load colours on page load
//window.addEventListener("load", setupPalette);
setupPalette();

//Draw all layers onto offscreen canvas to prepare for sampling or export
function consolidateLayers() {
    layers.forEach((l) => {
        offScreenCTX.save()
        offScreenCTX.globalAlpha = l.opacity
        offScreenCTX.drawImage(
            l.cvs,
            l.x,
            l.y,
            offScreenCVS.width,
            offScreenCVS.height
        )
        offScreenCTX.restore()
    })
}

function saveAsPNG() {
    consolidateLayers();
    var link = document.createElement("a");
    link.download = "myCanvas.png";
    link.href = offScreenCVS.toDataURL();// "image/png").replace("image/png", "image/octet-stream");
    //link.href = onScreenCVS.toDataURL('image/png')
    link.click();
}

function setupPalette() {

    for (let i = 0; i < colorArray.length; i++) {
        var color = colorArray[i];
        var id = "swatch" + i;
        var element = document.getElementById(id);

        element.style.background = color;
        element.addEventListener('click', function () { setToolColor(i); });
    }

    setToolColor(0);
}

function setToolColor(i) {
    var id = "swatch" + i;
    var element = document.getElementById(id);
    var actualColor = element.style.background;

    switch (toolType) {
        case "eraser":
            break;
        case "brush":
            brushColor = i;
            break;
        default:
            penColor = i;
            break;
    }

    toolColor = actualColor;
    element.style.outline = "8px solid white";
    element.style.outlineOffset = "-4px";

    if (selectedSwatch != element && selectedSwatch != null && typeof selectedSwatch !== "undefined") {
        selectedSwatch.style.outline = "none";
    }

    selectedSwatch = element;
}

function getCoordinates(event) {
    var trueRatio = onScreenCVS.offsetWidth / offScreenCVS.width;
    var coords = { x: 0, y: 0 };


    if (event.type.startsWith("touch")) {
        var rect = event.target.getBoundingClientRect(); // why is touch stupid augh

        coords.x = event.touches[0].pageX - rect.left;
        coords.y = event.touches[0].pageY - rect.top;
    } else {
        coords.x = event.pageX;
        coords.y = event.pageY;
    }

    // offset position by canvas position
    var rect = onScreenCVS.getBoundingClientRect(); // maybe bad practice?

    coords.x -= rect.left;
    coords.y -= rect.top;

    coords.x = Math.floor(coords.x / trueRatio);
    coords.y = Math.floor(coords.y / trueRatio);

    return coords;
}

function handleMouseMove(e) {
    e.preventDefault();

    let mouse = getCoordinates(event);

    //console.log(mouse);

    //Hover brush
    //let ratio = ocWidth / offScreenCVS.width;
    //let onX = mouse.x * ratio;
    //let onY = mouse.y * ratio;

    if (clicked) {
        /*
        switch (toolType) {
            case "picker":
                //only draw when necessary, get color here too
                if (onX !== lastOnX || onY !== lastOnY) {
                    //get color
                    sampleColor(mouse.x, mouse.y);
                    //draw square
                    onScreenCTX.clearRect(0, 0, ocWidth, ocHeight);
                    drawCanvas();
                    onScreenCTX.beginPath();
                    onScreenCTX.rect(onX, onY, ratio, ratio);
                    onScreenCTX.lineWidth = 0.5;
                    onScreenCTX.strokeStyle = "black";
                    onScreenCTX.stroke();
                    onScreenCTX.beginPath();
                    onScreenCTX.rect(onX + 0.5, onY + 0.5, ratio - 1, ratio - 1);
                    onScreenCTX.lineWidth = 0.5;
                    onScreenCTX.strokeStyle = "white";
                    onScreenCTX.stroke();
                    lastOnX = onX;
                    lastOnY = onY;
                }
                break;
            case "fill":
                //do nothing
                break;
            case "line":
                //reset end point
                //draw line from origin point to current point onscreen
                //only draw when necessary
                if (onX !== lastOnX || onY !== lastOnY) {
                    onScreenCTX.clearRect(0, 0, ocWidth, ocHeight);
                    drawCanvas();
                    //set offscreen endpoint
                    lastX = mouse.x;
                    lastY = mouse.y;
                    actionLine(lineX, lineY, mouse.x, mouse.y, brushColor, brushSize, onScreenCTX, modeType, ratio);
                    lastOnX = onX;
                    lastOnY = onY;
                }
                break;
            case "replace":
                //only execute when necessary
                //sample color
                //draw onscreen current pixel if match to backColor
                //replace if match to backColor
                break;
            default:
            */
        //draw onscreen current pixel
        /*
        if (modeType === "erase") {
            onScreenCTX.clearRect(onX, onY, ratio, ratio);
        } else {
            onScreenCTX.fillStyle = brushColor.color;
            onScreenCTX.fillRect(onX, onY, ratio, ratio);
        }
        */
        /*
        var layer = 0;
        switch (e.button) {
            case 1: // middle
                break;
            case 2: // right
                layer = 1;
                break;
            default:
                break;
        }
        */

        if (lastX !== mouse.x || lastY !== mouse.y) {
            //draw between points when drawing fast
            /*
            if (modeType === "noncont") { //temp
                actionDraw(mouseX, mouseY, brushColor, brushSize, modeType);
                points.push({
                    x: mouseX,
                    y: mouseY,
                    size: brushSize,
                    color: { ...brushColor },
                    tool: toolType,
                    mode: modeType
                });
            } else { //temp
                */
            if (Math.abs(mouse.x - lastX) > 1 || Math.abs(mouse.y - lastY) > 1) {
                //add to options, only execute if "continuous line" is on
                actionLine(lastX, lastY, mouse.x, mouse.y, toolSize, toolColor, toolErase, toolLayer);

                // save undo
                if (dirty) {
                    points.push({
                        startX: lastX,
                        startY: lastY,
                        size: toolSize,
                        color: toolColor,
                        erase: toolErase,
                        tool: "line",
                        layer: toolLayer,
                        endX: mouse.x,
                        endY: mouse.y,
                    });
                }
            } else {
                //perfect will be option, not mode
                //if (modeType === "perfect") {
                //perfectPixels(mouseX, mouseY);
                //} else {
                actionDraw(mouse.x, mouse.y, toolSize, toolColor, toolErase, toolLayer);

                // save undo
                if (dirty) {
                    points.push({
                        x: mouse.x,
                        y: mouse.y,
                        size: toolSize,
                        color: toolColor,
                        erase: toolErase,
                        tool: toolType,
                        layer: toolLayer,
                    });
                }
                //}
            }
            //} //temp
            //source = offScreenCVS.toDataURL();
            if (dirty) {
                renderImage();
            }
            //}
            // save last point
            lastX = mouse.x;
            lastY = mouse.y;
        }
    }
    //console.log(dirty);

    /*
    else {
        //only draw when necessary
        if (onX !== lastOnX || onY !== lastOnY) {
            onScreenCTX.clearRect(0, 0, ocWidth, ocHeight);
            drawCanvas();
            switch (toolType) {
                case "picker":
                    //empty square
                    break;
                default:
                    //colored square
                    onScreenCTX.fillStyle = brushColor.color;
                    onScreenCTX.fillRect(onX, onY, ratio, ratio);
            }
            onScreenCTX.beginPath();
            onScreenCTX.rect(onX, onY, ratio, ratio);
            onScreenCTX.lineWidth = 0.5;
            onScreenCTX.strokeStyle = "black";
            onScreenCTX.stroke();
            onScreenCTX.beginPath();
            onScreenCTX.rect(onX + 0.5, onY + 0.5, ratio - 1, ratio - 1);
            onScreenCTX.lineWidth = 0.5;
            onScreenCTX.strokeStyle = "white";
            onScreenCTX.stroke();
            lastOnX = onX;
            lastOnY = onY;
        }
    }
    */
}

function handleMouseDown(e) {
    e.preventDefault();

    clicked = true;

    let mouse = getCoordinates(event);

    /*
    switch (toolType) {
        case "picker":
            //set color
            sampleColor(mouse.x, mouse.y);
            break;
        case "fill":
            actionFill(mouse.x, mouse.y, brushColor, modeType);
            points.push({
                x: mouse.x,
                y: mouse.y,
                size: brushSize,
                color: { ...brushColor },
                tool: toolType,
                mode: modeType
            });
            source = offScreenCVS.toDataURL();
            renderImage();
            break;
        case "line":
            //Set origin point
            lineX = mouse.x;
            lineY = mouse.y;
            break;
        case "replace":
            //get global colorlayer data to use while mouse is down
            //sample color and replace if match to backColor
            break;
        default:
        */
    /*
    var layer = 0;
    switch (e.button) {
        case 1: // middle
            break;
        case 2: // right
            layer = 1;
            break;
        default:
            break;
    }
    */

    actionDraw(mouse.x, mouse.y, toolSize, toolColor, toolErase, toolLayer);
    lastX = mouse.x;
    lastY = mouse.y;
    //lastDrawnX = mouseX;
    //lastDrawnY = mouseY;
    //waitingPixelX = mouseX;
    //waitingPixelY = mouseY;

    // save undo
    if (dirty) {
        points.push({
            x: mouse.x,
            y: mouse.y,
            size: toolSize,
            color: toolColor,
            erase: toolErase,
            tool: toolType,
            layer: toolLayer,
        });
        //source = offScreenCVS.toDataURL();
        renderImage();
        //}
    }
}

function handleMouseUp(e) {
    e.preventDefault();

    clicked = false;
    dirty = false;

    /*
    let mouse = getCoordinates(event);
 
    //draw line if line tool
    switch (toolType) {
        case "line":
            actionLine(lineX, lineY, mouse.x, mouse.y, brushColor, brushSize, offScreenCTX, modeType);
            points.push({
                startX: lineX,
                startY: lineY,
                endX: mouse.x,
                endY: mouse.y,
                size: brushSize,
                color: { ...brushColor },
                tool: toolType,
                mode: modeType
            });
            source = offScreenCVS.toDataURL();
            renderImage();
            break;
        case "replace":
            //only needed if perfect pixels option is on
            //sample color and replace if match
            break;
        case "pencil":
            //only needed if perfect pixels option is on
            actionDraw(mouse.x, mouse.y, brushColor, brushSize, modeType);
            points.push({
                x: mouse.x,
                y: mouse.y,
                size: brushSize,
                color: { ...brushColor },
                tool: toolType,
                mode: modeType
            });
            source = offScreenCVS.toDataURL();
            renderImage();
            break;
    }
    */

    //add to undo stack
    if (points.length) {
        undoStack.push(points);
    }
    points = [];
    //Reset redostack
    redoStack = [];
}

/*
function handleMouseOver() {
    //if (outOfCanvas) {
    //let mouse = getCoordinates(event);

    //lastX = mouse.x;
    //lastY = mouse.y;

    outOfCanvas = false;
    //}
}

function handleMouseOut() {
    outOfCanvas = true;
}
*/

function handleUndo() {
    if (undoStack.length > 0) {
        actionUndoRedo(redoStack, undoStack);
    }
}

function handleRedo() {
    if (redoStack.length >= 1) {
        actionUndoRedo(undoStack, redoStack);
    }
}

function handleTools(e) {

    //toolType = toolBtn.id;
    var button = e.target.closest(".tool");

    switch (button.id) {
        case "eraser":
            selectEraser();
            break;
        case "brush":
            selectBrush();
            break;
        default:
            selectPencil();
            break;
    }
}

function selectToolButton(id) {
    //reset old button
    toolBtn.style.background = "rgb(105, 76, 212)";
    //get new button and select it
    //toolBtn = e.target.closest(".tool");
    toolBtn = document.getElementById(id);
    toolBtn.style.background = "rgb(192, 45, 19)";
}

function selectPencil() {
    toolType = "pencil";

    selectToolButton(toolType);

    toolSize = 1;
    toolLayer = 1;
    //toolColor = penColor;
    toolErase = false;
    setToolColor(penColor);
}

function selectBrush() {
    toolType = "brush";

    selectToolButton(toolType);

    toolSize = 5;
    toolLayer = 0;
    //toolColor = brushColor;
    toolErase = false;
    setToolColor(brushColor);
}

function selectEraser() {
    toolType = "eraser";

    selectToolButton(toolType);

    toolSize = 5;
    toolLayer = 0;
    //toolColor.color = "rgba(0, 0, 0, 255)";
    toolErase = true;
    //setToolColor("rgba(0, 0, 0, 255)");
}

/*
function handleModes(e) {
    //reset old button
    modeBtn.style.background = "rgb(37, 0, 139)";
    //get new button and select it
    modeBtn = e.target.closest(".mode");
    modeBtn.style.background = "rgb(192, 45, 19)";
    modeType = modeBtn.id;
}
*/

/*
let lastDrawnX, lastDrawnY;
let waitingPixelX, waitingPixelY;
function perfectPixels(currentX, currentY) {
    //if currentPixel not neighbor to lastDrawn, draw waitingpixel
    if (Math.abs(currentX - lastDrawnX) > 1 || Math.abs(currentY - lastDrawnY) > 1) {
        actionDraw(waitingPixelX, waitingPixelY, brushColor, brushSize, modeType);
        //update queue
        lastDrawnX = waitingPixelX;
        lastDrawnY = waitingPixelY;
        waitingPixelX = currentX;
        waitingPixelY = currentY;
        //add to points stack
        points.push({
            x: lastDrawnX,
            y: lastDrawnY,
            size: brushSize,
            color: { ...brushColor },
            tool: toolType,
            mode: modeType
        });
        source = offScreenCVS.toDataURL();
        renderImage();
    } else {
        waitingPixelX = currentX;
        waitingPixelY = currentY;
    }
}
*/

//Action functions
function actionDraw(coordX, coordY, currentSize, currentColor, erase, layer) {

    //offScreenCTX.fillStyle = currentColor.color;
    /*
    switch (currentMode) {
        case "erase":
            offScreenCTX.clearRect(coordX, coordY, 1, 1);
            break;
        default:
        */
    //offScreenCTX.fillRect(coordX, coordY, 1, 1);
    //offScreenCTX.beginPath();
    //offScreenCTX.arc(coordX, coordY, 2, 0, 2 * Math.PI);
    //offScreenCTX.fill();
    drawCircle(coordX, coordY, currentSize, currentColor, erase, layer);
    //        break;
    //}
}

function drawCircle(x, y, radius, newColour, erase, layer) {
    if (radius == 0) {
        changePixel(x, y, newColour, erase, layer);
        return;
    }

    //This here is sin(45) but i just hard-coded it.
    let sinus = 0.70710678118;

    //This is the distance on the axis from sin(90) to sin(45). 
    let range = Math.round(radius / (2 * sinus));

    for (let i = radius; i >= range; --i) {
        let j = Math.round(Math.sqrt(radius * radius - i * i));
        for (let k = -j; k <= j; k++) {
            //We draw all the 4 sides at the same time.
            changePixel(x - k, y + i, newColour, erase, layer);
            changePixel(x - k, y - i, newColour, erase, layer);
            changePixel(x + i, y + k, newColour, erase, layer);
            changePixel(x - i, y - k, newColour, erase, layer);
        }
    }

    //To fill the circle we draw the circumscribed square.
    range = Math.round(radius * sinus);
    for (let i = x - range + 1; i < x + range; i++) {
        for (let j = y - range + 1; j < y + range; j++) {
            changePixel(i, j, newColour, erase, layer);
        }
    }
}

function changePixel(x, y, newColour, erase, layer) {
    if (x >= 0 && x < offScreenCVS.width && y >= 0 && y < offScreenCVS.height) {
        dirty = true;
        //offScreenCTX.fillStyle = newColour;
        layers[layer].ctx.fillStyle = newColour;

        if (erase) {
            //offScreenCTX.clearRect(x, y, 1, 1);
            //layers[layer].ctx.clearRect(x, y, 1, 1);
            layers.forEach(l => {
                l.ctx.clearRect(x, y, 1, 1);
            });
        } else {
            //offScreenCTX.fillRect(x, y, 1, 1);
            layers[layer].ctx.fillRect(x, y, 1, 1);
        }
    }
}

function actionLine(sx, sy, tx, ty, currentSize, currentColor, erase, layer) {

    //ctx.fillStyle = currentColor.color;
    //let drawPixel = (x, y, w, h) => { return currentMode === "erase" ? ctx.clearRect(x, y, w, h) : ctx.fillRect(x, y, w, h) };
    //create triangle object
    let tri = {}
    function getTriangle(x1, y1, x2, y2, ang) {
        if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
            tri.x = Math.sign(Math.cos(ang));
            tri.y = Math.tan(ang) * Math.sign(Math.cos(ang));
            tri.long = Math.abs(x1 - x2);
        } else {
            tri.x = Math.tan((Math.PI / 2) - ang) * Math.sign(Math.cos((Math.PI / 2) - ang));
            tri.y = Math.sign(Math.cos((Math.PI / 2) - ang));
            tri.long = Math.abs(y1 - y2);
        }
    }
    // finds the angle of (x,y) on a plane from the origin
    function getAngle(x, y) { return Math.atan(y / (x == 0 ? 0.01 : x)) + (x < 0 ? Math.PI : 0); }
    let angle = getAngle(tx - sx, ty - sy); // angle of line
    getTriangle(sx, sy, tx, ty, angle);

    for (let i = 0; i < tri.long; i++) {
        let thispoint = { x: Math.round(sx + tri.x * i), y: Math.round(sy + tri.y * i) };
        // for each point along the line
        //drawPixel(thispoint.x * scale, // round for perfect pixels
        //    thispoint.y * scale, // thus no aliasing
        //    scale, scale); // fill in one pixel, 1x1
        drawCircle(thispoint.x, thispoint.y, currentSize, currentColor, erase, layer);
    }
    //fill endpoint
    //drawPixel(Math.round(tx) * scale, // round for perfect pixels
    //    Math.round(ty) * scale, // thus no aliasing
    //    scale, scale); // fill in one pixel, 1x1
    drawCircle(Math.round(tx), Math.round(ty), currentSize, currentColor, erase, layer);
}

/*
//helper for replace and fill to get color on canvas **NOT IN USE**
function getColor(startX, startY, colorLayer) {
    let canvasColor = {};
 
    let startPos = (startY * offScreenCVS.width + startX) * 4;
    //clicked color
    canvasColor.r = colorLayer.data[startPos];
    canvasColor.g = colorLayer.data[startPos + 1];
    canvasColor.b = colorLayer.data[startPos + 2];
    canvasColor.a = colorLayer.data[startPos + 3];
    canvasColor.color = `rgba(${canvasColor.r},${canvasColor.g},${canvasColor.b},${canvasColor.a})`
    return canvasColor;
}
*/

/*
//For undo ability, store starting coords, and pass them into actionFill
function actionFill(startX, startY, currentColor) {
    //get imageData
    let colorLayer = offScreenCTX.getImageData(0, 0, offScreenCVS.width, offScreenCVS.height);
 
    let startPos = (startY * offScreenCVS.width + startX) * 4;
 
    //clicked color
    let startR = colorLayer.data[startPos];
    let startG = colorLayer.data[startPos + 1];
    let startB = colorLayer.data[startPos + 2];
    let startA = colorLayer.data[startPos + 3];
 
    //if (currentMode === "erase") currentColor = { color: "rgba(0, 0, 0, 0)", r: 0, g: 0, b: 0, a: 0 };
 
    //exit if color is the same
    if (currentColor.r === startR && currentColor.g === startG && currentColor.b === startB && currentColor.a === startA) {
        return;
    }
    //Start with click coords
    let pixelStack = [[startX, startY]];
    let newPos, x, y, pixelPos, reachLeft, reachRight;
    floodFill();
    function floodFill() {
        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];
 
        //get current pixel position
        pixelPos = (y * offScreenCVS.width + x) * 4;
        // Go up as long as the color matches and are inside the canvas
        while (y >= 0 && matchStartColor(pixelPos)) {
            y--;
            pixelPos -= offScreenCVS.width * 4;
        }
        //Don't overextend
        pixelPos += offScreenCVS.width * 4;
        y++;
        reachLeft = false;
        reachRight = false;
        // Go down as long as the color matches and in inside the canvas
        while (y < offScreenCVS.height && matchStartColor(pixelPos)) {
 
            colorPixel(pixelPos);
 
            if (x > 0) {
                if (matchStartColor(pixelPos - 4)) {
                    if (!reachLeft) {
                        //Add pixel to stack
                        pixelStack.push([x - 1, y]);
                        reachLeft = true;
                    }
                } else if (reachLeft) {
                    reachLeft = false;
                }
            }
 
            if (x < offScreenCVS.width - 1) {
                if (matchStartColor(pixelPos + 4)) {
                    if (!reachRight) {
                        //Add pixel to stack
                        pixelStack.push([x + 1, y]);
                        reachRight = true;
                    }
                } else if (reachRight) {
                    reachRight = false;
                }
            }
            y++;
            pixelPos += offScreenCVS.width * 4;
        }
 
        // offScreenCTX.putImageData(colorLayer, 0, 0);
        // source = offScreenCVS.toDataURL();
        // renderImage();
 
        if (pixelStack.length) {
            floodFill();
            // window.setTimeout(floodFill, 100);
        }
    }
 
    //render floodFill result
    offScreenCTX.putImageData(colorLayer, 0, 0);
 
    //helpers
    function matchStartColor(pixelPos) {
        let r = colorLayer.data[pixelPos];
        let g = colorLayer.data[pixelPos + 1];
        let b = colorLayer.data[pixelPos + 2];
        let a = colorLayer.data[pixelPos + 3];
        return (r === startR && g === startG && b === startB && a === startA);
    }
 
    function colorPixel(pixelPos) {
        colorLayer.data[pixelPos] = currentColor.r;
        colorLayer.data[pixelPos + 1] = currentColor.g;
        colorLayer.data[pixelPos + 2] = currentColor.b;
        //not ideal
        colorLayer.data[pixelPos + 3] = currentColor.a;
    }
}
*/

//Helper functions

function actionUndoRedo(pushStack, popStack) {
    pushStack.push(popStack.pop());
    //offScreenCTX.clearRect(0, 0, offScreenCVS.width, offScreenCVS.height);
    layers.forEach(l => {
        l.ctx.clearRect(0, 0, offScreenCVS.width, offScreenCVS.height);
    });
    redrawPoints();
    //source = offScreenCVS.toDataURL();
    renderImage();
}

function redrawPoints() {
    //follows stored instructions to reassemble drawing. Costly, but only called upon undo/redo
    undoStack.forEach(action => {
        action.forEach(p => {
            switch (p.tool) {
                //case "fill":
                //    actionFill(p.x, p.y, p.color);
                //    break;
                case "line":
                    actionLine(p.startX, p.startY, p.endX, p.endY, p.size, p.color, p.erase, p.layer)
                default:
                    actionDraw(p.x, p.y, p.size, p.color, p.erase, p.layer);
            }

        });
    });
}

//Once the image is loaded, draw the image onto the onscreen canvas.
function renderImage() {
    img.src = source;
    img.onload = () => {
        onScreenCTX.clearRect(0, 0, ocWidth, ocHeight);
        drawCanvas();
    }
}

function drawCanvas() {
    //Prevent blurring
    onScreenCTX.imageSmoothingEnabled = false;
    //onScreenCTX.drawImage(img, 0, 0, ocWidth, ocHeight)
    layers.forEach(l => {
        onScreenCTX.save();
        //onScreenCTX.drawImage(l.cvs, xOffset + (l.x * offScreenCVS.width) / offScreenCVS.width, yOffset + (l.y * offScreenCVS.width) / offScreenCVS.width, offScreenCVS.width, offScreenCVS.height);
        onScreenCTX.drawImage(l.cvs, 0, 0, ocWidth, ocHeight);
        //l.clearRect(0, 0, offScreenCVS.width, offScreenCVS.height);
        onScreenCTX.restore();
    });
}

//Get the size of the parentNode which is subject to flexbox. Fit the square by making sure the dimensions are based on the smaller of the width and height.
// function setSize() {
//     rect = onScreenCVS.parentNode.getBoundingClientRect();
//     rect.height > rect.width ? baseDimension = rect.width : baseDimension = rect.height;
// }

