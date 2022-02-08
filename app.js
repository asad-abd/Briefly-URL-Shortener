require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { getLongUrl, addOrUpdateUrl, deleteUrl } = require("./dynamo");
const rateLimit = require('express-rate-limit')
const requestIp = require('request-ip');

app.use(express.json());
app.use(cors());
app.use(requestIp.mw());

app.use(rateLimit({
  windowMs: 60 * 10*1000, // 1 minute
  max: 4, // limit each IP to 30 requests per windowMs
  message: "Your limit exceeded",
  keyGenerator: (req, res) => {
    return req.clientIp // IP address from requestIp.mw(), as opposed to req.ip
  }
}));

// shorturl creation endpoint
require("./routes/createShortUrl")(app);
// long Url fetching endpoint
require("./routes/fetchLongUrl")(app);
// Dev Key fetching/creation endpoint
require("./routes/getDevKey")(app);

app.get("/", (req, res) => {
  res.send("Welcome to briefly - URL shortener!");
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`listening on port ` + port);
});
