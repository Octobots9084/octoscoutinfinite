const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const fileLock = require("proper-lockfile");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));
const JSONConfig = require('./public/config.json');
const retryOptions = {
  retries: {
    retries: 5,
    factor: 3,
    minTimeout: 1 * 1000,
    maxTimeout: 60 * 1000,
    randomize: true,
  },
};
app.post("/submitData", async (req, res) => {
  console.log(req.body);
  await writeDataToJSON(req.body);
  res.sendStatus(200);
});
app.get("/output.json", async (req, res) => {
  const filePath = "./output.json";
  let data;
  // Acquire lock
  await fileLock.lock(filePath, retryOptions).then((release) => {
    // Read the JSON file
    data = fs.readFileSync(filePath, "utf8");
    return release();
  });
  // Set headers to indicate JSON response
  res.setHeader("Content-Type", "application/json");
  // Send JSON data as response
  res.send(data);
});
function isDateInRange(dateToCheck, startDate, endDate) {
  // Convert all dates to timestamps to ensure proper comparison
  const timestampToCheck = new Date(dateToCheck).getTime();
  const timestampStart = new Date(startDate).getTime();
  const timestampEnd = new Date(endDate).getTime();
  console.log(timestampToCheck);
  console.log(timestampStart)
  console.log(timestampEnd)

  // Check if the date to check is between the start and end dates
  return timestampToCheck >= timestampStart && timestampToCheck <= timestampEnd;
}
async function writeDataToJSON(data) {
  const filePath = "./output.json";
  data.timestamp = new Date();
  console.log(JSONConfig.eventDates)
  for(i=0; i<JSONConfig.eventDates.length; i++){
    let eventDate = JSONConfig.eventDates[i];

    // Use getFullYear() and ensure proper month indexing (months are 0-based)
    let startDate = new Date(data.timestamp.getFullYear(), eventDate.startDate.month - 1, eventDate.startDate.day);
    let endDate = new Date(data.timestamp.getFullYear(), eventDate.endDate.month - 1, eventDate.endDate.day);

    // Check if the timestamp is in range
    let inRange = (data.timestamp >= startDate && data.timestamp <= endDate);

    console.log(data.timestamp);
    console.log(startDate);
    console.log(endDate);
    console.log(inRange);

    // Use isDateInRange function (if necessary)
    if (isDateInRange(data.timestamp, startDate, endDate)) {
      data.eventID = eventDate.eventID;
    }
  }

  await fileLock.lock(filePath, retryOptions).then((release) => {
    // Read existing file content
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent || "[]");

    // Append new data
    jsonData.push(data);

    // Write updated data to file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log("Data appended to output.json.");
    return release();
  });
}

const PORT = 9084;
app.listen(PORT, () => {
  console.log("App is listening on port 9084");
});
