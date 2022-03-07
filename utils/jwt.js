const { sign, verify } = require("jsonwebtoken");
const { jwt_secret, jwt_expiry } = require("./jwt_config");

const createToken = (email, login_id) => {
  const accessToken = sign({ email, login_id }, jwt_secret, {
    expiresIn: jwt_expiry,
  });
  return accessToken;
};

const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-token"];
  if (!accessToken) {
    return res.status(400).json({ error: "User not Authenticated!" });
  }

  try {
    const validToken = verify(accessToken, "jwtsecretplschange");
    if (validToken) {
      req.authenticated = true;
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports = { createToken, validateToken };
