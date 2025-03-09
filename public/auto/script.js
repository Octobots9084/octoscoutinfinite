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
let isBlue = JSON.parse(localStorage.getItem("01metaData")).teamColor == "Blue";
if (!isBlue) {
  fieldImage.src = "../images/autoFieldRed.png";
}
document.getElementById("teamNum").innerHTML =
  "Team #: " + JSON.parse(localStorage.getItem("01metaData")).teamNumber;

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
  let data = localStorage.getItem("03auto");
  if (data != null) {
    gamePieces = JSON.parse(data);
    updateGamePieceViewer();
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
  let clickableImageSideLength = 4; // In units of vh
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
    let gamePieceResultSelector = document.createElement("select");
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
  localStorage.setItem("03auto", JSON.stringify(gamePieces));
}

function placeCoral() {
  $("#image").click(function () {
    $("#foo").addClass("myClass");
  });
}
