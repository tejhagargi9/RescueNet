const { v2: cloudinary } = require("cloudinary");
const { Readable } = require("stream");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => { };
  readable.push(buffer);
  readable.push(null);
  return readable;
};

const uploadImage = (imageBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(new Error("Cloudinary upload failed: " + error.message));
        else resolve(result.secure_url);
      }
    );
    bufferToStream(imageBuffer).pipe(uploadStream);
  });
};

module.exports = uploadImage;