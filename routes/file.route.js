const Router = require("express").Router;
const { uploadFile } = require("../service/file.service");

const fileRouter = Router();
fileRouter.route("/").get((req, res) => res.send("Hi im from file"));
fileRouter.route("/upload").post(uploadFile);

module.exports = fileRouter;
