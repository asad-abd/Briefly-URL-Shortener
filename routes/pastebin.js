require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const {
  getLongUrl,
  addOrUpdateUrl,
  deleteUrl,
  upload,
  getUser,
  deleteS3Object,
} = require("../dynamo");
const short_url_gen = require("../utils/short_url.js");
const fs = require("fs");

// shorturl creation endpoint
module.exports = function (app) {
  app.put("/pastebin/", upload.single("file"), async (req, res) => {
    // check if dev-key is present. else throw error
    let email = req.body.email;
    let devKey = req.body.devKey;
    // console.log("body");
    // console.log(email);
    // console.log("devKey");
    // console.log(devKey);

    //delete s3 object and db link if
    if (typeof devKey == "undefined") {
      const deleteS3object = await deleteS3Object(req.file.key);
      res.status(500).send("Please provide an api dev key");
    } else if (typeof email == "undefined") {
      const deleteS3object = await deleteS3Object(req.file.key);
      res.status(500).send("Please provide your email");
    } else {
      // the image is uploaded to s3. delete it based on the validity of the credentials.
      const uploadedLink = req.file.location;
      const user = await getUser(email);
      // check if email and devKey is valid
      if (
        typeof user == "undefined" ||
        Object.keys(user).length === 0 ||
        devKey !== user["Item"]["devKey"]
      ) {
        console.log("Invalid email or dev key");
        //delete the uploaded file from s3
        const deleteS3object = await deleteS3Object(req.file.key);
        res.status(500).send("Invalid email or dev key");
      } else {
        console.log(req.file);
        // map the uploaded file to the shorturl
        let short = short_url_gen(uploadedLink);
        short = short.substring(0, 6);

        // get expiry date in unix epoch timestamp
        let today = new Date();
        let daysLater = 30;
        const expiryDate = Math.floor(
          new Date(new Date().setDate(today.getDate() + daysLater)).getTime() /
            1000
        );

        // create dynamo db item
        const item = {
          short: short,
          long: uploadedLink,
          expiry: expiryDate,
          clicks: 0,
        };
        const newItem = await addOrUpdateUrl(item);
        res.send(process.env.AWS_HOST_URL + item["short"]);
      }
    }
  });
};
