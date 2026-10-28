(() => {
function variationSku(description) {
  const inside = String(description || "").match(/\[([^\]]*)\]\s*$/)?.[1] || "";
  return inside.match(/(?:^|\s)([A-Za-z]*\d[A-Za-z0-9]*-\S.*)$/)?.[1]?.trim() || "";
}

const skuText = (v) => String(v ?? "").normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi-VN");
const skuPair = (name, model) => JSON.stringify([skuText(name), skuText(model)]);
function fillSkusFromSheet(orderRows, values, shopCode) {
  const header = (values[0] || []).map((v) => skuText(v).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d"));
  const col = (names, fallback) => { const i = header.findIndex((h) => names.includes(h)); return i < 0 ? fallback : i; };
  const pn = col(["ten san pham", "ten sp"], 1), vn = col(["ten phan loai", "ten phan loai hang"], 3);
  const sk = col(["sku", "sku phan loai", "sku phan loai hang", "ma sku"], 5);
  const gian = col(["gian", "ma gian", "ma_gian"], 11);
  const all = new Map(), local = new Map();
  const add = (map, key, sku) => { if (!map.has(key)) map.set(key, new Set()); map.get(key).add(sku); };
  for (const r of values.slice(1)) {
    const sku = String(r[sk] || "").trim();
    if (!sku || !skuText(r[pn])) continue;
    const key = skuPair(r[pn], r[vn]);
    add(all, key, sku);
    if (skuText(shopCode) && skuText(r[gian]) === skuText(shopCode)) add(local, key, sku);
  }
  for (const r of orderRows) for (const it of r.itemRows || []) {
    if (it.modelSku) continue;
    const key = skuPair(it.name, it.model), matches = local.get(key) || all.get(key);
    if (matches?.size === 1) it.modelSku = [...matches][0];
  }
}

self.AutoInSku = { variationSku, skuPair, fillSkusFromSheet };
})();
