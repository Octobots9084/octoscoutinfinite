import {
  getJSONConfig,
  xPositionMetersToPixelsFromTop,
  yPositionMetersToPixelsFromLeft,
  fieldWidth,
  fieldHeight,
} from "/util.js";

let JSONConfig = await getJSONConfig();
let fieldContainer = document.getElementById("fieldContainer");
let fieldImage = document.getElementById("fieldImage");
let isBlue = JSON.parse(localStorage.getItem("01metaData")).teamColor == "Blue";
if (!isBlue) {
  fieldImage.src = "../images/blankFieldRed.png";
}
generateStartingLocationButtons();

// Dynamically generating buttons to select starting location
function generateStartingLocationButtons() {
  let startingLocations = JSONConfig.startingLocations;

  for (let i = 0; i < startingLocations.length; i++) {
    addStartingLocationButton(startingLocations[i]);
  }
}

// Adding a button to select a starting location
function addStartingLocationButton(startingLocation) {
  if (isBlue) {
    startingLocation.x = fieldHeight - startingLocation.x;
    startingLocation.y = fieldWidth - startingLocation.y;
  }
  // Creating the button
  let button = document.createElement("button");
  button.onclick = function () {
    selectPosition(startingLocation);
    window.location.href = "/auto";
  };

  button.classList.add("positionButton");

  // Calculating position on the field
  button.style.top =
    xPositionMetersToPixelsFromTop(fieldImage, startingLocation.x, 5) + "px";
  button.style.left =
    yPositionMetersToPixelsFromLeft(fieldImage, startingLocation.y, 5) + "px";

  fieldContainer.appendChild(button);
}

function selectPosition(position) {
  localStorage.setItem("02startingLocation", JSON.stringify(position));
}
