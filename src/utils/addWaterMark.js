const fs = require("fs");
const sharp = require("sharp");

const addWaterMark = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next();
  }

  const watermarkPath = "./public/logo.png";
  req.processedImages = [];

  const watermark = await sharp(watermarkPath)
    .resize(100, 100)
    .grayscale()
    .modulate({ brightness: 1, saturation: 0.2, lightness: 1 })
    .png({ alphaQuality: 50 })
    .toBuffer();

  for (const field in req.files) {
    let files = req.files[field];

    // Ensure files is always an array
    if (!Array.isArray(files)) {
      files = [files]; // Convert single object to array
    }

    for (const file of files) {
      const imagePath = file.path;
      const outputPath = `./public/watermarked/${Date.now()}_${
        file.originalname
      }`;

      await sharp(imagePath)
        .composite([{ input: watermark, gravity: "southeast" }])
        .toFile(outputPath);

      req.processedImages.push(outputPath);
    }
  }
  next();
};

module.exports = addWaterMark;
