require('dotenv').config();
const {ImageKit} = require('@imagekit/nodejs/index.js');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || undefined,
});

async function uploadFile(fileData, fileName = `image-${Date.now()}.png`) {
  let file;

  if (Buffer.isBuffer(fileData)) {
    file = fileData.toString('base64');
  } else if (typeof fileData === 'string') {
    if (fileData.startsWith('data:')) {
      const parts = fileData.split(',');
      file = parts[1] || '';
    } else {
      file = fileData;
    }
  } else {
    throw new Error('Invalid file data. Must be a Buffer or base64 string');
  }

  const result = await imagekit.files.upload({
    file,
    fileName,
  });

  return result;
}

module.exports = uploadFile;