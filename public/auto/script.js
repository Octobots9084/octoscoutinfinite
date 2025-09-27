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
let gamePieceContainer = document.getElementById("gamePieceContainer");
let gamePieceViewer = document.getElementById("gamePieceViewer");
let gamePieces = [];
document.getElementById("teamNum").innerHTML =
  "Team #: " + JSON.parse(localStorage.getItem("01metaData")).teamNumber;
let pieceTimer = null;
let flashInterval = null;
if (fieldImage.complete) {
  generateCollectionButtons();
  loadStoredData();
} else {
  fieldImage.onload = () => {
    generateCollectionButtons();
    loadStoredData();
  };
}

class GamePiece {
  constructor(collectionLocation, name, color) {
    this.collectionLocation = collectionLocation;
    this.name = name;
    this.color = color;
  }
}

function leaveFunc(bypass) {
  console.log(localStorage.getItem("left"));
  let left = localStorage.getItem("left") === "true";
  let leaveButton = document.getElementById("leave");
  let leave = JSONConfig.leave;
  console.log(bypass);
  console.log(left);
  if (left == false || bypass) {
    console.log("yay");

    leaveButton.style.backgroundColor = "grey";
    leaveButton.onclick = null;
    left = true;
    localStorage.setItem("left", true);
    console.log("set true");
    collectPiece({ name: "Leave", x: leave.x, y: leave.y }, "leave", "green");
  }
}
function unLeave() {
  let leaveButton = document.getElementById("leave");
  leaveButton.style.backgroundColor = "green";
  localStorage.setItem("left", false);
  leaveButton.onclick = function () {
    leaveFunc();
  };
}
function startPieceTimer(targetElementId) {
  // If a timer is already running, clear it first
  stopPieceTimer();

  // Start 15 second countdown
  pieceTimer = setTimeout(() => {
    startFlashing(targetElementId);
  }, 15000); // 15000 ms = 15 seconds
}

function startFlashing() {
  const element = document.getElementById("nextButton");
  if (!element) return;

  // If already flashing, don't stack intervals
  if (flashInterval) clearInterval(flashInterval);

  flashInterval = setInterval(() => {
    element.classList.toggle("flash-red");
  }, 500); // toggles every 0.5s
}

function stopPieceTimer() {
  // Stop timer if running
  if (pieceTimer) {
    clearTimeout(pieceTimer);
    pieceTimer = null;
  }

  // Stop flashing if running
  if (flashInterval) {
    clearInterval(flashInterval);
    flashInterval = null;

    // Remove flashing class in case it’s stuck red
    const flashing = document.querySelector(".flash-red");
    if (flashing) flashing.classList.remove("flash-red");
  }
}
function loadStoredData() {
  let data = localStorage.getItem("03auto");
  if (data != null) {
    gamePieces = JSON.parse(data);
    for (let i = 0; i < gamePieces.length; i++) {
      if (gamePieces[i].name == "Leave") {
        localStorage.setItem("left", true);
        break;
      } else {
        localStorage.setItem("left", false);
      }
    }
    updateGamePieceViewer();
  } else {
    localStorage.setItem("left", false);
  }
}

