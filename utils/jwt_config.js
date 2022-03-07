const path = require("path");
const dotenv = require("dotenv");

const dotenv_filepath = path.join(__dirname, "/..") + "/.env";
dotenv.config({ path: dotenv_filepath });

module.exports = {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expiry: process.env.JWT_EXPIRY,
};
