//function to check if the item fetched from db exists
function itemExists(item) {
  if (
    typeof item["Item"] === "undefined" ||
    typeof item["Item"]["long"] === "undefined"
  )
    return false;
  return true;
}
function isValidCustomUrl(str) {
  var pattern = new RegExp("^[a-zA-Z0-9_-]*$"); // fragment locator
  return !!pattern.test(str);
}
module.exports = {
  itemExists,
  isValidCustomUrl,
};
