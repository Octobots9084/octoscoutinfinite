import {
    getJSONConfig
  } from "/util.js";
  let JSONConfig = await getJSONConfig();
  document.title = JSONConfig.pageTitle; 