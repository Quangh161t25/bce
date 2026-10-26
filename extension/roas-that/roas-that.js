// ROAS thật – Shopee Kênh Người Bán
// Tích hợp trong Tiện ích Shopee Quản Lý SP
// Lấy chi phí + doanh số quảng cáo (Dịch vụ Hiển thị) theo ngày và trạng thái cuối của đơn hàng,
// rồi quy đổi ROAS Shopee thành ROAS thật = ROAS Shopee × tỷ lệ doanh số đơn thành công.
(() => {
  if (window.__roasThat) return;
  window.__roasThat = true;

  const ADS_SCALE = 1e5; // tiền trong API quảng cáo nhân 100.000
  const TZ = 7 * 3600; // GMT+7
  const CACHE_KEY = 'roasThat.orders.v1';

  // ---------- API ----------
  const cds = () => (document.cookie.match(/(?:^|;\s*)SPC_CDS=([^;]+)/) || [])[1] || '';
  const qs = () => `?SPC_CDS=${cds()}&SPC_CDS_VER=2`;
  async function post(path, body) {
    const r = await fetch(path + qs(), {
      method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    });
    return r.json();
  }
  async function get(path, query) {
    const r = await fetch(path + qs() + query, { credentials: 'include' });
    return r.json();
  }

  const dayKey = (ts) => new Date((ts + TZ) * 1000).toISOString().slice(0, 10);
  const startOfDay = (ymd) => Date.parse(ymd + 'T00:00:00Z') / 1000 - TZ;

  // Quảng cáo: get_time_graph trả mốc 15 phút; gom lại theo ngày.
  async function fetchAds(start, end, types) {
    const days = {};
    for (const type of types) {
      for (let s = start; s <= end; s += 30 * 86400) {
        const e = Math.min(end, s + 30 * 86400 - 1);
        const r = await post('/api/pas/v1/report/get_time_graph/', {
          start_time: s, end_time: e, agg_interval: 1,
          campaign_type: type, filter_params: { campaign_type: type },
        });
        if (r.code !== 0) throw new Error(`Quảng cáo (${type}): ${r.msg}`);
        for (const row of r.data.report_by_time || []) {
          const m = row.metrics || {};
          const d = (days[dayKey(+row.key)] ||= { cost: 0, gmv: 0, orders: 0, clicks: 0 });
          d.cost += (m.cost || 0) / ADS_SCALE;
          d.gmv += (m.broad_gmv || 0) / ADS_SCALE;
          d.orders += m.broad_order || 0;
          d.clicks += m.click || 0;
        }
      }
    }
    return days;
  }

  // Đơn hàng: duyệt tab "Tất cả" mới nhất trước, dừng khi qua ngày bắt đầu.
  function classify(o) {
    if (o.status === 4) return o.return_id ? 'ret' : 'done';
    if (o.status === 5) return o.logistics_status === 0 || o.logistics_status === 1 ? 'huy' : 'fail';
    return 'pend';
  }
  async function loadCache() {
    try { return (await chrome.storage.local.get(CACHE_KEY))[CACHE_KEY] || {}; } catch { return {}; }
  }
  async function saveCache(c) {
    try { await chrome.storage.local.set({ [CACHE_KEY]: c }); } catch { /* bỏ qua */ }
  }
  async function fetchOrders(start, end, onProgress) {
    const cache = await loadCache();
    const out = [];
    for (let page = 1; page <= 100; page++) {
      const r = await post('/api/v3/order/search_order_list_index', {
        order_list_tab: 100, entity_type: 1,
        pagination: { from_page_number: page, page_number: page, page_size: 40 },
        filter: { fulfillment_type: 0, is_drop_off: 0, fulfillment_source: 0, action_filter: 0 },
        sort: { sort_type: 3, ascending: false },
      });
      if (r.code !== 0) throw new Error('Đơn hàng: ' + (r.message || r.msg || r.code));
      const ids = (r.data.index_list || []).map((x) => x.order_id);
      let oldest = Infinity;
      for (let i = 0; i < ids.length; i += 5) {
        const batch = await Promise.all(ids.slice(i, i + 5).map(async (id) => {
          const hit = cache[id];
          if (hit && hit.final) return hit;
          const d = (await get('/api/v3/order/get_one_order', '&order_id=' + id)).data;
          if (!d) return null;
          const o = { id, ct: d.create_time, total: +d.total_price || 0, cls: classify(d) };
          o.final = o.cls !== 'pend';
          cache[id] = o;
          return o;
        }));
        for (const o of batch) {
          if (!o) continue;
          oldest = Math.min(oldest, o.ct);
          if (o.ct >= start && o.ct <= end) out.push(o);
        }
      }
      onProgress(`Đã đọc ${out.length} đơn trong kỳ (trang ${page})…`);
      if (ids.length < 40 || oldest < start) break;
    }
    await saveCache(cache);
    return out;
  }

  // ---------- Tính toán ----------
  const weekKey = (ymd) => {
    const d = new Date(ymd + 'T00:00:00Z');
    const dow = (d.getUTCDay() + 6) % 7; // thứ Hai = 0
    d.setUTCDate(d.getUTCDate() - dow);
    return 'Tuần ' + d.toISOString().slice(0, 10);
  };
  const monthKey = (ymd) => 'Tháng ' + ymd.slice(5, 7) + '/' + ymd.slice(0, 4);

  function aggregate(ads, orders, mode, shipFee) {
    const keyOf = mode === 'day' ? (k) => k : mode === 'week' ? weekKey : monthKey;
    const rows = {};
    const row = (k) => (rows[k] ||= {
      k, cost: 0, gmv: 0, adOrders: 0, n: 0, done: 0, ret: 0, huy: 0, fail: 0, pend: 0,
      doneG: 0, retG: 0, huyG: 0, failG: 0,
    });
    for (const [d, a] of Object.entries(ads)) {
      const r = row(keyOf(d));
      r.cost += a.cost; r.gmv += a.gmv; r.adOrders += a.orders;
    }
    for (const o of orders) {
      const r = row(keyOf(dayKey(o.ct)));
      r.n++; r[o.cls]++;
      if (o.cls !== 'pend') r[o.cls + 'G'] += o.total;
    }
    return Object.values(rows).sort((a, b) => (a.k < b.k ? -1 : 1)).map((r) => {
      const decidedG = r.doneG + r.retG + r.huyG + r.failG;
      const decidedN = r.done + r.ret + r.huy + r.fail;
      r.rateMin = decidedG ? r.doneG / decidedG : null;
      r.rateMax = decidedG ? (r.doneG + r.retG) / decidedG : null;
      r.roas = r.cost ? r.gmv / r.cost : null;
      // phí ship hoàn ước tính cho phần đơn quảng cáo giao thất bại
      const failShare = decidedN ? r.fail / decidedN : 0;
      const shipLoss = r.adOrders * failShare * shipFee;
      r.realMin = r.cost && r.rateMin != null ? (r.gmv * r.rateMin - shipLoss) / r.cost : null;
      r.realMax = r.cost && r.rateMax != null ? (r.gmv * r.rateMax - shipLoss) / r.cost : null;
      return r;
    });
  }

  // ---------- Giao diện ----------
  const host = document.createElement('div');
  host.id = 'shopee-roas-that-root';
  host.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:2147483646';
  document.documentElement.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
  <style>
    :host{all:initial}
    *{box-sizing:border-box;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}
    .fab{background:linear-gradient(135deg, #1b2a5a, #2b4594);color:#fff;border:2px solid #e6b652;border-radius:24px;padding:9px 15px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;gap:6px;transition:transform .15s,box-shadow .15s}
    .fab:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(0,0,0,.35)}
    .fab span{font-size:15px}
    .panel{position:fixed;left:16px;bottom:70px;width:min(1100px,calc(100vw - 32px));max-height:calc(100vh - 100px);background:#fff;color:#1f2937;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.35);border:1px solid #cbd5e1;display:none;flex-direction:column;overflow:hidden;z-index:2147483647}
    .panel.open{display:flex}
    header{background:linear-gradient(135deg, #1b2a5a, #233876);color:#fff;padding:12px 16px;display:flex;align-items:center;gap:12px}
    header b{flex:1;font-size:15px;letter-spacing:.2px}
    header button{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;padding:0 4px;line-height:1}
    .ctl{display:flex;flex-wrap:wrap;gap:10px;align-items:end;padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;background:#f8fafc}
    .ctl label{display:flex;flex-direction:column;gap:4px;color:#4b5563;font-size:12px;font-weight:600}
    .ctl input{padding:6px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;width:140px;background:#fff;outline:none}
    .ctl input:focus{border-color:#2563eb}
    .btn{padding:7px 15px;border-radius:6px;border:1px solid #1b2a5a;background:linear-gradient(135deg, #1b2a5a, #2b4594);color:#fff;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;box-shadow:0 1px 3px rgba(0,0,0,.15)}
    .btn.alt{background:#fff;color:#1b2a5a;border-color:#cbd5e1}
    .btn:disabled{opacity:.5;cursor:default}
    .tabs{display:flex;gap:6px;padding:10px 16px 0;background:#fff}
    .tab{padding:6px 14px;border-radius:16px;border:1px solid #d1d5db;background:#fff;cursor:pointer;font-size:12.5px;font-weight:600;color:#475569}
    .tab.on{background:#1b2a5a;color:#fff;border-color:#1b2a5a}
    .cards{display:flex;flex-wrap:wrap;gap:10px;padding:12px 16px;background:#fff}
    .card{flex:1;min-width:140px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px}
    .card small{color:#64748b;font-size:11.5px;font-weight:600}
    .card div{font-size:18px;font-weight:800;margin-top:3px;color:#0f172a}
    .status{padding:0 16px 8px;font-size:12px;color:#64748b;font-style:italic}
    .wrap{overflow:auto;padding:0 16px 16px;background:#fff}
    table{border-collapse:collapse;width:100%;font-size:12px}
    th,td{padding:7px 8px;border-bottom:1px solid #eef0f4;text-align:right;white-space:nowrap}
    th{position:sticky;top:0;background:#f1f5f9;color:#334155;font-weight:700}
    td:first-child,th:first-child{text-align:left}
    tr:hover td{background:#f8fafc}
    .bad{color:#dc2626;font-weight:700}.ok{color:#16a34a;font-weight:700}
    .note{font-size:11px;color:#64748b;padding:8px 16px 12px;line-height:1.5;background:#f8fafc;border-top:1px solid #e2e8f0}
  </style>
  <button class="fab"><span>📈</span>ROAS thật</button>
  <div class="panel">
    <header><b>📈 ROAS thật – Dịch vụ Hiển thị Shopee</b><button class="x" title="Đóng">×</button></header>
    <div class="ctl">
      <label>Từ ngày<input type="date" class="from"></label>
      <label>Đến ngày<input type="date" class="to"></label>
      <label>Phí ship hoàn / đơn thất bại (đ)<input type="number" class="ship" value="0" min="0" step="1000"></label>
      <label>ROAS hòa vốn<input type="number" class="be" value="5" min="0" step="0.5"></label>
      <button class="btn run">🚀 Tính ROAS</button>
      <button class="btn alt csv" disabled>📥 Xuất CSV</button>
    </div>
    <div class="tabs"><button class="tab on" data-m="day">Theo Ngày</button><button class="tab" data-m="week">Theo Tuần</button><button class="tab" data-m="month">Theo Tháng</button></div>
    <div class="cards"></div>
    <div class="status">Chọn khoảng ngày rồi bấm "Tính ROAS".</div>
    <div class="wrap"><table></table></div>
    <div class="note">💡 <b>Công thức tính:</b> ROAS thật = (Doanh số quảng cáo × tỷ lệ doanh số đơn thành công trong cùng kỳ − phí ship hoàn ước tính) ÷ chi phí quảng cáo.<br>
      • <b>Mức thấp:</b> chỉ tính đơn hoàn thành không có yêu cầu trả hàng.<br>
      • <b>Mức cao:</b> tính cả đơn hoàn thành có yêu cầu trả hàng.<br>
      <i>Lưu ý: Shopee không gắn nhãn đơn nào sinh ra từ QC, nên tỷ lệ thành công lấy theo toàn shop cùng kỳ. Đơn đang xử lý chưa tính vào tỷ lệ.</i></div>
  </div>`;

  const $ = (s) => root.querySelector(s);
  const panel = $('.panel');
  $('.fab').onclick = () => panel.classList.toggle('open');
  $('.x').onclick = () => panel.classList.remove('open');

  // Lắng nghe lệnh mở từ Extension Sidepanel / Popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg && msg.type === 'ROAS_THAT_OPEN') {
        panel.classList.add('open');
        sendResponse({ ok: true });
      } else if (msg && msg.type === 'ROAS_THAT_TOGGLE') {
        panel.classList.toggle('open');
        sendResponse({ ok: true, open: panel.classList.contains('open') });
      }
    });
  }

  const today = new Date(Date.now() + TZ * 1000);
  const ymd = (d) => d.toISOString().slice(0, 10);
  const y = new Date(today); y.setUTCDate(y.getUTCDate() - 1);
  const f = new Date(today); f.setUTCDate(f.getUTCDate() - 30);
  $('.from').value = ymd(f); $('.to').value = ymd(y);

  let state = null, mode = 'day';
  const vnd = (n) => Math.round(n).toLocaleString('vi-VN');
  const pct = (n) => (n == null ? '–' : (n * 100).toFixed(0) + '%');
  const rs = (n) => (n == null ? '–' : n.toFixed(1));
  const range = (a, b) => (a == null ? '–' : a.toFixed(1) === b.toFixed(1) ? a.toFixed(1) : `${a.toFixed(1)}–${b.toFixed(1)}`);

  function render() {
    if (!state) return;
    const be = +$('.be').value || 0;
    const ship = +$('.ship').value || 0;
    const rows = aggregate(state.ads, state.orders, mode, ship);
    const all = rows.reduce((a, r) => {
      for (const k of ['cost', 'gmv', 'adOrders', 'n', 'done', 'ret', 'huy', 'fail', 'pend', 'doneG', 'retG', 'huyG', 'failG']) a[k] = (a[k] || 0) + r[k];
      return a;
    }, {});
    const decG = all.doneG + all.retG + all.huyG + all.failG;
    const decN = all.done + all.ret + all.huy + all.fail;
    const shipLoss = decN ? all.adOrders * (all.fail / decN) * ship : 0;
    const rMin = all.cost && decG ? (all.gmv * all.doneG / decG - shipLoss) / all.cost : null;
    const rMax = all.cost && decG ? (all.gmv * (all.doneG + all.retG) / decG - shipLoss) / all.cost : null;
    const cls = (v) => (v == null ? '' : v < be ? 'bad' : 'ok');
    $('.cards').innerHTML = `
      <div class="card"><small>Chi phí quảng cáo</small><div>${vnd(all.cost)}đ</div></div>
      <div class="card"><small>Doanh số QC (Shopee)</small><div>${vnd(all.gmv)}đ</div></div>
      <div class="card"><small>ROAS Shopee</small><div>${rs(all.cost ? all.gmv / all.cost : null)}</div></div>
      <div class="card"><small>Tỷ lệ đơn thành công</small><div>${pct(decG ? all.doneG / decG : null)}–${pct(decG ? (all.doneG + all.retG) / decG : null)}</div></div>
      <div class="card"><small>ROAS thật</small><div class="${cls(rMin)}">${range(rMin, rMax ?? rMin)}</div></div>`;
    const head = ['Kỳ', 'Chi QC', 'Đơn QC', 'DS QC', 'ROAS Shopee', 'Đơn shop', 'Xong', 'Trả hàng', 'Hủy', 'Thất bại', 'Chờ', 'Thành công', 'ROAS thật'];
    $('table').innerHTML = '<tr>' + head.map((h) => `<th>${h}</th>`).join('') + '</tr>' + rows.map((r) => `<tr>
      <td>${r.k}</td><td>${vnd(r.cost)}</td><td>${r.adOrders}</td><td>${vnd(r.gmv)}</td><td>${rs(r.roas)}</td>
      <td>${r.n}</td><td>${r.done}</td><td>${r.ret}</td><td>${r.huy}</td><td>${r.fail}</td><td>${r.pend}</td>
      <td>${pct(r.rateMin)}${r.rateMax != null && r.rateMax !== r.rateMin ? '–' + pct(r.rateMax) : ''}</td>
      <td class="${cls(r.realMin)}">${range(r.realMin, r.realMax ?? r.realMin)}</td></tr>`).join('');
    state.rows = rows;
  }

  root.querySelectorAll('.tab').forEach((t) => (t.onclick = () => {
    root.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === t));
    mode = t.dataset.m; render();
  }));
  $('.ship').oninput = render;
  $('.be').oninput = render;

  $('.run').onclick = async () => {
    const start = startOfDay($('.from').value);
    const end = startOfDay($('.to').value) + 86399;
    if (!(end > start)) { $('.status').textContent = 'Khoảng ngày không hợp lệ.'; return; }
    $('.run').disabled = true; $('.csv').disabled = true;
    try {
      $('.status').textContent = 'Đang lấy số liệu quảng cáo…';
      const ads = await fetchAds(start, end, ['new_cpc_homepage']);
      $('.status').textContent = 'Đang lấy đơn hàng…';
      const orders = await fetchOrders(start, end, (m) => ($('.status').textContent = m));
      state = { ads, orders };
      render();
      $('.status').textContent = `Xong: ${orders.length} đơn, ${Object.keys(ads).length} ngày có quảng cáo. Cập nhật ${new Date().toLocaleString('vi-VN')}.`;
      $('.csv').disabled = false;
    } catch (e) {
      $('.status').textContent = 'Lỗi: ' + e.message + ' (hãy chắc chắn đang đăng nhập Kênh Người Bán).';
    } finally {
      $('.run').disabled = false;
    }
  };

  $('.csv').onclick = () => {
    if (!state?.rows) return;
    const head = ['ky', 'chi_qc', 'don_qc', 'ds_qc', 'roas_shopee', 'don_shop', 'xong', 'tra_hang', 'huy', 'that_bai', 'cho', 'ty_le_tc_min', 'ty_le_tc_max', 'roas_that_min', 'roas_that_max'];
    const lines = state.rows.map((r) => [r.k, Math.round(r.cost), r.adOrders, Math.round(r.gmv), r.roas?.toFixed(2) ?? '', r.n, r.done, r.ret, r.huy, r.fail, r.pend,
      r.rateMin?.toFixed(3) ?? '', r.rateMax?.toFixed(3) ?? '', r.realMin?.toFixed(2) ?? '', r.realMax?.toFixed(2) ?? ''].join(','));
    const blob = new Blob(['\ufeff' + [head.join(','), ...lines].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `roas-that-${mode}-${$('.from').value}_${$('.to').value}.csv`;
    a.click();
  };
})();
