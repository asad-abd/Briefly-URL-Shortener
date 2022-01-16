require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { getLongUrl, addOrUpdateUrl, deleteUrl } = require("./dynamo");
const short_url_gen = require("./short_url");
const validProtocolURL = require("./validity.js");
const itemExists = require("./utils.js");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to briefly - URL shortner!");
});

// long Url fetching endpoints
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

// shorturl creation endpoint
app.put("/shorten/", async (req, res) => {
  let longUrl = req.body.longUrl;
  let daysLater = +req.body.expiry;
  const customUrl = req.body.customUrl;

  //checks if expiry date is mentioned by the user or not
  if (typeof daysLater == "undefined") {
    daysLater = 30;
  }

  //get expiry date in unix epoch timestamp
  var today = new Date();
  const expiryDate = Math.floor(
    new Date(new Date().setDate(today.getDate() + daysLater)).getTime() / 1000
  );

  //check if the long url is valid
  if (!validProtocolURL(longUrl)) {
    res.status(400).send("Invalid Long Url");
    console.log("Invalid Long Url");
  } else if (typeof customUrl == "undefined" || customUrl.length === 0) {
    //generating the short url
    if (!(longUrl.startsWith("https://") || longUrl.startsWith("http://"))) {
      longUrl = "https://" + longUrl;
      console.log(longUrl);
    }

    //generate the shortURL here
    const short = short_url_gen(longUrl);
    let stg = short.substring(0, 6);

    //check if the short url generated is a duplicate.
    //if yes then check the next 6 characters from the generated base 64 hash
    try {
      var item = await getLongUrl(stg);

      if (Object.keys(item).length !== 0) {
        //if hash matches with an already existing shortUrl, send the short url
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
              const item = { short: stg, long: longUrl, expiry: expiryDate };
              const newItem = await addOrUpdateUrl(item);
              res.send(process.env.AWS_HOST_URL + item["short"]);
              console.log("msg : Success");
              break;
            }
          } catch (err) {
            console.error(err);
            res.status(500).json({ err: "Something went wrong" });
          }
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ err: "Something went wrong" });
    }
  } else {
    //custom short url logic
    if (!(longUrl.startsWith("https://") || longUrl.startsWith("http://"))) {
      longUrl = "https://" + longUrl;
    }
    function isValidCustomUrl(str) {
      var pattern = new RegExp("^[a-zA-Z0-9_-]*$"); // fragment locator
      return !!pattern.test(str);
    }
    if (!isValidCustomUrl(customUrl)) {
      res.status(400).json({ err: "Invalid Custom Url" });
      console.log("Invalid Custom Url");
    } else {
      //checking if the custom url already exists
      const fetchItem = await getLongUrl(customUrl);
      console.log(fetchItem);
      if (Object.keys(fetchItem).length !== 0) {
        res.status(400).json({ err: "Short Url already taken" });
      } else {
        const item = { short: customUrl, long: longUrl, expiry: expiryDate };
        try {
          const newItem = await addOrUpdateUrl(item);
          res.send(process.env.AWS_HOST_URL + item["short"]);
          res.status(200).json({ msg: "Success" });
        } catch (err) {
          console.error(err);
          res.status(500).json({ err: "Something went wrong" });
        }
      }
    }
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`listening on port ` + port);
});
