import { getJSONConfig } from "/util.js";

let JSONConfig = await getJSONConfig();
document.title = JSONConfig.pageTitle;
let extraOptions = JSONConfig.extraOptions;
let extraSelectsContainer = document.getElementById("extraSelectsContainer");
let commentInput = document.getElementById("commentInput");
let extraSelects = [];
let currentCupcakeImage = null;
let matchSubmitted = false;

// Initialize page
generateSelects();
loadStoredData();

// Load saved data from localStorage
function loadStoredData() {
  let data = localStorage.getItem("06extra");
  if (data != null) {
    let extraData = JSON.parse(data);
    for (let i = 0; i < extraOptions.length; i++) {
      extraSelects[i].value = extraData[extraOptions[i].name];
    }

    if (extraData["Comments"]) {
      commentInput.value = extraData["Comments"];
    }
  }
}

// Dynamically generate select elements
function generateSelects() {
  for (let i = 0; i < extraOptions.length; i++) {
    // Create container for each select
    let container = document.createElement("div");
    container.classList.add("inputContainer");

    // Create select element
    extraSelects.push(document.createElement("select"));

    // Create label
    let label = document.createElement("h3");
    label.innerHTML = extraOptions[i].name;
    label.classList.add("inputLabel");

    // Add options to select
    let possibleResults = extraOptions[i].possibleResults;
    for (var j = 0; j < possibleResults.length; j++) {
      var option = document.createElement("option");
      option.value = possibleResults[j].name;
      option.text = possibleResults[j].name;
      extraSelects[extraSelects.length - 1].appendChild(option);
    }

    // Add elements to container and page
    container.appendChild(label);
    container.appendChild(extraSelects[extraSelects.length - 1]);
    extraSelectsContainer.appendChild(container);
  }
}

// Save data to localStorage
window.saveData = function () {
  let extra = {};
  for (let i = 0; i < extraOptions.length; i++) {
    extra[extraOptions[i].name] = extraSelects[i].value;
  }

  extra["Comments"] = commentInput.value;
  localStorage.setItem("06extra", JSON.stringify(extra));
};

// Submit data to server
window.submitData = async function () {
  if (
    !matchSubmitted ||
    confirm("Are you sure you want to submit a duplicate match?")
  ) {
    matchSubmitted = true;

    try {
      let response = await fetch("../submitData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(localStorage),
      });

      if (response.status == 200) {
        alert("Match Submitted");
        var sound = new Audio("../images/pop.mp3");
        sound.play();
        playConfetti();
        playCupcake();
      } else {
        alert("Error submitting data. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data. Please check your connection.");
    }
  }
};

// Handle Scout Again button
window.scoutAgain = function () {
  if (!matchSubmitted) {
    if (confirm("You haven't submitted a match, your data will be lost.")) {
      window.location.href = "/";
    }
  } else {
    window.location.href = "/";
  }
};

// Display confetti animation
function playConfetti() {
  const confettiImage = document.createElement("img");

  confettiImage.src = "../images/confetti.gif";
  confettiImage.width = 1536;
  confettiImage.height = 1536;

  confettiImage.style.position = "fixed";
  confettiImage.style.top = "50%";
  confettiImage.style.left = "50%";
  confettiImage.style.transform = "translate(-50%, -50%)";
  confettiImage.style.zIndex = "9999";

  document.body.appendChild(confettiImage);

  setTimeout(() => {
    confettiImage.remove();
  }, 3000);
}

// Display cupcake animation
function playCupcake() {
  // If there's already an existing cupcake image, remove it
  if (currentCupcakeImage) {
    currentCupcakeImage.remove();
  }

  let randomX = Math.random() * 100;
  let randomY = Math.random() * 50;

  const cupcakeImage = document.createElement("img");

  cupcakeImage.src = "../images/cupcake.png";
  cupcakeImage.width = 1152 / 4;
  cupcakeImage.height = 648 / 4;

  cupcakeImage.style.position = "fixed";
  cupcakeImage.style.top = randomY + "%";
  cupcakeImage.style.left = randomX + "%";
  cupcakeImage.style.transform = "translate(-50%, -50%)";
  cupcakeImage.style.zIndex = "9999";

  document.body.appendChild(cupcakeImage);

  currentCupcakeImage = cupcakeImage;
}
