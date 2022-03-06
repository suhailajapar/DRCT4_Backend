const path = require("path");
const dotenv = require("dotenv");

const dotenv_filepath = path.join(__dirname, "/..") + "/.env";
dotenv.config({ path: dotenv_filepath });

module.exports = {
  db_user: process.env.DB_USER,
  db_password: process.env.DB_PASSWORD,
  db_name: process.env.DB_NAME,
};
