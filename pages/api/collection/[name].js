const fs = require("fs");
const client = require("https");
const { v4: uuidv4 } = require("uuid");

function downloadImage(url, filepath, filename) {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        const mime = res.headers["content-type"];
        const fileExt = mime.split("/").pop();
        res
          .pipe(fs.createWriteStream(`${filepath}/${filename}.${fileExt}`))
          .on("error", reject)
          .once("close", () => resolve(filepath));
      } else {
        // Consume response data to free up memory
        res.resume();
        reject(
          new Error(`Request Failed With a Status Code: ${res.statusCode}`)
        );
      }
    });
  });
}

export default function handler(req, res) {
  const { name } = req.query;
  const { createdAt, imageUrl } = req.body;
  if (req.method === "POST") {
    const uuid = uuidv4();
    downloadImage(imageUrl, `public/collections/${name}`, uuid);
    res.status(200).json({ echo: { name, createdAt, imageUrl } });
  } else {
    res.status(200).json({});
  }
}