// Dynamically generating buttons to select auto collections
function generateCollectionButtons() {
  let gamePieces = JSONConfig.gamePieces;
  let iteratorColorStartingValue = 50;
  let maxColorIteratorValue = 255;

  for (let i = 0; i < gamePieces.length; i++) {
    // Creating the collection locations for the blue alliance, changing the color for differentiation
    let blueButtonColorIterator = iteratorColorStartingValue;
    for (let j = 0; j < gamePieces[i].blueAutoCollectionLocations.length; j++) {
      addCollectionClickableImage(
        gamePieces[i].blueAutoCollectionLocations[j],
        gamePieces[i].name,
        "rgb(" + [0, 0, blueButtonColorIterator].join(",") + ")"
      );
      blueButtonColorIterator +=
        (maxColorIteratorValue - iteratorColorStartingValue) /
        gamePieces[i].blueAutoCollectionLocations.length;
    }

    // Creating the collection locations for the red alliance, changing the color for differentiation
    let redButtonColorIterator = iteratorColorStartingValue;
    for (let j = 0; j < gamePieces[i].redAutoCollectionLocations.length; j++) {
      addCollectionClickableImage(
        gamePieces[i].redAutoCollectionLocations[j],
        gamePieces[i].name,
        "rgb(" + [redButtonColorIterator, 0, 0].join(",") + ")"
      );
      redButtonColorIterator +=
        (maxColorIteratorValue - iteratorColorStartingValue) /
        gamePieces[i].redAutoCollectionLocations.length;
    }

    // Creating the collection locations for the neutral locations, changing the color for differentiation
    let neutralButtonColorIterator = iteratorColorStartingValue;
    for (
      let j = 0;
      j < gamePieces[i].neutralAutoCollectionLocations.length;
      j++
    ) {
      addCollectionClickableImage(
        gamePieces[i].neutralAutoCollectionLocations[j],
        gamePieces[i].name,
        "rgb(" + [0, neutralButtonColorIterator, 0].join(",") + ")"
      );
      neutralButtonColorIterator +=
        (maxColorIteratorValue - iteratorColorStartingValue) /
        gamePieces[i].neutralAutoCollectionLocations.length;
    }
  }
  let noShow = JSONConfig.noShow;
  let noShowButton = document.createElement("img");
  noShowButton.src = "../images/noShow.png";
  noShowButton.classList.add("noShow");
  noShowButton.onclick = function () {
    noShowFunc();
  };
  noShowButton.style.top =
    xPositionMetersToPixelsFromTop(fieldImage, noShow.x, 5) + "px";
  noShowButton.style.left =
    yPositionMetersToPixelsFromLeft(fieldImage, noShow.y, 5) + "px";
  fieldContainer.appendChild(noShowButton);

  //leave
  let left = localStorage.getItem("left") || false;
  let leave = JSONConfig.leave;
  let leaveButton = document.createElement("img");
  if (left) window.addEventListener("DOMContentLoaded", () => leaveFunc(true));
  leaveButton.src = "../images/leave.png";
  leaveButton.classList.add("leave");
  leaveButton.id = "leave";

  leaveButton.onclick = function () {
    leaveFunc();
  };
  leaveButton.style.top =
    xPositionMetersToPixelsFromTop(fieldImage, leave.x, 5) + "px";
  leaveButton.style.left =
    yPositionMetersToPixelsFromLeft(fieldImage, leave.y, 5) + "px";
  fieldContainer.appendChild(leaveButton);
}
function noShowFunc() {
  localStorage.setItem(
    "02startingLocation",
    JSON.stringify({ name: "noShow", x: 0, y: 0 })
  );
  window.location.href = "/noShow";
}
// Adds a clickable image to the field using the position of the button (in meters), the piece type, and the button's color
function addCollectionClickableImage(
  collectionLocation,
  gamePieceName,
  imageBackgroundColor
) {
  collectionLocation.x = fieldHeight - collectionLocation.x;
  collectionLocation.y = fieldWidth - collectionLocation.y;
  let clickableImage = document.createElement("img");
  let clickableImageSideLength = 5; // In units of vh
  clickableImage.onclick = function () {
    collectPiece(collectionLocation, gamePieceName, imageBackgroundColor);
  };
  clickableImage.addEventListener("touchstart", function () {
    clickableImage.style.backgroundColor = "white";
  });
  clickableImage.addEventListener("touchend", function () {
    clickableImage.style.backgroundColor = imageBackgroundColor;
  });

  clickableImage.classList.add("clickableImage");

  // Computing the correct position for the button to be at
  clickableImage.style.top =
    xPositionMetersToPixelsFromTop(
      fieldImage,
      collectionLocation.x,
      clickableImageSideLength
    ) + "px";
  clickableImage.style.left =
    yPositionMetersToPixelsFromLeft(
      fieldImage,
      collectionLocation.y,
      clickableImageSideLength
    ) + "px";
  fieldContainer.appendChild(clickableImage);

  // Setting additional style elements
  clickableImage.src = "/images/" + gamePieceName + ".png";
  clickableImage.style.backgroundColor = imageBackgroundColor;
  clickableImage.style.width = clickableImageSideLength + "vh";
  clickableImage.style.height = clickableImageSideLength + "vh";
}
// Creates a game piece object to represent a collected game piece and updates the viewer
function collectPiece(location, gamePieceName, buttonColor) {
  leaveFunc();
  gamePieces.push(new GamePiece(location, gamePieceName, buttonColor));
  updateGamePieceViewer();
  startPieceTimer();
}

