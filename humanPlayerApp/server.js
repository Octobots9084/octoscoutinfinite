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

async function writeDataToJSON(data) {
  const filePath = "./output.json";
  data.timestamp = new Date();
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
