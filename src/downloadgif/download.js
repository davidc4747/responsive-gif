const { remote, ipcRenderer } = require('electron');
const BrowserWindow = remote.BrowserWindow;

// TODO: disable download button if gifWindow is not ready

let tween;



/*======================*\
    #Settings Events
\*======================*/

let siteUrlElem = document.querySelector(".site-url");
let durationElem = document.querySelector(".duration");
let repeatDelayElem = document.querySelector(".repeat-delay");
let easingElem = document.querySelector(".easing");
let backgroundColorInput = document.querySelector('.background-color');


siteUrlElem.addEventListener("input", function (event) {
    updateSettings({ siteUrl: siteUrlElem.value });
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
    ipcRenderer.send('update-settings', newSettings);
}

ipcRenderer.on('settings-changed', function (event, newSettings) {
    console.log("Settings Changed..download.js");
    siteUrlElem.value = newSettings.siteUrl;
    durationElem.value = newSettings.duration;
    repeatDelayElem.value = newSettings.repeatDelay;
    easingElem.value = newSettings.easing;
    backgroundColorInput.value = newSettings.backgroundColor;



    // SetUp preview
    let previewContainer = document.querySelector(".preview__container");
    let previewFrame = document.querySelector(".preview__frame");
    previewContainer.style.backgroundColor = newSettings.backgroundColor;
    previewFrame.src = newSettings.siteUrl;
    tween = TweenMax.fromTo(previewFrame, newSettings.duration / 1000, {
        width: 320
    },
        {
            width: 1600,
            yoyo: true,
            repeat: -1,
            repeatDelay: newSettings.repeatDelay / 1000,
            ease: EaseLookup.find(newSettings.easing),
            // paused: true
        });
});





/*======================*\
    #Window Events
\*======================*/

let createBtn = document.querySelector('.create');
createBtn.addEventListener('click', function () {
    // TODO: request the animation
    ipcRenderer.send('create-gif');
});




ipcRenderer.on('image-captured', function (event, args) {
    //{imgCount, progress}
    let progressBar = document.querySelector(".progress");
    progressBar.style.setProperty('--progress', args.progress);
});