const path = require("path");

const uploadFile = (req, res) => {
  const { loginid, avatar } = req.body;
  console.log(req.body);
  if (!loginid || !avatar) {
    return res.send({ error: "Invalid file upload." });
  }

  console.log(req.files);
  const public_dir = path.join(__dirname, "../") + "public";
};

module.exports = { uploadFile };
