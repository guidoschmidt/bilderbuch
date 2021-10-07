const fs = require("fs");

export default function handler(req, res) {
  const { name, createdAt } = req.body;

  switch (req.method) {
    case "POST":
      fs.mkdirSync(`public/collections/${name}/`, {
        recursive: true,
      });
      res.status(200).json({ echo: name });
      break;
    case "DELETE":
      fs.rmdirSync(`public/collections/${name}/`, {
        recursive: true,
      });
      res.status(200).json({ echo: name });
      break;

    default:
      res.status(200).json({});
  }
}
