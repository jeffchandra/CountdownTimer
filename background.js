let timer = {hours: 0, minutes: 0, seconds: 0, intervalId: null, state: "stopped"};

function endTimer() {
    timer.hours = 0;
    timer.minutes = 0;
    timer.seconds = 0;
    clearInterval(timer.intervalId);
    timer.intervalId = null;
    timer.state = "stopped";
    chrome.runtime.sendMessage({command: "timerFinished"});
}

function updateTimer() {
    if (timer.state === "running") {
        console.log(timer.seconds);
        if (timer.seconds == 1 && timer.minutes == 0 && timer.hours == 0) {
            endTimer();
            return;
        } else if (timer.seconds > 0) {
            timer.seconds--;
        } else if (timer.minutes > 0) {
            timer.minutes--;
            timer.seconds = 59;
        } else if (timer.hours > 0) {
            timer.hours--;
            timer.minutes = 59;
            timer.seconds = 59;
        } else {
            endTimer();
            chrome.notifications.create("", {title: "Countdown Timer", message: "Time is up!", type: "basic", iconUrl: "icon.png"});
            return;
        }
        chrome.runtime.sendMessage({command: "updateTimer", timer: timer});
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "startTimer" && (timer.state === "stopped" || timer.state === "paused")) {
        timer.hours = request.hours ?? timer.hours;
        timer.minutes = request.minutes ?? timer.minutes;
        timer.seconds = request.seconds ?? timer.seconds;
        timer.state = "running";
        if (timer.intervalId === null) {
            timer.intervalId = setInterval(updateTimer, 1000);
        }
    } else if (request.command === "pauseTimer" && timer.state === "running") {
        timer.state = "paused";
        clearInterval(timer.intervalId);
        timer.intervalId = null;
    } else if (request.command === "resetTimer") {
        endTimer();
    }
    sendResponse({timer: timer});
    return true;
});
