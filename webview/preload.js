const config = require('../config.json');
const { Vector, Euler, Color } = require('arctan.meridian');
const { Paper } = require('arctan.paper');
const util = require('arctan.autle');

let body;
let canvas;
let ctx;
let cv;

const roundfac = (n) => Math.round(n) == 1 ? 1 : -1;

function titlebar() {
    const div = document.createElement('div');
    div.classList.add('tb');
    const title = document.createElement('span');
    title.classList.add('tb-title');
    title.innerText = document.querySelector('title').innerText;
    const close = document.createElement('button');
    close.classList.add('tb-close', 'tb-button');
    close.innerText = '✕';
    div.append(title);
    div.append(close);
    return div;
}

function makeButtonsUsable() {
    document.querySelector('.tb-close').addEventListener('click', () => {
        window.close();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    body = document.querySelector('body');
    body.insertBefore(titlebar(), body.firstChild);
    makeButtonsUsable();
    cv = new Paper('.canvas', config.simulation.width, config.simulation.height);
    cv.yUp = true;
    document.addEventListener('contextmenu', () => {
        cv.canvas.toBlob((blob) => {
            navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
            ]);
        }, "image/png");
    });      
    cv.beginRenderLoop((time, dt, mouse) => {
        cv.fillStyle = 'black';
        cv.cover();  
        cv.strokeStyle = 'red';
        cv.strokeCirc(...cv.center, 200);
        let coordsOg = [cv.center[0] + Math.sin(dt) * 200, cv.center[1] + Math.cos(dt) * 200];
        let coordsOr = [util.lerp(cv.center[0] + Math.sin(dt) * 200, mouse[0], 0.5), 
                        util.lerp(cv.center[1] + Math.cos(dt) * 200, mouse[1], 0.5)];
        cv.strokeStyle = 'green';
        cv.strokeCirc(...coordsOg, 10);
        cv.line(...coordsOg, ...coordsOr);
        cv.style = 'white';
        cv.line(...coordsOr, ...mouse);
        cv.fillCirc(...coordsOr, 10);
        cv.fillText(`${mouse[0]} X`, 10, 10 + 16);
        cv.fillText(`${mouse[1]} Y`, 10, 10);
        cv.fillCirc(...mouse, 10);
    });
});