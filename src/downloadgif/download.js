const { remote, ipcRenderer } = require('electron');
const BrowserWindow = remote.BrowserWindow;
let curWindow = remote.getCurrentWindow();

let tween;
console.log("download.js");

//TODO: 'settings-changed' event should only be called once at the when project starts
//TODO: add 'show more' buttom for advanced settings
//TODO: tween is set in 2 windows



/*======================*\
    #Settings Events
\*======================*/

let siteUrlElem = document.querySelector(".js-site-url");
let durationElem = document.querySelector(".js-duration");
let repeatDelayElem = document.querySelector(".js-repeat-delay");
let easingElem = document.querySelector(".js-easing");
let backgroundColorInput = document.querySelector('.js-background-color');

let startWidthInput = document.querySelector('.js-start-width');
let endWidthInput = document.querySelector('.js-end-width');
let containerWidthInput = document.querySelector('.js-container-width');
let containerHeightInput = document.querySelector('.js-container-height');



let settingsInputs = document.querySelectorAll('.js-setting-input');
for (input of settingsInputs) {
    input.addEventListener("input", function (event) {
        updateSettings({ [event.target.name]: event.target.value });
    });
}

let timeout = null;
function updateSettings(newSettings) {
    // Wait for user to finish typing
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        ipcRenderer.send('update-settings', newSettings);
    }, 400);
}

ipcRenderer.on('settings-changed', function (event, newSettings) {
    // Update input with new settings values
    //      NOTE: I'm not sure that I need this... [DC]
    siteUrlElem.value = newSettings.siteUrl;
    durationElem.value = newSettings.duration;
    repeatDelayElem.value = newSettings.repeatDelay;
    easingElem.value = newSettings.easing;
    backgroundColorInput.value = newSettings.backgroundColor;

    // Advanced Settings
    startWidthInput.value = newSettings.animationStartWidth;
    endWidthInput.value = newSettings.animationEndWidth;
    containerWidthInput.value = newSettings.canvasWidth;
    containerHeightInput.value = newSettings.canvasHeight;



    // SetUp preview
    let previewContainer = document.querySelector(".preview__container");
    let previewFrame = document.querySelector(".preview__frame");
    previewContainer.style.setProperty("width", +newSettings.canvasWidth + "px");
    previewContainer.style.setProperty("height", +newSettings.canvasHeight + "px");
    previewContainer.style.setProperty("background-color", newSettings.backgroundColor);
    previewFrame.src = newSettings.siteUrl;
    previewFrame.onload = function () {
        // Set scrolTop
        previewFrame.contentWindow.scrollTo(0, +newSettings.scrollTop);
    };

    // TODO: this tween is repeated in here and gifWindow. It should be a ...computed setting? [DC]
    // Update Animation
    tween = TweenMax.fromTo(previewFrame, newSettings.duration / 1000, {
        width: newSettings.animationStartWidth * newSettings.animationScale
    },
        {
            width: newSettings.animationEndWidth * newSettings.animationScale,
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
let cancelBtn = document.querySelector('.js-cancel-btn');

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

        // Display Cancel button
        cancelBtn.style.setProperty("visibility", "visible");
    }
});

cancelBtn.addEventListener('click', function () {
    // Request the gif be created
    ipcRenderer.send('cancel-gif');
    endDownload();
});




/*======================*\
    #ProgressBar
\*======================*/

ipcRenderer.on('image-captured', function (event, args) {
    if (isDownloading) {
        // if download finished
        if (args.progress >= 1) {
            endDownload();
        }
        else {
            // Update Progress bar
            let progressBar = document.querySelector(".progress");
            progressBar.style.setProperty('--progress', args.progress);

            // Update createBtn label
            createBtn.innerHTML = `Processing (${(args.progress * 100).toFixed(0)}%)`;
        }

    }
});




function endDownload() {
    // Resume playing the animation
    tween.play(0);

    // Reset button display
    isDownloading = false;
    createBtn.disabled = false;
    createBtn.innerHTML = "Create Gif";
    createBtn.classList.remove("btn--create--downloading");

    // Hide Cancel button
    cancelBtn.style.setProperty("visibility", "hidden");

    // Set Progress bar to 0
    let progressBar = document.querySelector(".progress");
    progressBar.style.setProperty('--progress', 0);
}