const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET,
  secure: true
});

const uploadToCloudinary = async (path, folder) => {
  try {
    console.log(path);
    const data = await cloudinary.uploader.upload(path, { folder });
    return { url: data.url, public_id: data.public_id };
  } catch (error) {
    console.log(error);
  }
};

const MultiUploadCloudinary = async (files, folder) => {
  try {
    const uploadedImages = [];
    for (const file of files) {
      const { path } = file;
      const result = await uploadToCloudinary(path, folder); 
      console.log(path,'path');
      console.log(file,'file');
      console.log(result,'result');

      if (result.url) {
        uploadedImages.push(result.url);
      }
    }
    return uploadedImages;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = { uploadToCloudinary, MultiUploadCloudinary };
