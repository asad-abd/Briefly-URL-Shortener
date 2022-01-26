require("dotenv").config();
const express = require("express");
const { getLongUrl, addOrUpdateUrl, deleteUrl } = require("../dynamo");
const itemExists = require("../utils/utils.js");

// long Url fetching endpoints

module.exports = function (app) {
  app.get("/:shortUrl", async (req, res) => {
    const shortUrl = req.params.shortUrl;
    console.log(shortUrl);
    try {
      const item = await getLongUrl(shortUrl);
      console.log(item);
      //add http redirect here (to the long url)
      //res.json(item);
      if (itemExists(item)) {
        console.log(item["Item"]["long"]);
        return res.redirect(item["Item"]["long"]);
      }

      //res.status(201).json({ res: "Something went wrong" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ err: "Something went wrong" });
    }
  });
};