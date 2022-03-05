const Pool = require("pg").Pool;
const { db_user, db_password, db_name } = require("./config");

const db = new Pool({
  user: db_user,
  password: db_password,
  host: "localhost",
  database: db_name,
});

module.exports = db;
