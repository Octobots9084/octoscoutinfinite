let fieldWidth = 8.2;
let fieldHeight = 16.5;

async function getJSONConfig() {
  try {
    const response = await fetch("/config.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching JSON config:", error);
    return null;
  }
}

async function getGraphJSONConfig() {
  try {
    const response = await fetch("/graph.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching JSON config:", error);
    return null;
  }
}

async function getJSONOutput() {
  try {
    const response = await fetch("/output.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching JSON config:", error);
    return null;
  }
}

// Calculates the pixels from the top of the screen so the button is positioned on the field at the correct x coordinate (in meters).
function xPositionMetersToPixelsFromTop(
  fieldImage,
  xMeters,
  widthInPercentOfScreen
) {
  return (
    fieldImage.getBoundingClientRect().top +
    xMeters * (fieldImage.clientHeight / 16.4) -
    ((widthInPercentOfScreen / 100) * window.innerHeight) / 2
  );
}

// Calculates the pixels from the left of the screen so the button is positioned on the field at the correct y coordinate (in meters).
function yPositionMetersToPixelsFromLeft(
  fieldImage,
  yMeters,
  widthInPercentOfScreen
) {
  return (
    fieldImage.getBoundingClientRect().left +
    yMeters * (fieldImage.clientWidth / 8.2) -
    ((widthInPercentOfScreen / 100) * window.innerHeight) / 2
  );
}
function calculateMean(values) {
  if (values.length === 0) {
    return 0; // Return 0 if the array is empty
  }

  const sum = values.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / values.length;

  return mean;
}
function quartiles(values) {
  // Make a copy of the array to avoid altering the original
  var sortedValues = values.slice().sort((a, b) => a - b);

  var length = sortedValues.length;
  var half = Math.floor(length / 2);

  // Compute Q2 (median)
  var q2;
  if (length % 2 === 0) {
    // If the array has an even number of elements
    q2 = (sortedValues[half - 1] + sortedValues[half]) / 2.0;
  } else {
    // If the array has an odd number of elements
    q2 = sortedValues[half];
  }

  // Compute Q1 (lower quartile)
  var q1;
  if (half % 2 === 0) {
    // If the lower half has an even number of elements
    q1 =
      (sortedValues[Math.floor(half / 2) - 1] +
        sortedValues[Math.floor(half / 2)]) /
      2.0;
  } else {
    // If the lower half has an odd number of elements
    q1 = sortedValues[Math.floor(half / 2)];
  }

  // Compute Q3 (upper quartile)
  var q3;
  if ((length - half) % 2 === 0) {
    // If the upper half has an even number of elements
    q3 =
      (sortedValues[half + Math.floor((length - half) / 2) - 1] +
        sortedValues[half + Math.floor((length - half) / 2)]) /
      2.0;
  } else {
    // If the upper half has an odd number of elements
    q3 = sortedValues[half + Math.floor((length - half) / 2)];
  }

  return {
    Q1: q1,
    Q2: q2,
    Q3: q3,
  };
}

export {
  getJSONConfig,
  getGraphJSONConfig,
  getJSONOutput,
  xPositionMetersToPixelsFromTop,
  yPositionMetersToPixelsFromLeft,
  quartiles,
  calculateMean,
  fieldWidth,
  fieldHeight,
};
