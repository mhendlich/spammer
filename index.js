const WebSocket = require('ws');

var socket = null;
socket = new WebSocket('wss://' + 'pl.g7kk.com' + '/ws');

function put(x, y, color) {
   const b = new Uint8Array(11);
   putUint32(b.buffer, 0, x);
   putUint32(b.buffer, 4, y);
   for (var i = 0; i < 3; i++) {
      b[8 + i] = color[i];
   }
   socket.send(b);
}
function putUint32(b, offset, n) {
   view = new DataView(b);
   view.setUint32(offset, n, false);
}

function sleep(ms) {
   return new Promise(resolve => {
      setTimeout(resolve, ms);
   });
}

function getRandomInt(max) {
   return Math.floor(Math.random() * Math.floor(max));
}

function msToTime(s) {
   // Pad to 2 or 3 digits, default is 2
   function pad(n, z) {
      z = z || 2;
      return ('00' + n).slice(-z);
   }

   var ms = s % 1000;
   s = (s - ms) / 1000;
   var secs = s % 60;
   s = (s - secs) / 60;
   var mins = s % 60;
   var hrs = (s - mins) / 60;

   return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}

// 2048 x 2048

const instances = Number.parseInt(process.argv[2]);
const instanceIndex = Number.parseInt(process.argv[3]);
const startHeight = 11;

const height = 2048 - startHeight;
const effectiveWidth = height / instances;
const fields = height * effectiveWidth;
const intervalTime = 1000 / 7;

socket.on('open', async function open() {
   console.log(`Running instance ${instanceIndex} of ${instances}`);
   let i = 0;
   for (let y = startHeight; y < height; y++) {
      for (let x = instanceIndex; x < height; x += instances) {
         await sleep(intervalTime);

         const r = getRandomInt(256);
         const g = getRandomInt(256);
         const b = getRandomInt(256);

         const progress = ((i / fields) * 100).toFixed(3);
         const remainingTime = (fields - i) * intervalTime;

         if (x == 0) {
            console.log(
               `Starting row ${y}, ${i} out of ${fields} (${progress}%) remaining time: ${msToTime(
                  remainingTime
               )}`
            );
         }

         put(x, y, [r, g, b]);
         i++;
      }
   }
});
