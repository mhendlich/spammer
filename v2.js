const fetch = require("node-fetch");
const PNG = require("pngjs").PNG;
const WebSocket = require("ws");

const host = "pl.g7kk.com";

const numImdices = 2048 * 2048;

const ticksPerSecond = process.argv.length > 2 ? process.argv[2] : 3;

const socket = new WebSocket("wss://" + "pl.g7kk.com" + "/ws");

socket.on("open", async () => {
  let png;
  const loadImg = async () => {
    const res = await fetch("https://" + host + "/place.png");
    const buffer = await res.buffer();
    png = PNG.sync.read(buffer);
  };

  await loadImg();

  const accessPixel = idx => {
    return [
      png.data[idx * 4],
      png.data[idx * 4 + 1],
      png.data[idx * 4 + 2],
      png.data[idx * 4 + 3],
    ];
  };

  const clearPixel = idx => {
    png.data[idx * 4] = 0;
    png.data[idx * 4 + 1] = 0;
    png.data[idx * 4 + 2] = 0;
    png.data[idx * 4 + 3] = 0;
  };

  const pixelIsEmpty = idx =>
    accessPixel(idx).reduce((prev, curr) => (prev += curr)) == 1020;

  const getRandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  const sleep = ms => {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  };

  const putUint32 = (b, offset, n) => {
    view = new DataView(b);
    view.setUint32(offset, n, false);
  };
  const put = idx => {
    const x = idx % 2048;
    const y = Math.floor(idx / 2048);
    const color = [getRandomInt(256), getRandomInt(256), getRandomInt(256)];

    const b = new Uint8Array(11);
    putUint32(b.buffer, 0, x);
    putUint32(b.buffer, 4, y);
    for (var i = 0; i < 3; i++) {
      b[8 + i] = color[i];
    }
    socket.send(b);
  };

  let count = 0;
  while (true) {
    await sleep(Math.ceil(1000 / ticksPerSecond));
    let idx;
    do {
      idx = getRandomInt(numImdices);
    } while (!pixelIsEmpty(idx));

    console.log(`Clearing pixel ${idx}, cleared ${count}`);
    clearPixel(idx);
    put(idx);

    count++;
    /* if (count % 1000 == 0) {
      console.log(`reloading image`);
      await loadImg();
    } */
  }
});

socket.on("close", () => {
  console.log("closed");
  process.exit();
});

socket.on("error", () => {
  console.log("errored");
  process.exit();
});
