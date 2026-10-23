import fs from 'fs';
import zlib from 'zlib';

// CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const buf = Buffer.alloc(8 + data.length + 4);
  buf.writeUInt32BE(data.length, 0);
  typeBuf.copy(buf, 4);
  data.copy(buf, 8);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  buf.writeUInt32BE(crc, 8 + data.length);
  return buf;
}

function encodePng(width, height, rgbaBuffer) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  const stride = width * 4;
  const scanlines = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (stride + 1)] = 0;
    rgbaBuffer.copy(scanlines, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function decodePng(buf) {
  let pos = 8;
  const idatParts = [];
  let width = 0, height = 0;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idatParts.push(buf.subarray(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const decomp = zlib.inflateSync(Buffer.concat(idatParts));
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const filter = decomp[y * stride];
    const srcRow = decomp.subarray(y * stride + 1, (y + 1) * stride);
    const dstRow = raw.subarray(y * width * 4, (y + 1) * width * 4);
    const prevDstRow = y > 0 ? raw.subarray((y - 1) * width * 4, y * width * 4) : null;
    for (let x = 0; x < width * 4; x++) {
      const a = x >= 4 ? dstRow[x - 4] : 0;
      const b = prevDstRow ? prevDstRow[x] : 0;
      const c = (x >= 4 && prevDstRow) ? prevDstRow[x - 4] : 0;
      let val = srcRow[x];
      if (filter === 1) val = (val + a) & 0xff;
      else if (filter === 2) val = (val + b) & 0xff;
      else if (filter === 3) val = (val + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        val = (val + pr) & 0xff;
      }
      dstRow[x] = val;
    }
  }
  return { width, height, raw };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// 1. Transform main extension icons (extension/icons/icon-*.png)
export function transformMainIcon(filePath) {
  const buf = fs.readFileSync(filePath);
  const { width, height, raw } = decodePng(buf);
  const out = Buffer.alloc(width * height * 4);
  const r = Math.round(width * 0.20); // 20% squircle radius

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const origR = raw[idx], origG = raw[idx+1], origB = raw[idx+2], origA = raw[idx+3];

      // Foreground lightness w (0 = background, 1 = white)
      const w = Math.max(0, Math.min(1, (origG - 77) / (255 - 77)));

      // Diagonal gradient: #0ea5e9 (14, 165, 233) to #1d4ed8 (29, 78, 216)
      const d = (x / width + y / height) / 2;
      const bgR = Math.round(14 * (1 - d) + 29 * d);
      const bgG = Math.round(165 * (1 - d) + 78 * d);
      const bgB = Math.round(233 * (1 - d) + 216 * d);

      const newR = Math.round(bgR * (1 - w) + 255 * w);
      const newG = Math.round(bgG * (1 - w) + 255 * w);
      const newB = Math.round(bgB * (1 - w) + 255 * w);

      // Squircle corner alpha
      const px = x + 0.5, py = y + 0.5;
      const qx = Math.max(0, Math.abs(px - width / 2) - (width / 2 - r));
      const qy = Math.max(0, Math.abs(py - height / 2) - (height / 2 - r));
      const dist = Math.sqrt(qx * qx + qy * qy);
      const cornerAlpha = Math.max(0, Math.min(1, r + 0.5 - dist));
      const finalA = Math.round(origA * cornerAlpha);

      out[idx] = newR;
      out[idx+1] = newG;
      out[idx+2] = newB;
      out[idx+3] = finalA;
    }
  }

  const encoded = encodePng(width, height, out);
  fs.writeFileSync(filePath, encoded);
  console.log(`[OK] Updated ${filePath} (${width}x${height}) -> Modern Blue Squircle`);
}

// 2. Transform general icons with red/orange badge (hue shift)
export function transformBadgeIcon(filePath, targetHueDeg = 212) {
  if (!fs.existsSync(filePath)) return;
  const buf = fs.readFileSync(filePath);
  const { width, height, raw } = decodePng(buf);
  const out = Buffer.alloc(width * height * 4);

  const targetH = targetHueDeg / 360;

  for (let i = 0; i < raw.length; i += 4) {
    const origR = raw[i], origG = raw[i+1], origB = raw[i+2], origA = raw[i+3];
    if (origA === 0) {
      out[i] = origR; out[i+1] = origG; out[i+2] = origB; out[i+3] = 0;
      continue;
    }

    const [h, s, l] = rgbToHsl(origR, origG, origB);
    const deg = (h * 360) % 360;

    // Detect red / orange / warm colors (340° to 45°) with significant saturation
    if ((deg >= 340 || deg <= 45) && s > 0.15) {
      // Calculate how close to red/orange (blend factor)
      const [newR, newG, newB] = hslToRgb(targetH, s, l);
      out[i] = newR;
      out[i+1] = newG;
      out[i+2] = newB;
      out[i+3] = origA;
    } else {
      out[i] = origR;
      out[i+1] = origG;
      out[i+2] = origB;
      out[i+3] = origA;
    }
  }

  const encoded = encodePng(width, height, out);
  fs.writeFileSync(filePath, encoded);
  console.log(`[OK] Updated ${filePath} (${width}x${height}) -> Hue shifted to Blue (${targetHueDeg}°)`);
}

// Run for all icon files
const mainIcons = [
  'extension/icons/icon-16.png',
  'extension/icons/icon-32.png',
  'extension/icons/icon-48.png',
  'extension/icons/icon-128.png'
];

for (const p of mainIcons) {
  transformMainIcon(p);
}

const badgeIcons = [
  'extension/flash-sale/icon.png',
  'extension/clone-tool/icon.png',
  'extension/order-tool/icon.png',
  'extension/autoin/icon.png',
  'extension/tai-anh-shopee/icons/16.png',
  'extension/tai-anh-shopee/icons/32.png',
  'extension/tai-anh-shopee/icons/48.png',
  'extension/tai-anh-shopee/icons/64.png',
  'extension/tai-anh-shopee/icons/128.png',
  'extension/tai-anh-shopee/assets/logo.a014a831.png'
];

for (const p of badgeIcons) {
  transformBadgeIcon(p);
}
console.log('All icons converted to Blue successfully!');
