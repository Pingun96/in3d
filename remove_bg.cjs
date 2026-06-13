const Jimp = require("jimp");

async function removeBg() {
  // Read the original image
  const image = await Jimp.read("public/benchy.png");
  
  // The background color of the image is at pixel 0,0
  const bgColor = image.getPixelColor(0, 0);
  
  // Tolerance for flood fill / color matching
  const tolerance = 40;
  
  // Iterate through all pixels and make background color transparent
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    const bgR = (bgColor >> 24) & 0xFF;
    const bgG = (bgColor >> 16) & 0xFF;
    const bgB = (bgColor >> 8) & 0xFF;
    
    // Calculate distance
    const dist = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
    
    if (dist < tolerance) {
      this.bitmap.data[idx + 3] = 0; // Alpha = 0
    }
  });

  await image.writeAsync("public/benchy_transparent.png");
  console.log("Background removed!");
}

removeBg().catch(console.error);
