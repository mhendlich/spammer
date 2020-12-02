const fetch = require("node-fetch");
const PNG = require("pngjs").PNG;

const host = "pl.g7kk.com";

const numImdices = 2048 * 2048;

(async () => {
  let png;
  const loadImg = async () => {
    const res = await fetch("https://" + host + "/place.png");
    const buffer = await res.buffer();
    png = PNG.sync.read(buffer);
  };

  const accessPixel = idx => {
    return [
      png.data[idx * 4],
      png.data[idx * 4 + 1],
      png.data[idx * 4 + 2],
      png.data[idx * 4 + 3],
    ];
  };

  const pixelIsEmpty = idx =>
    accessPixel(idx).reduce((prev, curr) => (prev += curr)) == 1020;

  const sleep = ms => {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  };

  while (true) {
    await loadImg();

    let nonWhitePixels = 0;
    for (let i = 0; i < numImdices; i++) {
      if (!pixelIsEmpty(i)) {
        nonWhitePixels++;
      }
    }

    const progress = ((nonWhitePixels / numImdices) * 100).toFixed(3);

    console.log(`Cleared: ${nonWhitePixels} (${progress}%)`);

    await sleep(60000);
  }
})();