// Updates the visualization of the game pieces collected
function updateGamePieceViewer() {
  let gamePieceImageSideLength = 5; // In units of vh
  let clickableDeleteImageSideLength = 5;
  gamePieceContainer.innerHTML = "";
  if (gamePieces.length == 0) {
    stopPieceTimer();
  }
  // Looping through game pieces
  for (let i = 0; i < gamePieces.length; i++) {
    // Finding possible results
    let possibleResults = [];
    for (let j = 0; j < JSONConfig.gamePieces.length; j++) {
      if (JSONConfig.gamePieces[j].name == gamePieces[i].name) {
        possibleResults = JSONConfig.gamePieces[j].autoPossibleResults;
      }
    }

    // Creating game piece element
    let gamePiece = document.createElement("div");
    gamePiece.classList.add("gamePieceContainer");

    let gamePieceImage = document.createElement("img");
    gamePieceImage.src = "/images/" + gamePieces[i].name + ".png";
    gamePieceImage.style.width = gamePieceImageSideLength + " vh";
    gamePieceImage.style.height = gamePieceImageSideLength + "vh";

    // Adding a selector for results
    if (possibleResults.length > 1) {
      var gamePieceResultSelector = document.createElement("select");
      if (possibleResults.length > 0 && gamePieces[i].result == null) {
        gamePieces[i].result = possibleResults[0].name;
      }
      gamePieceResultSelector.onchange = () => {
        gamePieces[i].result = gamePieceResultSelector.value;
      };
      gamePieceResultSelector.classList.add("gamePieceResultSelector");
      gamePieceResultSelector.classList.add(gamePieces[i].name);

      for (var j = 0; j < possibleResults.length; j++) {
        var option = document.createElement("option");
        option.value = possibleResults[j].name;
        option.text = possibleResults[j].name;
        gamePieceResultSelector.appendChild(option);
      }

      gamePieceResultSelector.value = gamePieces[i].result;
    } else if (possibleResults.length > 0) {
      var resultText = document.createElement("h2");
      gamePieces[i].result = possibleResults[0]?.name;
      resultText.innerHTML = possibleResults[0]?.name || "None";
      resultText.classList.add("resultText");
    } else {
      var resultText = document.createElement("h2");
      gamePieces[i].result = gamePieces[i].collectionLocation.name;
      resultText.innerHTML = gamePieces[i].collectionLocation.name || "None";
      resultText.classList.add("resultText");
    }
    let clickableDeleteImage = document.createElement("img");
    clickableDeleteImage.src = "/images/deleteImage.png";
    clickableDeleteImage.style.width = clickableDeleteImageSideLength + "vh";
    clickableDeleteImage.style.height = clickableDeleteImageSideLength + "vh";
    clickableDeleteImage.onclick = () => {
      if (gamePieces[i].result == "Leave") {
        unLeave();
      }
      gamePieces.splice(i, 1);
      updateGamePieceViewer();
    };

    // Compiling elements together
    gamePiece.appendChild(gamePieceImage);
    if (possibleResults.length > 1) {
      gamePiece.appendChild(gamePieceResultSelector);
    } else {
      gamePiece.appendChild(resultText);
    }
    gamePiece.appendChild(clickableDeleteImage);
    gamePieceContainer.appendChild(gamePiece);

    // Setting background color of game piece and scrolling to bottom of the viewer
    gamePiece.style.backgroundColor = gamePieces[i].color;
    gamePieceViewer.scrollTop = gamePieceViewer.scrollHeight;
  }
}
window.saveData = saveData;
function saveData() {
  localStorage.setItem(
    "02startingLocation",
    JSON.stringify({ name: "show", x: 0, y: 0 })
  );
  localStorage.setItem("03auto", JSON.stringify(gamePieces));
}

function placeCoral() {
  $("#image").click(function () {
    $("#foo").addClass("myClass");
  });
}
