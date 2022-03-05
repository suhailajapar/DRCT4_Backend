const Router = require("express").Router;
const multer = require("multer");

const { uploadFile } = require("../service/file.service");

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "./public/images/"); // './public/images/' directory name where save the file
  },
  filename: (req, file, callBack) => {
    callBack(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

const fileRouter = Router();
fileRouter.route("/").get((req, res) => res.send("Hi im from file"));
fileRouter.route("/upload").post(upload.single("image"), uploadFile);

module.exports = fileRouter;
