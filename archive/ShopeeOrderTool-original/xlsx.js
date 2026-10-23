// Đọc file Excel (.xlsx) ngay trong trình duyệt, không cần thư viện ngoài.
// .xlsx là file zip chứa XML: giải nén bằng DecompressionStream rồi đọc sheet đầu tiên.

async function unzip(buf) {
  const dv = new DataView(buf);
  let eocd = buf.byteLength - 22;
  while (eocd >= 0 && dv.getUint32(eocd, true) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('File không phải Excel (.xlsx)');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const files = {};
  for (let i = 0; i < count; i++) {
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true);
    const elen = dv.getUint16(p + 30, true);
    const clen = dv.getUint16(p + 32, true);
    const off = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(new Uint8Array(buf, p + 46, nlen));
    const lnlen = dv.getUint16(off + 26, true);
    const lelen = dv.getUint16(off + 28, true);
    const data = new Uint8Array(buf, off + 30 + lnlen + lelen, csize);
    if (/^(xl\/sharedStrings\.xml|xl\/workbook\.xml|xl\/worksheets\/sheet\d*\.xml)$/.test(name)) {
      files[name] = method === 0
        ? data
        : new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    }
    p += 46 + nlen + elen + clen;
  }
  return files;
}

// "AB12" -> 27 (chỉ số cột bắt đầu từ 0)
function colIndex(ref) {
  const letters = (ref.match(/^[A-Z]+/) || ['A'])[0];
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

// Trả mảng các dòng, mỗi dòng là mảng ô (chuỗi) của sheet đầu tiên.
export async function readXlsx(arrayBuffer) {
  const files = await unzip(arrayBuffer);
  const dec = (u) => new TextDecoder().decode(u);
  const xml = (u) => new DOMParser().parseFromString(dec(u), 'application/xml');
  const shared = files['xl/sharedStrings.xml']
    ? [...xml(files['xl/sharedStrings.xml']).getElementsByTagName('si')].map((si) => si.textContent)
    : [];
  const sheetName = Object.keys(files).filter((n) => n.startsWith('xl/worksheets/')).sort()[0];
  if (!sheetName) throw new Error('Không tìm thấy sheet trong file');
  const doc = xml(files[sheetName]);
  return [...doc.getElementsByTagName('row')].map((r) => {
    const out = [];
    for (const c of r.getElementsByTagName('c')) {
      const i = c.getAttribute('r') ? colIndex(c.getAttribute('r')) : out.length;
      const v = c.getElementsByTagName('v')[0];
      const is = c.getElementsByTagName('is')[0];
      let val = '';
      if (c.getAttribute('t') === 's' && v) val = shared[Number(v.textContent)] ?? '';
      else if (v) val = v.textContent;
      else if (is) val = is.textContent;
      out[i] = val;
    }
    for (let i = 0; i < out.length; i++) if (out[i] === undefined) out[i] = '';
    return out;
  });
}

export function base64ToBuffer(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// Tìm dòng tiêu đề: dòng đầu tiên có từ 3 ô chữ trở lên
export function splitHeader(rows) {
  const idx = rows.findIndex((r) => r.filter((v) => String(v).trim() && !/^\d+([.,]\d+)?$/.test(String(v).trim())).length >= 3);
  if (idx === -1) return { head: rows[0] || [], rows: rows.slice(1) };
  return { head: rows[idx].map((h) => String(h).trim()), rows: rows.slice(idx + 1).filter((r) => r.some((v) => String(v).trim())) };
}
