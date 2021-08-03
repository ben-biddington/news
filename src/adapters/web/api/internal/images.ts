const Jimp = require('jimp');

// [i] https://ahmadawais.com/resize-optimize-images-javascript-node/
export const resize = async (opts) => {  
  const { sourceFileBuffer, width } = opts;

  const image = await Jimp.read(sourceFileBuffer);
  await image.resize(width, Jimp.AUTO);
  await image.quality(100);
  return image.getBufferAsync(Jimp.MIME_PNG);
}