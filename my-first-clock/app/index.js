import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";

import { me as appbit } from "appbit";
import exercise from "exercise";

function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

// Update the clock every minute
//clock.granularity = "minutes";
clock.granularity = "seconds";

// Get a handle on the <text> element
const myClock = document.getElementById("myLabel");
const hrLabel = document.getElementById("hrLabel");
//hrLabel.style.display = "none";

let today = undefined;

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  today = evt.date;
  let hours = today.getHours();
  let meridiem = " AM";
  if (preferences.clockDisplay === "12h") {
    if(hours > 11) {
      meridiem = " PM"
    }
    // 12h format
    hours = hours % 12 || 12;

  } else {
    // 24h format
    hours = zeroPad(hours);
    meridiem = ""
  }
  let mins = zeroPad(today.getMinutes());
  myClock.text = `${hours}:${mins}${meridiem}`;
}

const myExercise = document.getElementById("exercise");
myExercise.text = "Undefined";
const myExerciseText = document.getElementById("exerciseText");
myExerciseText.text = "-";

const button1  = document.getElementById("button-1"); 
button1.onclick = () => {
  myExercise.text = `Bike: ${today.getSeconds()}`;
}

const btnWalk  = document.getElementById("button-2"); 
btnWalk.onclick = () => {
  myExercise.text = "Walk";
}

const btnRun  = document.getElementById("button-3"); 
const btnWorkout = document.getElementById("button-4"); 

if (!appbit.permissions.granted("access_exercise")) {
  console.log("We're not allowed to create exercises!");
}

if (!appbit.permissions.granted("access_heart_rate")) {
  console.log("We're not allowed to read a users' heart rate!");
}

if (!appbit.permissions.granted("access_location")) {
  console.log("We're not allowed to read a users' location!");
}

const intervalMS = 100;
let timerId;
let idx = 0;

btnRun.onclick = () => {
  exercise.start("run", { gps: true });
  if (exercise.state === "started") {
    idx = 0;
    myExercise.text = "Exercise started";
    myExerciseText.text = `Time: 0000`;

    console.log(exercise.stats.calories || 0);
    timerId = setInterval(() => {
      myExercise.text = `Interval Count: ${idx}`
      myExerciseText.text = `HR: ${exercise.stats.heartRate.current}`;
      hrLabel.text = `HR: ${exercise.stats.heartRate.current}`;
      idx++;
    }, intervalMS);

    myClock.style.display = "none";
    hrLabel.style.display = "inline";

  }
  else {
    myExercise.text = "Exercise failed";
  }
}

btnWorkout.onclick = () => {
  myClock.style.display = "inline";
  hrLabel.style.display = "none";
  myExercise.text = "Stopped";
  myExerciseText.text = "Stopped";
  exercise.stop();
  clearInterval(timerId);
  timerId = null;
}



