const fs = require("fs");

export default function handler(req, res) {
  const { name, createdAt } = req.body;
  if (req.method === "POST") {
    const dir = fs.mkdirSync(`public/collections/${name}/`, {
      recursive: true,
    });
    res.status(200).json({ echo: name });
  } else {
    // Handle any other HTTP method
    res.status(200).json({});
  }
}
