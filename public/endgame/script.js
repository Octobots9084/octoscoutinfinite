import {
  getJSONConfig,
  xPositionMetersToPixelsFromTop,
  yPositionMetersToPixelsFromLeft,
  fieldWidth,
  fieldHeight,
} from "/util.js";

let JSONConfig = await getJSONConfig();
document.title = JSONConfig.pageTitle;
let fieldContainer = document.getElementById("fieldContainer");
let fieldImage = document.getElementById("fieldImage");
fieldImage.src = "../images/endgameField.png";
if (fieldImage.complete) {
  generateEndgameButtons();
} else {
  fieldImage.onload = () => {
    generateEndgameButtons();
  };
}
document.getElementById("teamNum").innerHTML =
  "Team #: " + JSON.parse(localStorage.getItem("01metaData")).teamNumber;

// Dynamically generating buttons to select starting location
function generateEndgameButtons() {
  let endgames = JSONConfig.endgameOptions;

  for (let i = 0; i < endgames.length; i++) {
    addEndgameButton(endgames[i]);
  }
}
// Adding a button to select a starting location
function addEndgameButton(endgame) {
  endgame.x = fieldHeight - endgame.x;
  endgame.y = fieldWidth - endgame.y;
  // Creating the button
  let button = document.createElement("button");
  button.onclick = function () {
    selectEndgame(endgame);
    window.location.href = "/submit";
  };

  button.classList.add("positionButton");

  // Calculating position on the field
  button.style.top =
    xPositionMetersToPixelsFromTop(fieldImage, endgame.x, 5) + "px";
  button.style.left =
    yPositionMetersToPixelsFromLeft(fieldImage, endgame.y, 5) + "px";

  fieldContainer.appendChild(button);
}

function selectEndgame(endgame) {
  localStorage.setItem("05endgame", JSON.stringify([endgame]));
}
