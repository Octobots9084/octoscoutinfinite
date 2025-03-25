import { getJSONConfig } from "/util.js";

let JSONConfig = await getJSONConfig();
document.title = JSONConfig.pageTitle;
let extraOptions = JSONConfig.extraOptions;
let extraSelectsContainer = document.getElementById("extraSelectsContainer");
let commentInput = document.getElementById("commentInput");

let extraSelects = [];
generateSelects();
loadStoredData();

function loadStoredData() {
  let data = localStorage.getItem("06extra");
  if (data != null) {
    let extraData = JSON.parse(data);
    for (let i = 0; i < extraOptions.length; i++) {
      extraSelects[i].value = extraData[extraOptions[i].name];
    }
  }
}

// Dynamically generating select elements
function generateSelects() {
  for (let i = 0; i < extraOptions.length; i++) {
    let container = document.createElement("div");
    extraSelects.push(document.createElement("select"));
    let label = document.createElement("h3");
    label.innerHTML = extraOptions[i].name;
    let possibleResults = extraOptions[i].possibleResults;

    for (var j = 0; j < possibleResults.length; j++) {
      var option = document.createElement("option");
      option.value = possibleResults[j].name;
      option.text = possibleResults[j].name;

      extraSelects[extraSelects.length - 1].appendChild(option);
    }
    label.classList.add("inputLabel");
    container.classList.add("inputContainer");
    container.appendChild(label);
    container.appendChild(extraSelects[extraSelects.length - 1]);

    extraSelectsContainer.appendChild(container);
  }
}

window.saveData = saveData;
window.submitData = submitData;
function saveData() {
  let extra = {};
  for (let i = 0; i < extraOptions.length; i++) {
    extra[extraOptions[i].name] = extraSelects[i].value;
  }

  extra["Comments"] = commentInput.value;
  localStorage.setItem("06extra", JSON.stringify(extra));
}

let matchSubmitted = false;
async function submitData() {
  if (
    !matchSubmitted ||
    confirm("Are you sure you want to submit a duplicate match?")
  ) {
    matchSubmitted = true;
    let response = await fetch("../submitData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(localStorage),
    });

    if (response.status == 200) {
      alert("Match Submitted");

      if (funToggleVar) {
      var sound = new Audio("../images/pop.mp3");
        sound.play();
      playConfetti();
      playCupcake();
      }
    }
  }
}

document.scoutAgain = scoutAgain;
function scoutAgain() {
  if (!matchSubmitted) {
    if (confirm("You haven't submitted a match, your data will be lost.")) {
      window.location.href = "/";
    }
  } else {
    window.location.href = "/";
  }
  saveCookieClicker();
}

function playConfetti() {
  const confettiImage = document.createElement('img');
  confettiImage.style.zIndex = -9999;
  
  confettiImage.src = '../images/confetti.gif';
  confettiImage.width = 1536;
  confettiImage.height = 1536;
  
  confettiImage.style.position = 'fixed';
  confettiImage.style.top = '50%';
  confettiImage.style.left = '50%';
  confettiImage.style.transform = 'translate(-50%, -50%)';
  confettiImage.style.zIndex = '-999';
  
  document.body.appendChild(confettiImage);
  
  setTimeout(() => {
    confettiImage.remove();
  }, 3000);//3 sec
}
let currentCupcakeImage = null;

function playCupcake() {
  // If there's already an existing cupcake image, remove it
  if (currentCupcakeImage) {
    currentCupcakeImage.remove();
  }

  let randomX = Math.random() * 100;
  let randomY = Math.random() * 50;

  const cupcakeImage = document.createElement('img');
  
  cupcakeImage.src = '../images/cupcake.png';
  cupcakeImage.width = 1152 / 4;
  cupcakeImage.height = 648 / 4;
  
  cupcakeImage.style.position = 'fixed';
  cupcakeImage.style.top = randomY + '%';
  cupcakeImage.style.left = randomX + '%';
  cupcakeImage.style.transform = 'translate(-50%, -50%)';
  cupcakeImage.style.zIndex = '-999';
  
  document.body.appendChild(cupcakeImage);
  
  currentCupcakeImage = cupcakeImage;
}

let funToggleVar = true;

document.funToggle = funToggle;
function funToggle() {
  funToggleVar = !funToggleVar;
  if (funToggleVar) {
    document.getElementById("funToggle").setAttribute("data-tooltip", "Fun is on.");
    } else {
      document.getElementById("funToggle").setAttribute("data-tooltip", "Fun is off.");
    }
}

if (funToggleVar) {
document.getElementById("funToggle").setAttribute("data-tooltip", "Fun is on.");
} else {
  document.getElementById("funToggle").setAttribute("data-tooltip", "Fun is off.");
}



