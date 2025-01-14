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
let gamePieceContainer = document.getElementById("gamePieceContainer");
let gamePieceViewer = document.getElementById("gamePieceViewer");
let gamePieces = [];
let isBlue = JSON.parse(localStorage.getItem("01metaData")).teamColor == "Blue";
if (!isBlue) {
  fieldImage.src = "../images/teleopFieldRed.png";
}

generateCollectionButtons();
loadStoredData();

class GamePiece {
  constructor(collectionLocation, name, color) {
    this.collectionLocation = collectionLocation;
    this.name = name;
    this.color = color;
  }
}

function loadStoredData() {
  let data = localStorage.getItem("04teleop");
  if (data != null) {
    gamePieces = JSON.parse(data);
    updateGamePieceViewer();
  }
}

// Dynamically generating buttons to select teleop collections
function generateCollectionButtons() {
  let gamePieces = JSONConfig.gamePieces;
  let iteratorColorStartingValue = 50;
  let maxColorIteratorValue = 255;

  for (let i = 0; i < gamePieces.length; i++) {
    // Creating the collection locations for the blue alliance, changing the color for differentiation
    let buttonColorIterator = iteratorColorStartingValue;
    for (let j = 0; j < gamePieces[i].teleopCollectionLocations.length; j++) {
      addCollectionClickableImage(
        gamePieces[i].teleopCollectionLocations[j],
        gamePieces[i].name,
        "rgb(" + [0, 0, buttonColorIterator].join(",") + ")"
      );
      buttonColorIterator +=
        (maxColorIteratorValue - iteratorColorStartingValue) /
        gamePieces[i].teleopCollectionLocations.length;
    }
  }
}

// Adds a clickable image to the field using the position of the button (in meters), the piece type, and the button's color
function addCollectionClickableImage(
  collectionLocation,
  gamePieceName,
  imageBackgroundColor
) {
  if (isBlue) {
    collectionLocation.x = fieldHeight - collectionLocation.x;
    collectionLocation.y = fieldWidth - collectionLocation.y;
  }
  let clickableImage = document.createElement("img");
  let clickableImageSideLength = 5; // In units of vh
  clickableImage.onclick = function () {
    collectPiece(collectionLocation, gamePieceName, imageBackgroundColor);
  };

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
  gamePieces.push(new GamePiece(location, gamePieceName, buttonColor));
  updateGamePieceViewer();
}

// Updates the visualization of the game pieces collected
function updateGamePieceViewer() {
  let gamePieceImageSideLength = 5; // In units of vh
  let clickableDeleteImageSideLength = 5;
  gamePieceContainer.innerHTML = "";

  // Looping through game pieces
  for (let i = 0; i < gamePieces.length; i++) {
    // Finding possible results
    let possibleResults = [];
    for (let j = 0; j < JSONConfig.gamePieces.length; j++) {
      if (JSONConfig.gamePieces[j].name == gamePieces[i].name) {
        possibleResults = JSONConfig.gamePieces[j].teleopPossibleResults;
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
    let gamePieceResultSelector = document.createElement("select");
    if (possibleResults.length > 0 && gamePieces[i].result == null) {
      gamePieces[i].result = possibleResults[0].name;
    }

    gamePieceResultSelector.onchange = () => {
      gamePieces[i].result = gamePieceResultSelector.value;
    };
    gamePieceResultSelector.classList.add("gamePieceResultSelector");

    for (var j = 0; j < possibleResults.length; j++) {
      var option = document.createElement("option");
      option.value = possibleResults[j].name;
      option.text = possibleResults[j].name;
      gamePieceResultSelector.appendChild(option);
    }

    gamePieceResultSelector.value = gamePieces[i].result;

    let clickableDeleteImage = document.createElement("img");
    clickableDeleteImage.src = "/images/deleteImage.png";
    clickableDeleteImage.style.width = clickableDeleteImageSideLength + "vh";
    clickableDeleteImage.style.height = clickableDeleteImageSideLength + "vh";
    clickableDeleteImage.onclick = () => {
      gamePieces.splice(i, 1);
      updateGamePieceViewer();
    };

    // Compiling elements together
    gamePiece.appendChild(gamePieceImage);
    gamePiece.appendChild(gamePieceResultSelector);
    gamePiece.appendChild(clickableDeleteImage);
    gamePieceContainer.appendChild(gamePiece);

    // Setting background color of game piece and scrolling to bottom of the viewer
    gamePiece.style.backgroundColor = gamePieces[i].color;
    gamePieceViewer.scrollTop = gamePieceViewer.scrollHeight;
  }
}
window.saveData = saveData;
function saveData() {
  localStorage.setItem("04teleop", JSON.stringify(gamePieces));
}
