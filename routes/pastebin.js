require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { getLongUrl, addOrUpdateUrl, deleteUrl, upload } = require("../dynamo");
const short_url_gen = require("../utils/short_url.js");
const fs = require("fs");

// shorturl creation endpoint
module.exports = function (app) {
  app.put("/pastebin/", upload.single("image"), async (req, res) => {
    const uploadedLink = req.file.location;
    console.log(req.file);
    // map the uploaded file to the shorturl
    let short = short_url_gen(uploadedLink);
    short = short.substring(0, 6);

    // get expiry date in unix epoch timestamp
    let today = new Date();
    let daysLater = 30;
    const expiryDate = Math.floor(
      new Date(new Date().setDate(today.getDate() + daysLater)).getTime() / 1000
    );

    // create dynamo db item
    const item = { short: short, long: uploadedLink, expiry: expiryDate };
    const newItem = await addOrUpdateUrl(item);
    res.send(process.env.AWS_HOST_URL + item["short"]);
  });
};
