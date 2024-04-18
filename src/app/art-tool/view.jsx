// Alvin
import "../globals.css"
import "./tempStyles.css"
import { getCords } from "@/utilities";

function ArtTool() {
    return(
        <div className="parent" onMouseUp={checkResetEvent}>
            <div className="topbar">
                <h1>Left-Click to draw | Right-Click to erase | Middle-Click for single pixel</h1>
                <button onClick={debugEvent} type="button">click for debug info</button>
                <button onClick={clearCanvasEvent} type="button">click to clear canvas</button>
                <button onClick={saveEvent} type="button">click to download canvas</button>
            </div>
            <div className="content">
                <p>Drawing Canvas</p>
                <canvas className="canvas" id="drawing-area" width="64" height="32" onContextMenu={mouseClickEvent}
                onMouseDown={mouseClickEvent} onMouseMove={mouseDragEvent} onTouchStart={touchDrawEvent} onTouchMove={touchDragEvent} onMouseLeave={resetLastCoords}>
                    <script>{clearCanvasEvent()}</script>
                </canvas>
            </div>

        </div>
    );
}
export default ArtTool;

//global variables
let mouseCheck = false;
let lastXY;
function debugEvent() {
    //! log outputs for checking canvas size
    const element = document.getElementById("drawing-area");
    let foo = element.getBoundingClientRect();
    let style = getComputedStyle(element);
    let multH = foo.height/element.height;
    let multW = foo.width/element.width;
    console.log("\n[ DEBUG INFO ]\n");
    console.log("canvas scaling = " + style.scale);
    console.log("size difference (mult):\nwidth = " + multW + "x\nheight = " + multH + "x");
    console.log("canvas size:\nwidth = " + foo.width + "\nheight = " + foo.height);
    console.log("canvas edges:\nlft = " + foo.left + "\nrgt = " + foo.right + "\ntop = " + foo.top + "\nbot = " + foo.bottom);
    console.log("border = " + style.border + "\n(needs offset of " + style.border.split(" ")[0] + ")");
    console.log("padding = " + style.padding + "\n(needs offset of " + style.padding.split(" ")[0] + ")");
}

function clearCanvasEvent() {
    try {
        const element = document.getElementById("drawing-area");
        let extra = element.getContext("2d");
        extra.save();
        extra.fillStyle = "white";
        extra.fillRect(0,0, element.width, element.height);        
        extra.restore();
    } catch (error) {
        console.error(error);
    }
}
function checkResetEvent() {
    //* flags check as false, used for mouseDragEvent
    mouseCheck = false;
}
function saveEvent() {
    let element = document.getElementById("drawing-area");
    let temp = document.createElement('a');
    const img = element.toDataURL("image/png").replace("image/png", "image/octet-stream");
    temp.setAttribute("href", img);
    temp.setAttribute("download", "canvas.png");
    temp.click();   
    temp.remove();
}

function resetLastCoords(){
    lastXY = [-1, -1];
}
function mouseClickEvent(event) {
    event.preventDefault();
    mouseCheck = true //for mouseDragEvent()
    const element = document.getElementById(event.target.id);
    //* translate event coordiantes to the canvas 
    const cords = getCords(element, event.clientX, event.clientY);

    //* draw pixel
    let extra = element.getContext("2d");
    extra.save();
    if (event.button === 2) {
        extra.fillStyle = "white";
    }
    extra.fillRect(cords[0], cords[1], 1, 1); //draw pixel at translated coordinates
    lastXY = cords; //used for fallback in mouseDragEvent()
    extra.restore();
    }
function mouseDragEvent(event) {
    if ((event.buttons === 2 || event.buttons === 1) && mouseCheck) {
        const element = document.getElementById(event.target.id);
        let extra = element.getContext("2d");
        const cords = getCords(element, event.clientX, event.clientY);

        extra.save();
        // set draw color to white for erase if right click
        if (event.buttons === 2) {
            extra.fillStyle = "white";
        }
        if (lastXY[0] < 0 || lastXY[1] < 0) {
            lastXY = cords;
        }
        draw_line(lastXY[0], lastXY[1], cords[0], cords[1], extra);
        extra.restore();

        lastXY = cords;
    }
}
function touchDrawEvent(event){
    const element = document.getElementById(event.target.id);
    const cords = getCords(element, event.targetTouches[0]?.clientX || event.clientX, event.targetTouches[0]?.clientY || event.clientY)
    element.getContext("2d").fillRect(cords[0], cords[1], 1, 1)
    lastXY = cords;
}
function touchDragEvent(event) {
    const element = document.getElementById(event.target.id);
    let extra = element.getContext("2d");
    try {
        const cords = getCords(element, 
            event.targetTouches[0]?.clientX || event.Touch[0]?.clientX || event.clientX, 
            event.targetTouches[0]?.clientY || event.Touch[0]?.clientY || event.clientY);            
            draw_line(lastXY[0], lastXY[1], cords[0], cords[1], extra);
            lastXY = cords;
    } catch (error) {
        return;
    }
}
// draw_line taken and adapted from https://ghost-together.medium.com/how-to-code-your-first-algorithm-draw-a-line-ca121f9a1395
function draw_line(x1, y1, x2, y2, con) {
    // Iterators, counters required by algorithm
    let x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;
    // Calculate line deltas
    dx = x2 - x1;
    dy = y2 - y1;
    // Create a positive copy of deltas (makes iterating easier)
    dx1 = Math.abs(dx);
    dy1 = Math.abs(dy);
    // Calculate error intervals for both axis
    px = 2 * dy1 - dx1;
    py = 2 * dx1 - dy1;
    
    if (dy1 <= dx1) { //* The line is X-axis dominant
        // Line is drawn left to right
        if (dx >= 0) {
            x = x1; y = y1; xe = x2;
        } else { // Line is drawn right to left (swap ends)
            x = x2; y = y2; xe = x1;
        }
        con.fillRect(x, y, 1, 1); // draws pixel at translated coordinates
        // Rasterize the line
        for (i = 0; x < xe; i++) {
            x = x + 1;
            // Deal with octants...
            if (px < 0) {
                px += 2 * dy1;
            } else {
                if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                    y++;
                } else {
                    y--;
                }
                px += 2 * (dy1 - dx1);
            }
            // Draw pixel from line span at
            // currently rasterized position
            con.fillRect(x, y, 1, 1);
        }
    } else { //* The line is Y-axis dominant
        // Line is drawn bottom to top
        if (dy >= 0) {
            x = x1; y = y1; ye = y2;
        } else { // Line is drawn top to bottom
            x = x2; y = y2; ye = y1;
        }
        con.fillRect(x, y, 1, 1); // draws pixel at translated coordinates
        // Rasterize the line
        for (i = 0; y < ye; i++) {
            y += 1;
            // Deal with octants...
            if (py <= 0) {
                py += 2 * dx1;
            } else {
                if ((dx < 0 && dy<0) || (dx > 0 && dy > 0)) {
                    x++;
                } else {
                    x--;
                }
                py += 2 * (dx1 - dy1);
            }
            // Draw pixel from line span at
            // currently rasterized position
            con.fillRect(x, y, 1, 1); // draws pixel at translated coordinates
        }
    }
 }