//cookie clicker
let cookies;
let tempcookies;
let cps;
let cpsActive = false;
let clickVal;
let cpsUpgradePrice;
let clickValUpgradePrice;
let cpsavg;

if (!(cpsavg >= 0)) {
  cpsavg = 0;
}

let second = setInterval (function() {
  if (cpsActive) {
    cookieCps();
  }

  cpsavg = cookies - tempcookies;

if (!(cpsavg >= 0)) {
  cpsavg = 0;
}

  tempcookies = cookies;


  updateVariables();
}, 1000) 
// let fast = setInterval (function() {
//   cpsavg = cookies - tempcookies;
//   updateVariables();
// },50)


if (localStorage.getItem("CookieClicker.cookies") == null) {
  cookies = 0;
} else {
  cookies = parseInt(localStorage.getItem("CookieClicker.cookies"));
}
  
if (localStorage.getItem("CookieClicker.cps") == null) {
  cps = 0;
} else {
cps = parseInt(localStorage.getItem("CookieClicker.cps"));
}

if (localStorage.getItem("CookieClicker.clickVal") == null) {
  clickVal = 1;
} else {
clickVal = parseInt(localStorage.getItem("CookieClicker.clickVal"));
}

if (localStorage.getItem("CookieClicker.cpsUpgradePrice") == null) {
  cpsUpgradePrice = 100;
} else {
cpsUpgradePrice = parseInt(localStorage.getItem("CookieClicker.cpsUpgradePrice"));
}

if (localStorage.getItem("CookieClicker.clickValUpgradePrice") == null) {
  clickValUpgradePrice = 100;
} else {
clickValUpgradePrice = parseInt(localStorage.getItem("CookieClicker.clickValUpgradePrice"));
}


function saveCookieClicker () {
  localStorage.setItem("CookieClicker.cookies", cookies);

  localStorage.setItem("CookieClicker.cps", clickVal);

  localStorage.setItem("CookieClicker.clickVal", clickVal);

  localStorage.setItem("CookieClicker.cpsUpgradePrice", cpsUpgradePrice);
}

function addCookies(newCookies) {
  cookies += newCookies;
}

function getCookies () {
  return cookies; 
}

function addCps (newCps) {
  cps += newCps;
}


function addClickVal (newClickVal) {
  clickVal += newClickVal;
}


function addClickValUpgradePrice () {
  clickValUpgradePrice *= 1.1;
}

function addCpsUpgradePrice () {
  cpsUpgradePrice *= 1.1;
}



document.cookieClick = cookieClick;
function cookieClick () {
  addCookies(clickVal);
  console.log(cookies);

  updateVariables();
  console.log("CLICKVAL" + 1); 
  
}//button click

document.upgradeClickVal = upgradeClickVal;
function upgradeClickVal () {
  if (cookies >= clickValUpgradePrice) {
    cookies -= clickValUpgradePrice;
    addClickVal(1);
    addClickValUpgradePrice();
    updateVariables();
    console.log("TEST")
  }
}


document.cookieCps = cookieCps;
function cookieCps () {
  addCookies(cps);

  updateVariables();
}//per second

document.startCps = startCps;
function startCps () {
  cpsActive = true;
  console.log("Starting CPS");
}

document.stopCps = stopCps;
function stopCps () {
  cpsActive = false;
  console.log("Stopping CPS");
}

document.upgradeCps = upgradeCps;
function upgradeCps () {
  if (cookies >= cpsUpgradePrice) {
    cookies -= cpsUpgradePrice;
    addCpsUpgradePrice();
    addCps(1);
  }
}

function updateVariables () {
  cookies = Math.trunc(cookies);
  clickValUpgradePrice = Math.trunc(clickValUpgradePrice);
  cpsUpgradePrice = Math.trunc(cpsUpgradePrice);
  cps = Math.trunc(cps);
document.getElementById("cookies").innerHTML = cookies;

document.getElementById("cookieClick").setAttribute("data-tooltip", ("Click Value: " + clickVal));
//document.getElementById("cpsUpgradePrice").innerHTML = cpsUpgradePrice; 

document.getElementById("cpsavg").innerHTML = cpsavg;

document.getElementById("upgradeClickVal").setAttribute("data-tooltip", ("Upgrade Price: " + clickValUpgradePrice));

document.getElementById("upgradeCps").setAttribute("data-tooltip", ("Upgrade Price: " + cpsUpgradePrice));

document.getElementById("cpsStart").setAttribute("data-tooltip", ("Cps Value: " + cps));
}

updateVariables();
//console.log("CLICKVALUPGRADEPRICE" + clickValUpgradePrice);