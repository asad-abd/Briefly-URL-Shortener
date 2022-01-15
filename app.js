const express = require("express");
const cors = require("cors");
const app = express();
const { getLongUrl, addOrUpdateUrl, deleteUrl } = require("./dynamo");
const short_url_gen = require("./short_url");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to briefly - URL shortner!");
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = req.params.shortUrl;
  try {
    const item = await getLongUrl(shortUrl);
    //add http redirect here (to the long url)
    console.log(item);
    res.json(item);
    //res.status(201).json({ res: "Something went wrong" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

app.put("/shorten/", async (req, res) => {
  const longUrl = req.body.longUrl;
  var daysLater = +req.body.expiry;
  const customUrl = req.body.customUrl;

  //generate the shortURL here

  if (typeof daysLater == "undefined") {
    daysLater = 30;
  }

  //get expiry date in unix epoch timestamp
  var today = new Date();
  const expiryDate = Math.floor(
    new Date(new Date().setDate(today.getDate() + daysLater)).getTime() / 1000
  );

  if (typeof customUrl == "undefined" || customUrl.length === 0) {
    const short = short_url_gen(longUrl);
    let stg = short.substring(0, 6);

    try {
      var item = await getLongUrl(stg);

      if (Object.keys(item).length !== 0) {
        if (item["Item"]["long"] == longUrl) {
          res.send(item);
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
              res.send(item);
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
    const item = { short: customUrl, long: longUrl, expiry: expiryDate };
    try {
      const newItem = await addOrUpdateUrl(item);
      res.send(item);
      res.status(200).json({ msg: "Success" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ err: "Something went wrong" });
    }
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`listening on port ` + port);
});
