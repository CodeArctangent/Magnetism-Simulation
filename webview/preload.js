const config = require('../config.json');
const { Vector, Euler, Color } = require('arctan.meridian');
const { Paper } = require('arctan.paper');
const util = require('arctan.autle');

let body;
let cv;

class Charge {
    constructor(x, y, power) {
        this.x = x;
        this.y = y;
        this.v = power;
        return this;
    }

    get value() {
        return this.v;
    }

    get color() {
        let filler = Math.abs(255 - Math.abs(this.v * 5));
        if (this.v > 0) return `rgba(255, ${filler}, ${filler}, 255)`;
        else return `rgba(${filler}, ${filler}, 255, 255)`;
    }
}

function calculateGrid(gridx, gridy, charges, width, height, res) {
    for (let i = 0; i < width / res; ++i) {
        for (let j = 0; j < height / res; ++j) {
            let x = res / 2 + i * res;
            let y = res / 2 + j * res;
            let EEx = 0;
            let EEy = 0;
            for (let c = 0; c < charges.length; ++c) {
                let chg = charges[c];
                let dx = x - chg.x;
                let dy = y - chg.y;
                let d1 = Math.sqrt(dx * dx + dy * dy);
                let E1 = chg.value / (d1 * d1);
                EEx += dx * E1 / d1;
                EEy += dy * E1 / d1;
            }
            let EE = Math.sqrt(EEx * EEx + EEy * EEy);
            let deltax = 15 * EEx / EE;
            let deltay = 15 * EEy / EE;
            gridx[i][j] = deltax;
            gridy[i][j] = deltay;
        }
    }
    return [gridx, gridy];
}

window.addEventListener('DOMContentLoaded', () => {
    body = document.querySelector('body');
    document.querySelector('title').innerText = config.window.title;
    cv = new Paper('.canvas', config.simulation.width, config.simulation.height);
    cv.yUp = true;
    document.addEventListener('contextmenu', () => {
        cv.canvas.toBlob((blob) => {
            navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
            ]);
        }, "image/png");
    }); 
    const charges = [
        new Charge(0, 0, -10),
        new Charge(cv.width, cv.height, 10),
        new Charge(cv.width, 0, -5),
        new Charge(0, cv.height, 5)
    ]
    const res = 8;
    let gridX = new Array(cv.width / res);
    let gridY = new Array(cv.width / res);
    for (let i = 0; i < (cv.width / res); ++i) {
        gridX[i] = new Array(cv.width / res);
        gridY[i] = new Array(cv.width / res);
    }
    cv.beginRenderLoop((time, dt, mouse) => {
        cv.fillStyle = 'black';
        charges[0].x = mouse[0];
        charges[0].y = mouse[1];
        charges[1].x = -mouse[0] + cv.width;
        charges[1].y = -mouse[1] + cv.height;
        charges[2].x = mouse[0];
        charges[2].y = -mouse[1] + cv.height;
        charges[3].x = -mouse[0] + cv.width;
        charges[3].y = mouse[1];
        let final = calculateGrid(gridX, gridY, charges, cv.width, cv.height, res);
        gridX = final[0];
        gridY = final[1];
        cv.cover();  
        // Draw Grid
        // cv.style = 'rgb(50, 50, 50)';
        // for (let x = 0; x < (cv.width / res); ++x) {
        //     cv.line(0, res + (res * x), cv.width, res + (res * x));
        //     cv.line(res + (res * x), 0, res + (res * x), cv.width);
        // }
        // Draw Magnetic Paths
        // for (let m = 0; m < 5000; ++m) {
        //     let x = util.randomRange(0, cv.width);
        //     let xf = Math.floor(x / res);
        //     let y = util.randomRange(0, cv.height);
        //     let yf = Math.floor(y / res);
        //     // cv.strokeStyle = `rgb(${cv.width/res/x*255}, ${cv.height/res/y*255}, ${cv.width/res/(-x+cv.width)*255})`;
        //     // let dist = chgDist(x, y);
        //     let gridx = gridX[xf][yf];
        //     let gridy = gridY[xf][yf];
        //     cv.strokeStyle = `rgb(${gridx*20}, ${gridy*20}, ${Math.hypot(gridx, gridy)*10})`;
        //     // cv.strokeStyle = 'white';
        //     cv.line(x, y, x + gridx / 2, y + gridy / 2);
        // }
        for (let y = 0; y < cv.height / res; ++y) {
            for (let x = 0; x < cv.width / res; ++x) {
                // cv.strokeStyle = `rgb(${cv.width/res/x*255}, ${cv.height/res/y*255}, ${cv.width/res/(-x+cv.width)*255})`;
                // let dist = chgDist(x, y);
                // cv.strokeStyle = 'white';
                let nx = x * res;
                let ny = y * res;
                let gridx = gridX[x][y];
                let gridy = gridY[x][y];
                // cv.style = `rgb(${gridx*20}, ${gridy*20}, ${(255-gridx*20-gridy*20)})`;
                // cv.style = `rgb(${(gridx+gridy)*20*(Math.sin(time/500)+1)}, ${gridy*20*(Math.cos(time/500)+1)}, ${(255-gridx*20-gridy*20)*(Math.tan(time/500)+1)})`;
                cv.style = `rgb(${(gridx+gridy)*20}, ${gridy*20}, ${(255-gridx*20-gridy*20)})`;
                cv.fillRect(nx, ny, res, res);
                cv.line(nx - (gridx / 2), ny - (gridy / 2), nx + gridx, ny + gridy);
            }
        }
        // Draw Charges
        for (let c = 0; c < charges.length; ++c) {
            let chg = charges[c];
            cv.fillStyle = chg.color;
            cv.fillCirc(chg.x, chg.y, 10);
        }
    });
});