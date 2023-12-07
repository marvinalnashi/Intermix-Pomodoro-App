/**
 * Object that contains timer properties
 * @type {{pomodoro: number, shortBreak: number, longBreak: number, longBreakInterval: number, sessions: number}}
 */
const timer = {
  pomodoro: 0.06,
  // pomodoro: 25,
  shortBreak: 0.04,
  longBreak: 2,
  longBreakInterval: 3,
  sessions: 0,
};

/**
 * Time interval for automatically switching between timer modes
 */
let interval;

/**
 * Counter for short breaks and long breaks
 * @type {number}
 */
let counter = 0;

/**
 * Container that holds all buttons
 */
const mainContainer = document.createElement("section");
mainContainer.className = "main-container";
document.getElementById("pomodoro-app").appendChild(mainContainer);

/**
 * Container that holds all notifications about breaks
 */
const notificationContainer = document.createElement("section");
notificationContainer.className = "notification-container";
document.getElementById("pomodoro-app").appendChild(notificationContainer);

/**
 * Dynamic text that counts amount of breaks have occurred
 */
const sessionCounter = document.createElement("p");
sessionCounter.className = "counter";
sessionCounter.textContent = "Break counter: " + counter;
mainContainer.appendChild(sessionCounter);

/**
 * Wrapper for main button
 */
const mainButtonWrapper = document.createElement("section");
mainButtonWrapper.className = "main-button-wrapper";
mainContainer.appendChild(mainButtonWrapper);

/**
 * Wrapper for secondary buttons
 */
const secondaryButtonWrapper = document.createElement("section");
secondaryButtonWrapper.className = "secondary-button-wrapper";
mainContainer.appendChild(secondaryButtonWrapper);

/**
 * Button that contains timer in pomodoro timer mode
 */
const mainButton = document.createElement("button");
// mainButton.id = "button--main";
mainButton.className = "button button--main";
mainButtonWrapper.appendChild(mainButton);

/**
 * Button for pausing/resuming timer in pomodoro timer mode and displaying timer in shortBreak and longBreak timer modes
 */
const secondaryButtonOne = document.createElement("button");
// secondaryButtonOne.id = "button--sec1";
secondaryButtonOne.className = "button button--sec1";
secondaryButtonOne.dataset.action = "start";
secondaryButtonOne.textContent = "Start";
secondaryButtonWrapper.appendChild(secondaryButtonOne);

/**
 * Button for executing full reload for current page
 */
const secondaryButtonTwo = document.createElement("button");
// secondaryButtonTwo.id = "button--sec2";
secondaryButtonTwo.className = "button button--sec2";
secondaryButtonTwo.textContent = "Restart";
secondaryButtonTwo.onclick = function () {
  window.location.href = window.location.href;
};
secondaryButtonWrapper.appendChild(secondaryButtonTwo);

/**
 * Button that adds 1min to the pomodoro timer mode timer when clicked while in shortBreak or longBreak timer modes
 */
const secondaryButtonThree = document.createElement("button");
// secondaryButtonThree.id = "button--sec3";
secondaryButtonThree.className = "button button--sec3";
secondaryButtonThree.textContent = "+ 1min";
secondaryButtonThree.onclick = function () {
  if (timer.mode !== "pomodoro") {
    timer.pomodoro++;
  }
};
secondaryButtonWrapper.appendChild(secondaryButtonThree);

/**
 * Button that adds 10min to the pomodoro timer mode timer when clicked while in shortBreak or longBreak timer modes
 */
const secondaryButtonFour = document.createElement("button");
// secondaryButtonFour.id = "button--sec4";
secondaryButtonFour.className = "button button--sec4";
secondaryButtonFour.textContent = "+ 10min";
secondaryButtonFour.onclick = function () {
  if (timer.mode !== "pomodoro") {
    timer.pomodoro += 10;
  }
};
secondaryButtonWrapper.appendChild(secondaryButtonFour);

/**
 * Dynamic text that displays the remaining break time when a break has been initiated
 */
const notificationText = document.createElement("p");
notificationText.className = "notification-text";
notificationContainer.appendChild(notificationText);

/**
 * @property {Function} Execute event listener for secondaryButtonOne for start/pausing/resuming timer
 * @returns void
 */
secondaryButtonOne.addEventListener("click", () => {
  const action = secondaryButtonOne.dataset.action;
  action === "start" ? startTimer() : stopTimer();
});

/**
 * @property {Function} Get current remaining amount of minutes and seconds for the timer in any timer mode
 * @param {*} endTime
 * @returns {{number, number, number}}
 */
function getRemainingTime(endTime) {
  const currentTime = Date.parse(new Date());
  const difference = endTime - currentTime;

  const total = Number.parseInt(difference / 1000, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  return {
    total,
    minutes,
    seconds,
  };
}

/**
 * @property {Function} Start timer, switch timer modes and count amount of breaks
 * @returns void
 */
function startTimer() {
  let total = timer.remainingTime.total;
  const endTime = Date.parse(new Date()) + total * 1000;
  const notificationSound = new Audio("./resources/notification.wav");

  if (timer.mode === "pomodoro") {
    secondaryButtonOne.disabled = false;
    timer.sessions++;
  } else {
    notificationSound.play();
    secondaryButtonOne.disabled = true;
    counter++;
    sessionCounter.textContent = "Break counter: " + counter;
  }

  secondaryButtonOne.dataset.action = "stop";
  secondaryButtonOne.textContent = "Pause";

  interval = setInterval(function () {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock();

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);

      switch (timer.mode) {
        case "pomodoro":
          timer.sessions % timer.longBreakInterval === 0
            ? switchMode("longBreak")
            : switchMode("shortBreak");
          break;
        default:
          switchMode("pomodoro");
      }

      if (timer.mode === "pomodoro") {
        secondaryButtonOne.disabled = false;
        secondaryButtonOne.dataset.action = "start";
      } else {
        secondaryButtonOne.disabled = false;
        startTimer();
      }
    }
  });
}

/**
 * @property {Function} Stop timer while in pomodoro timer mode
 * @returns void
 */
function stopTimer() {
  clearInterval(interval);
  secondaryButtonOne.dataset.action = "start";
  secondaryButtonOne.textContent = "Resume";
}

/**
 * @property {Function} Update current timer clock and display remaining amount of minutes and seconds in buttons depending on timer modes
 * and in the tab of the web application
 * @returns void
 */
function updateClock() {
  const remainingTime = timer.remainingTime;
  const minutes = `${remainingTime.minutes}`.padStart(2, "0");
  const seconds = `${remainingTime.seconds}`.padStart(2, "0");

  if (timer.mode === "pomodoro") {
    notificationContainer.style.display = "none";
    notificationText.textContent = "";
    mainButton.textContent = minutes + ":" + seconds;
  } else {
    notificationContainer.style.display = "block";
    notificationText.innerHTML =
      "<b>Time is up!</b>\r\n" +
      "Take a break and start again after: " +
      minutes +
      ":" +
      seconds;
    secondaryButtonOne.textContent = minutes + ":" + seconds;
  }

  const text = "Pomodoro App - ";
  document.title = `${text}${minutes}:${seconds}`;
}

/**
 * @property {Function} Switch timer modes and set timer to values corresponding to the set timer mode
 * @param {*} mode
 * @returns void
 */
function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0,
  };

  updateClock();
}

/**
 * @property {Function} Set the default timer mode to pomodoro timer mode
 * @returns void
 */
document.addEventListener("DOMContentLoaded", () => {
  switchMode("pomodoro");
});
