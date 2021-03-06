require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const app = express();
const { getLongUrl, addOrUpdateUrl, deleteUrl } = require("../dynamo");
const short_url_gen = require("../utils/short_url.js");
const validProtocolURL = require("../utils/validity.js");
const { isValidCustomUrl } = require("../utils/utils.js");

// shorturl creation endpoint
module.exports = function (app) {
  app.put("/shorten/", async (req, res) => {
    let longUrl = req.body.longUrl;
    let daysLater = req.body.expiry;
    const customUrl = req.body.customUrl;

    // checks if expiry date is mentioned by the user or not
    if (typeof daysLater == "undefined") {
      daysLater = 30;
    } else {
      daysLater = +daysLater;
    }

    // get expiry date in unix epoch timestamp
    var today = new Date();
    const expiryDate = Math.floor(
      new Date(new Date().setDate(today.getDate() + daysLater)).getTime() / 1000
    );

    // check if the long url is valid
    if (!validProtocolURL(longUrl)) {
      res.status(400).send("Invalid Long Url");
      console.log("Invalid Long Url");
    }
    // if custom url is not provided then generate it
    else if (typeof customUrl == "undefined" || customUrl.length === 0) {
      if (!(longUrl.startsWith("https://") || longUrl.startsWith("http://"))) {
        longUrl = "https://" + longUrl;
      }

      // generate the shortURL here
      const short = short_url_gen(longUrl);
      let stg = short.substring(0, 6);

      // check if the short url generated is a duplicate.
      // if yes then check the next 6 characters from the generated base 64 hash
      try {
        var item = await getLongUrl(stg);

        if (Object.keys(item).length !== 0) {
          // if hash matches with an already existing shortUrl, send the short url
          if (item["Item"]["long"] == longUrl) {
            res.send(process.env.AWS_HOST_URL + item["Item"]["short"]);
          }
        } else {
          for (let i = 0; i < 15; i++) {
            let stg = short.substring(i, i + 6);

            try {
              var item = await getLongUrl(stg);
              if (Object.keys(item).length !== 0) {
                continue;
              } else {
                let clicks = +0;
                const item = {
                  short: stg,
                  long: longUrl,
                  expiry: expiryDate,
                  clicks: clicks,
                };
                const newItem = await addOrUpdateUrl(item);
                res.send(process.env.AWS_HOST_URL + item["short"]);
                console.log("msg : Success");
                break;
              }
            } catch (err) {
              console.error(err);
              res.status(500).send("Something went wrong");
            }
          }
        }
      } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong");
      }
    } else {
      //custom short url logic
      if (!(longUrl.startsWith("https://") || longUrl.startsWith("http://"))) {
        longUrl = "https://" + longUrl;
      }
      if (!isValidCustomUrl(customUrl)) {
        res.status(400).send("Invalid Custom Url");
        console.log("Invalid Custom Url");
      } else {
        //checking if the custom url already exists
        const fetchItem = await getLongUrl(customUrl);
        console.log(fetchItem);
        if (Object.keys(fetchItem).length !== 0) {
          res.status(400).send("Short Url already taken");
        } else {
          let clicks = +0;
          const item = {
            short: customUrl,
            long: longUrl,
            expiry: expiryDate,
            clicks: clicks,
          };
          try {
            const newItem = await addOrUpdateUrl(item);
            res.send(process.env.AWS_HOST_URL + item["short"]);
          } catch (err) {
            console.error(err);
            res.status(500).send("Something went wrong");
          }
        }
      }
    }
  });
};
