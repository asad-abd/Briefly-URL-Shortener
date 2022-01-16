//function to check if the item fetched from db exists
function itemExists(item) {
  if (
    typeof item["Item"] === "undefined" ||
    typeof item["Item"]["long"] === "undefined"
  )
    return false;
  return true;
}

module.exports = itemExists;
