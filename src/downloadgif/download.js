const { remote, ipcRenderer } = require('electron');
const BrowserWindow = remote.BrowserWindow;

// TODO: display preview as settings are changed
// TODO: display progress bar as gif is downloaded
// TODO: disable download button if gifWindow is not ready
// TODO: Error if the button is pressed twice



/*======================*\
    #Settings Events
\*======================*/

let siteUrlElem = document.querySelector(".site-url");
let durationElem = document.querySelector(".duration");
let repeatDelayElem = document.querySelector(".repeat-delay");
let easingElem = document.querySelector(".easing");
let backgroundColorInput = document.querySelector('.background-color');


siteUrlElem.addEventListener("input", function (event) {
    updateSettings({ 'siteUrl': siteUrlElem.value });
    // TODO: reload the preview
});

durationElem.addEventListener("input", function (event) {
    updateSettings({ duration: +event.target.value });
});

repeatDelayElem.addEventListener("input", function (event) {
    updateSettings({ repeatDelay: +event.target.value });
});

easingElem.addEventListener("input", function (event) {
    updateSettings({ easing: event.target.value });
});

backgroundColorInput.addEventListener("input", function (event) {
    updateSettings({ backgroundColor: event.target.value });
});



function updateSettings(newSettings) {
    ipcRenderer.send('update-settings', newSettings)
}

ipcRenderer.on('settings-changed', function (event, settings) {
    console.log("Settings Changed..download.js");
    siteUrlElem.value = settings.siteUrl;
    durationElem.value = settings.duration;
    repeatDelayElem.value = settings.repeatDelay;
    easingElem.value = settings.easing;
    backgroundColorInput.value = settings.backgroundColor;
});





/*======================*\
    #Window Events
\*======================*/

let createBtn = document.querySelector('.create');
createBtn.addEventListener('click', function () {
    // TODO: request the animation
    ipcRenderer.send('create-gif');
});