const { remote, ipcRenderer } = require('electron');
const BrowserWindow = remote.BrowserWindow;
let curWindow = remote.getCurrentWindow();

// TODO: disable button while downloading
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


let timeout = null;
function updateSettings(newSettings) {
    // Wait for user to finish typing
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        ipcRenderer.send('update-settings', newSettings);
    }, 400);
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

let isDownloading = false;

let createBtn = document.querySelector('.js-create-btn');
createBtn.addEventListener('click', function () {
    if (!isDownloading) {
        // Request the gif be created
        ipcRenderer.send('create-gif');

        // pause the animation
        tween.pause(0);

        // Adjust display on Download button
        isDownloading = true;
        createBtn.disabled = true;
        createBtn.innerHTML = "Processing (0%)";
        createBtn.classList.add("btn--create--downloading");
    }
});




/*======================*\
    #ProgressBar
\*======================*/

ipcRenderer.on('image-captured', function (event, args) {
    if (isDownloading) {
        // if download finished
        if (args.progress >= 1) {
            // Resume playing the animation
            tween.play(0);

            // Reset button display
            isDownloading = false;
            createBtn.disabled = false;
            createBtn.innerHTML = "Create Gif";
            createBtn.classList.remove("btn--create--downloading");
        }
        else {
            createBtn.innerHTML = `Processing (${(args.progress * 100).toFixed(0)}%)`;
        }

    }

    // args = {imgCount, progress}
    let progressBar = document.querySelector(".progress");
    progressBar.style.setProperty('--progress', args.progress);
});