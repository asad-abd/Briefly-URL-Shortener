const crypto = require("crypto");
const { getLongUrl, addOrUpdateUrl, deleteUrl } = require("../dynamo");
function short_url_gen(longUrl) {
  var hash = crypto.createHash("md5").update(longUrl).digest("hex");
  function idTochar(n) {
    let map =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
    return map[n];
  }

  function hexByteStringToBitArray(hexByteString) {
    var bits = [];
    for (var i = 0; i < hexByteString.length; ) {
      var hexByte = hexByteString[i++] + hexByteString[i++];
      var byte = parseInt(hexByte, 16);
      for (var j = 7; j >= 0; j--) {
        var bit = (byte >> j) & 0x1;
        bits.push(bit);
      }
    }
    return bits;
  }
  bit_array = hexByteStringToBitArray(hash);
  let char_base64 = [];
  for (let i = 0; i < 21; i++) {
    let num = 0;
    for (let j = 0 + i * 6; j < i * 6 + 6; j++) {
      num = num + Math.pow(2, 5 - (j - i * 6)) * bit_array[j];
    }
    char_base64.push(idTochar(num));
  }
  console.log(char_base64);
  hashed_string = char_base64.join("");
  return hashed_string;
}

module.exports = short_url_gen;
