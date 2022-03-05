const dotenv = require("dotenv");

dotenv.config({ path: __dirname + "/.env" });

module.exports = {
  db_user: process.env.DB_USER,
  db_password: process.env.DB_PASSWORD,
  db_name: process.env.DB_NAME,
};
