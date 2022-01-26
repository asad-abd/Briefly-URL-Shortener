require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { getLongUrl, addOrUpdateUrl, deleteUrl } = require("./dynamo");

app.use(express.json());
app.use(cors());

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
