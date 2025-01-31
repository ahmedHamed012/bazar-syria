const fs = require("fs");
const sharp = require("sharp");

const addWaterMark = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const watermarkPath = "./public/logo.png";
    req.processedImages = [];

    // Load and resize the watermark once for efficiency
    const watermark = await sharp(watermarkPath)
      .resize(150, 150)
      .png()
      .toBuffer();

    for (const file of req.files) {
      const imagePath = file.path;
      const outputPath = `./public/watermarked/${Date.now()}_${
        file.originalname
      }`;

      await sharp(imagePath)
        .composite([{ input: watermark, gravity: "southeast" }]) // Apply watermark
        .toFile(outputPath);

      //   // Wait before unlinking to avoid "EPERM" errors
      //   setTimeout(async () => {
      //     try {
      //       await fs.unlink(imagePath);
      //     } catch (unlinkErr) {
      //       console.error("Error deleting original file:", unlinkErr);
      //     }
      //   }, 1000); // Wait 1 second before deleting
      req.processedImages.push(outputPath);
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing images" });
  }
};
module.exports = addWaterMark;
