(() => {
  const TITLE = "ĐƠN CHƯA XLY";
  const HEADERS = ["Loại dòng", "Mã gian", "Mã đơn", "Mã kiện", "ID đơn", "Người mua", "Ngày đặt", "Nhóm trạng thái", "Trạng thái", "Tên sản phẩm", "Ảnh", "Tên phân loại", "SKU phân loại", "Số lượng", "Tổng tiền đơn", "Mã vận đơn", "Đơn vị vận chuyển", "Hạn giao", "Hạn giao timestamp", "Cảnh báo", "ID sản phẩm", "ID phân loại", "Đồng bộ lúc"];
  function buildSnapshot(previous, orders, code, at) {
    if (!code) throw new Error("Chưa nhập Mã gian trong Auto In");
    if (previous.length && JSON.stringify(previous[0]) !== JSON.stringify(HEADERS)) throw new Error("Cột sheet ĐƠN CHƯA XLY không đúng cấu trúc; giữ nguyên dữ liệu để kiểm tra");
    const other = previous.slice(1).filter((r) => String(r[1] || "").trim().toUpperCase() !== code.toUpperCase());
    const data = [], keys = new Set();
    for (const r of orders) {
      if (!r.order_sn || !r.package_number || !r.itemRows?.length) throw new Error("Thiếu dữ liệu đơn hoặc sản phẩm; chưa ghi sheet");
      for (const [i, it] of r.itemRows.entries()) {
        const key = `${r.package_number}:${it.itemId || i}:${it.modelId || i}`;
        if (keys.has(key)) throw new Error("Shopee trả dòng sản phẩm trùng; chưa ghi sheet");
        keys.add(key);
        data.push(["ORDER",code,r.order_sn,r.package_number,r.order_id || "",r.buyer || "",r.orderTime || 0,r.stage,r.status || "",it.name || "",it.image || "",it.model || "",it.modelSku || "",it.qty || 1,r.total || 0,r.tracking || "",r.carrier || "",r.ship_by || "",r.shipByTs || 0,r.tag || "",it.itemId || "",it.modelId || "",at]);
      }
    }
    return [HEADERS,...other,["SYNC",code,...Array(20).fill(""),at],...data];
  }
  function parseSnapshot(values) {
    if (!values.length) return {rows:[],at:0};
    if (JSON.stringify(values[0]) !== JSON.stringify(HEADERS)) throw new Error("Cột sheet ĐƠN CHƯA XLY chưa đúng cấu trúc");
    const groups = new Map(); let at = 0;
    for (const r of values.slice(1)) {
      at = Math.max(at, Number(r[22]) || 0);
      if (r[0] !== "ORDER") continue;
      const key = JSON.stringify([r[1],r[2],r[3]]);
      if (!groups.has(key)) groups.set(key,{key,gian:r[1],orderSn:r[2],packageNumber:r[3],orderId:r[4],buyer:r[5],orderTime:Number(r[6]) || 0,stage:Number(r[7]),status:r[8],total:Number(r[14]) || 0,tracking:r[15],carrier:r[16],shipBy:r[17],shipByTs:Number(r[18]) || 0,tag:r[19],at:Number(r[22]) || 0,items:[],itemRows:[]});
      const o = groups.get(key), it = {name:r[9],image:r[10],model:r[11],modelSku:r[12],qty:Number(r[13]) || 1};
      o.itemRows.push(it);o.items.push(`${it.name} ${it.model} ${it.modelSku}`);
    }
    return {rows:[...groups.values()],at};
  }
  globalThis.AutoInOrderSheet = {TITLE,HEADERS,buildSnapshot,parseSnapshot};
})();
