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
loadStoredData();

// Load saved data from localStorage
function loadStoredData() {
  let data = localStorage.getItem("06extra");
}

// Dynamically generate select elements
// Save data to localStorage
window.saveData = function () {
  let extra = {};

  extra["Comments"] = "No Show";
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
