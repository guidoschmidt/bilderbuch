const fs = require("fs");
const path = require("path");
const client = require("https");
const { v4: uuidv4 } = require("uuid");
const rp = require("request-promise");
const cheerio = require("cheerio");
const archiver = require("archiver");

function archiveCollection(filepath, folderName) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(`public/${folderName}.zip`);
    const archive = archiver("zip");
    output.on("close", () => {
      console.log(archive.pointer() + " total bytes");
      console.log(
        "archiver has been finalized and the output file descriptor has closed."
      );
      resolve();
    });
    archive.on("error", (err) => {
      reject(err);
    });
    archive.pipe(output);
    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(`${filepath}${folderName}`, false);
    archive.finalize();
  });
}

function scrapeWebsite(url) {
  return new Promise((resolve, reject) => {
    rp(url)
      .then((html) => {
        const $ = cheerio.load(html);
        const imageNodes = $("img");
        const images = Array.from(imageNodes).map((img) => {
          return {
            alt: img.attribs.alt,
            src: img.attribs.src,
          };
        });
        resolve(images);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function downloadImage(url, filepath, filename, data) {
  return new Promise((resolve, reject) => {
    console.log(`Download Image: `, url);
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        const mime = res.headers["content-type"];
        const fileExt = mime.split("/").pop();
        const jsonData = JSON.stringify({
          src: url,
          ...data,
        });
        fs.writeFileSync(`${filepath}/${filename}.json`, jsonData);
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
    case "GET":
      archiveCollection(`public/collections/`, name)
        .then(() => {
          res.status(200).json({ link: `/${name}.zip` });
        })
        .catch((err) => {
          res.status(500).json({ error: err });
        });
      break;

    case "POST":
      if (imageUrl.includes("pinterest")) {
        scrapeWebsite(imageUrl).then((images) => {
          const downloadPromises = images.map((img) => {
            const uuid = uuidv4();
            return downloadImage(
              img.src,
              `public/collections/${name}`,
              uuid,
              img
            );
          });
          Promise.all(downloadPromises)
            .then(() => {
              res.status(200).json({ message: "ok" });
            })
            .catch((err) => {
              res.status(500).json({ message: err });
            });
        });
      } else {
        const uuid = uuidv4();
        const jsonData = {};
        downloadImage(
          imageUrl,
          `public/collections/${name}`,
          uuid,
          jsonData
        ).then(({ filepath, filename }) => {
          res.status(200).json({ echo: { name, createdAt, imageUrl } });
        });
      }
      break;

    case "DELETE":
      try {
        const parsed = path.parse(image);
        const deleted = fs.rmSync(`public/collections/${name}/${parsed.base}`);
        const deletedJson = fs.rmSync(
          `public/collections/${name}/${parsed.name}.json`
        );
        res.status(200).json({ message: "ok" });
      } catch (error) {
        res.status(404).json({ message: `${image} not found` });
      }
      break;

    default:
      res.status(200).json({});
  }
}
