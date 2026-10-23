// Đóng gói phần chạy ngầm của Flash Sale Tool (ES module) thành 1 script thường
// để background chính (classic service worker) nạp bằng importScripts.
import { rollup } from 'rollup';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'extension/flash-sale');

const bundle = await rollup({ input: path.join(dir, 'background-entry.js') });
await bundle.write({
  file: path.join(dir, 'fs-background.bundle.js'),
  format: 'iife',
  banner: '// FILE TỰ SINH bởi `npm run build:fs` — không sửa tay, sửa các file nguồn trong extension/flash-sale/'
});
await bundle.close();
console.log('Đã build extension/flash-sale/fs-background.bundle.js');
