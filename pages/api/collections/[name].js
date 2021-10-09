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
          .once("close", () => resolve({ filepath, filename, fileExt }));
      } else {
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
  const { createdAt, image, imageUrl } = req.body;

  switch (req.method) {
    case "POST":
      const uuid = uuidv4();
      downloadImage(imageUrl, `public/collections/${name}`, uuid).then(
        ({ filepath, filename }) => {
          const jsonData = JSON.stringify({
            imageUrl,
          });
          console.log(jsonData);
          const json = fs.writeFileSync(
            `${filepath}/${filename}.json`,
            jsonData
          );
          res.status(200).json({ echo: { name, createdAt, imageUrl } });
        }
      );
      break;

    case "DELETE":
      try {
        const deleted = fs.rmSync(`public/collections/${name}/${image}`);
        res.status(200).json({ message: "ok" });
      } catch (error) {
        res.status(404).json({ message: `${image} not found` });
      }
      break;

    default:
      res.status(200).json({});
  }
}
