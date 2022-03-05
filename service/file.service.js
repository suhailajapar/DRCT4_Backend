const db = require("../database");

const uploadFile = async (req, res) => {
  const { loginid, file } = req;
  if (!loginid || !file) {
    console.log("No file upload");
    return res.send({ error: "Invalid request" });
  }

  const image_url = "http://127.0.0.1:3000/images/" + file.filename;
  // URL of the Image
  const user_image_query =
    "UPDATE hikers.users SET user_img = $1  WHERE loginid = $2 RETURNING *";

  try {
    await db.query(user_image_query, [image_url, loginid]);
  } catch (e) {
    console.log(e);
  }

  console.log("file uploaded");
  console.log(result);
};

module.exports = { uploadFile };
