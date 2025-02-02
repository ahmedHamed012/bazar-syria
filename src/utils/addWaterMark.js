const fs = require("fs");
const sharp = require("sharp");

const addWaterMark = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }

    const watermarkPath = "./public/logo.png";
    req.processedImages = [];

    // Load and resize the watermark once for efficiency
    const watermark = await sharp(watermarkPath)
      .resize(100, 100)
      .grayscale()
      .modulate({ brightness: 1, saturation: 0.2, lightness: 1 })
      .png({ alphaQuality: 50 })
      .toBuffer();

    // Iterate over each file field (like identificationFront, etc.)
    for (const field in req.files) {
      for (const file of req.files[field]) {
        const imagePath = file.path;
        const outputPath = `./public/watermarked/${Date.now()}_${
          file.originalname
        }`;

        await sharp(imagePath)
          .composite([{ input: watermark, gravity: "southeast" }]) // Apply watermark
          .toFile(outputPath);

        // Optionally delete the original file
        // setTimeout(async () => {
        //   try {
        //     await fs.promises.unlink(imagePath);
        //   } catch (unlinkErr) {
        //     console.error("Error deleting original file:", unlinkErr);
        //   }
        // }, 1000); // Wait 1 second before deleting

        req.processedImages.push(outputPath);
      }
    }

    next();
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ message: "Error processing images" });
  }
};
module.exports = addWaterMark;
