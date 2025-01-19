const bcrypt = require("bcrypt");
const hashString = (str) => bcrypt.hash(str, 10);
module.exports = hashString;
