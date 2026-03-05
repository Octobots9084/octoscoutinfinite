const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const fileLock = require("proper-lockfile");
const { json } = require("stream/consumers");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
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

app.post("/removeData", async (req, res) => {
  console.log(req.body);
  await removeDataFromJSON(req.body);
  res.sendStatus(200);
});
app.post("/resurrectData", async (req, res) => {
  console.log(req.body);
  await resurrectData(req.body);
  res.sendStatus(200);
});
app.post("/deleteData", async (req, res) => {
  console.log(req.body);
  await deleteDataFromJSON(req.body);
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
async function removeDataFromJSON(index) {
  const filePath = "./output.json";
  await fileLock.lock(filePath, retryOptions).then((release) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent || "[]");
    // Append new data
    console.log(jsonData[index]);
    jsonData[index].deleted = true;

    // Write updated data to file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log("Data removed from output.json.");
    return release();
  });
}
async function deleteDataFromJSON(index) {
  const filePath = "./output.json";
  await fileLock.lock(filePath, retryOptions).then((release) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent || "[]");
    // Append new data
    console.log(jsonData[index]);
    jsonData.splice(index, 1);

    // Write updated data to file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log("Data removed from output.json.");
    return release();
  });
}
async function writeDataToJSON(data) {
  const filePath = "./output.json";
  data.timestamp = new Date();
  data.deleted = false;
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

async function resurrectData(index) {
  const filePath = "./output.json";
  await fileLock.lock(filePath, retryOptions).then((release) => {
    // Read existing file content
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent || "[]");
    // Append new data
    jsonData[index].deleted = false;

    // Write updated data to file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log("Data appended to output.json.");
    return release();
  });
}
async function pullOverClockData() {
  console.log("Pulling overclock data...");
  const filePath = "./output.json";
  let overclockData;

  try {
    const response = await fetch(
      "https://frc2485analytics.vercel.app/api/get-data",
    );

    if (!response.ok) {
      throw new Error("Network response was not ok. " + response.status);
    }

    // FIX: Parse the body as JSON and assign it to your variable
    parsedData = await response.json();
    overclockData = parsedData.rows;
  } catch (error) {
    console.error("Fetch error:", error);
  }
  await fileLock.lock(filePath, retryOptions).then(async (release) => {
    // Read existing file content
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent || "[]");
    if (overclockData) {
      const filteredData = jsonData.filter((item) => !item.id);
      const updatedData = filteredData.concat(overclockData);
      // Write updated data to file
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    }
    return release();
  });
  setTimeout(pullOverClockData, 10 * 60 * 1000);
}

const PORT = 9084;
app.listen(PORT, () => {
  console.log("App is listening on port 9084");
  pullOverClockData();
});
