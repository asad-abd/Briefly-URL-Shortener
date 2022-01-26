// generating the api dev key
const crypto = require("crypto");
function createDevKey(email, passwordHash) {
  const secret = email; //"briefly";
  const devKey = crypto
    .createHmac("sha256", secret)
    .update(passwordHash)
    .digest("hex");

  return devKey;
}

module.exports = createDevKey;
