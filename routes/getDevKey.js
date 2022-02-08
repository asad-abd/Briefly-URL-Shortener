require("dotenv").config({path: '../.env'});
const express = require("express");
const cors = require("cors");
const app = express();
const crypto = require("crypto");
const { getUser, addUser, deleteUser } = require("../dynamo");
const createDevKey = require("../utils/createDevKey.js");

// shorturl creation endpoint
module.exports = function (app) {
  app.put("/get-dev-key/", async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    console.log(email);
    console.log(password);
    // hashing the password
    const secret = "briefly";
    const passwordHash = crypto
      .createHmac("sha256", secret)
      .update(password)
      .digest("hex");
    console.log(passwordHash);

    // check if email already exists in DB - if so match the passwords and send the dev key
    const user = await getUser(email);
    if (Object.keys(user).length !== 0) {
      if (user["Item"]["password"] === passwordHash) {
        console.log(user["Item"]["devKey"]);
        res.status(200).send(user["Item"]["devKey"]);
      }
      // wrong password
      else {
        res.status(400).send("Wrong Password");
      }
    }
    // else - create dev key, store in DB and send back as response
    else {
      const devKey = createDevKey(email, passwordHash);
      const newUser = { email: email, password: passwordHash, devKey: devKey };
      const createNewUser = await addUser(newUser);

      console.log(devKey);
      res.status(200).send(devKey);
    }
  });
};
