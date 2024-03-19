let isRunning = false;

const startPauseButton = document.getElementById("startPauseButton");
const resetButton = document.getElementById("resetButton");
const showHideButton = document.getElementById("showHideButton");
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const title = document.getElementById('title');
let floatingTimerPosition = {top: `50px`, left: `1300px`};

startPauseButton.addEventListener("click", function() {
    if (startPauseButton.textContent === "Start") {
        title.textContent = "Running";
        startPauseButton.textContent = "Pause";

        var hours = parseInt(hoursInput.value) || 0;
        var minutes = parseInt(minutesInput.value) || 0;
        var seconds = parseInt(secondsInput.value) || 0;

        hours = hours < 100? hours: 99;
        minutes = minutes < 60? minutes: 59;
        seconds = seconds < 60? seconds: 59;

        if (hours + minutes + seconds == 0) {
            return;
        }
        if (seconds > 0) {
            seconds--;
        } else {
            seconds = 59;
            if (minutes > 0) {
                minutes--;
            } else {
                minutes = 59;
                hours--;
            }
        }
        hoursInput.value = hours;
        minutesInput.value = minutes;
        secondsInput.value = seconds;

        isRunning = true;
        hoursInput.disabled = true;
        minutesInput.disabled = true;
        secondsInput.disabled = true;

        chrome.runtime.sendMessage({command: "startTimer", hours: hours, minutes: minutes, seconds: seconds});

    } else {
        title.textContent = "Paused";
        startPauseButton.textContent = "Start";

        isRunning = false;
        hoursInput.disabled = false;
        minutesInput.disabled = false;
        secondsInput.disabled = false;   

        chrome.runtime.sendMessage({command: "pauseTimer"});
    }
});

resetButton.addEventListener("click", function() {
    if (hours + minutes + seconds != 0) {
        title.textContent = "Stopped";
        startPauseButton.textContent = "Start";
        
        hoursInput.value = "";
        minutesInput.value = "";
        secondsInput.value = "";

        isRunning = false;
        hoursInput.disabled = false;
        minutesInput.disabled = false;
        secondsInput.disabled = false;

        chrome.runtime.sendMessage({command: "resetTimer"});
    }
});

showHideButton.addEventListener("click", function() {
    if (showHideButton.textContent == "Show") {
        showHideButton.textContent = "Hide";
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: "showFloatingTimer", position: floatingTimerPosition});
        });
    } else {
        showHideButton.textContent = "Show";
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: "hideFloatingTimer"});
        });
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.command === "resetAll") {
        hoursInput.value = message.timer.hours;
        minutesInput.value = message.timer.minutes;
        secondsInput.value = message.timer.seconds;
        
        if (message.timer.state == "stopped") {
            title.textContent = "Stopped";
            startPauseButton.textContent = "Start";
            isRunning = false;
            hoursInput.disabled = false;
            minutesInput.disabled = false;
            secondsInput.disabled = false;

        } else if (message.timer.state == "running") {
            title.textContent = "Running";
            startPauseButton.textContent = "Pause";
            isRunning = true;
            hoursInput.disabled = true;
            minutesInput.disabled = true;
            secondsInput.disabled = true;

        } else {
            title.textContent = "Paused";
            startPauseButton.textContent = "Start";
            isRunning = false;
            hoursInput.disabled = false;
            minutesInput.disabled = false;
            secondsInput.disabled = false;
        }

        if (message.floatingTimer.state == "hidden") showHideButton.textContent = "Show";
        else if (message.floatingTimer.state == "shown") showHideButton.textContent = "Hide";
        floatingTimerPosition = message.floatingTimer.position;

    } else if (message.command === "updateTimer") {
        startPauseButton.textContent = "Pause";

        hoursInput.value = message.timer.hours;
        minutesInput.value = message.timer.minutes;
        secondsInput.value = message.timer.seconds;

        isRunning = true;
        hoursInput.disabled = true;
        minutesInput.disabled = true;
        secondsInput.disabled = true;

        if (message.floatingTimer.state == "hidden") showHideButton.textContent = "Show";
        else if (message.floatingTimer.state == "shown") showHideButton.textContent = "Hide";
        floatingTimerPosition = message.floatingTimer.position;

    } else if (message.command === "timerFinished") {
        startPauseButton.textContent = "Start";

        hoursInput.value = "";
        minutesInput.value = "";
        secondsInput.value = "";

        isRunning = false;
        hoursInput.disabled = false;
        minutesInput.disabled = false;
        secondsInput.disabled = false;

    } else if (message.command === "updateFloat") {
        if (message.floatingTimer.state == "hidden") showHideButton.textContent = "Show";
        else if (message.floatingTimer.state == "shown") showHideButton.textContent = "Hide";
        floatingTimerPosition = message.floatingTimer.position;

    }
});

document.addEventListener('DOMContentLoaded', function () {
    var body = document.querySelector('body');
    body.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    chrome.runtime.sendMessage({command: "popupOpened"});
});
