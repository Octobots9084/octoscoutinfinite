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

fieldImage.src = "../images/autoFieldBlue.png";
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
  constructor(name, collectionLocation) {
    this.name = name;
    this.result = collectionLocation;
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

  for (let i = 0; i < gamePieces.length; i++) {
    // Creating the collection locations for the blue alliance, changing the color for differentiation
    for (let j = 0; j < gamePieces[i].teleopCollectionLocations.length; j++) {
      addCollectionClickableImage(
        gamePieces[i].teleopCollectionLocations[j],
        gamePieces[i].name
      );
    }
  }
}

// Adds a clickable image to the field using the position of the button (in meters), the piece type, and the button's color
function addCollectionClickableImage(collectionLocation, gamePieceName) {
  collectionLocation.x = fieldHeight - collectionLocation.x;
  collectionLocation.y = fieldWidth - collectionLocation.y;
  let clickableImage = document.createElement("img");
  let clickableImageSideLength = 5; // In units of vh
  console.log(collectionLocation);
  clickableImage.onclick = function () {
    collectPiece(collectionLocation.name, gamePieceName);
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
  clickableImage.style.backgroundColor = `rgb(0, 0, 50)`;
  clickableImage.style.width = clickableImageSideLength + "vh";
  clickableImage.style.height = clickableImageSideLength + "vh";
}

// Creates a game piece object to represent a collected game piece and updates the viewer
function collectPiece(location, gamePieceName) {
  gamePieces.push(new GamePiece(gamePieceName, location));
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

    var resultText = document.createElement("h3");
    resultText.innerHTML = gamePieces[i].result || "None";
    resultText.classList.add("resultText");

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
    if (possibleResults.length > 1) {
      gamePiece.appendChild(gamePieceResultSelector);
    } else {
      gamePiece.appendChild(resultText);
    }
    gamePiece.appendChild(clickableDeleteImage);
    gamePieceContainer.appendChild(gamePiece);

    // Compiling elements together

    // Setting background color of game piece and scrolling to bottom of the viewer
    gamePiece.style.backgroundColor = ` rgb(0, 0, 50)`;
    gamePieceViewer.scrollTop = gamePieceViewer.scrollHeight;
  }
}
window.saveData = saveData;
function saveData() {
  localStorage.setItem("04teleop", JSON.stringify(gamePieces));
}
