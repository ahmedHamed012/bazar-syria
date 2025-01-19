const app = require("./src/app");
require("dotenv").config();
// Passport config
const passport = require("passport");
require("./src/config/passport");
const db = require("./src/config/db");
const PORT = process.env.PORT || 5000;
app.use(passport.initialize());

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
