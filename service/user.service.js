const db = require("../database");

const { createToken, validateToken } = require("../utils/jwt");

const registerUser = async (req, res) => {
  const { username, fullname, email, password, date_joined } = req.body;
  const hashed_password = await bcrypt.hash(password, 10);
  const user_info = [username, fullname, email, hashed_password, date_joined];
  console.log(user_info);

  const register_query =
    "INSERT INTO hikers.users (username, full_name, email, password, date_joined) VALUES ($1, $2, $3, $4, $5)";

  try {
    await db.query(register_query, [...user_info]);
  } catch (e) {
    console.log(err);
    return res.send({ err: err });
  }

  console.log("REGISTER SUCCESS");
  return res.status(200).send({ message: "Welcome Hikers" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const login_query = "SELECT * FROM hikers.users WHERE email = $1";

  try {
    const results = await db.query(login_query, [email]);
    if (!results.rowCount) {
      return res
        .status(400)
        .send({ message: "Wrong email/password combination!" });
    }

    const does_password_match = await bcrypt.compare(
      password,
      results.row[0].password
    );
    if (!does_password_match) {
      return res
        .status(400)
        .send({ message: "Wrong email/password combination!" });
    }

    const { email: db_email, loginid } = result.rows[0];
    const access_token = createToken(db_email, loginid);

    //Store access-token in cookiie
    // res.cookie("access-token", access_token, {
    //   maxAge: 86400 * 1000, //expired in 1 day (ms)
    //   httpOnly: true,
    // });

    // Remove password from response.
    // Renamed it to removed_password because clashes with top declaration
    const { password: removed_password, ...filtered_result } = result.rows[0];
    console.log(filtered_result);

    return res.status(200).send({ token: access_token, ...filtered_result });
  } catch (e) {
    console.log(e);
    res.send({ error: e });
  }
};

const getUserProfile = (req, res) => {
  res.json("profile");
};

module.exports = { registerUser, loginUser, getUserProfile };
