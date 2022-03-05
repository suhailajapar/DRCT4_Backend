const Router = require("express").Router;
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../service/user.service");

const userRouter = Router();
userRouter.route("/").get((req, res) => res.send("Hi im from user"));
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/profile").get(getUserProfile);

module.exports = userRouter;
