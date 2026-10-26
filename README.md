# Shopee Quản Lý SP

Một dự án gồm **Chrome Extension** hỗ trợ Shopee Kênh Người Bán và **Web BCE** (React) quản lý đơn hàng / sản phẩm / tính giá. Dữ liệu dùng chung qua Google Sheets.

## Cấu trúc

```
exten them sp12/              ← thư mục "Load unpacked" trong Chrome (giữ nguyên để không đổi ID extension)
├─ manifest.json              ← manifest của extension
├─ package.json, vite.config.js
├─ shared/
│  └─ google-config.js        ← cấu hình Google Service Account DUY NHẤT (extension + web cùng dùng)
├─ extension/
│  ├─ background.js           ← service worker (Google Sheets, upload ảnh, alarm)
│  ├─ popup/                  ← side panel: popup.html, popup.js, popup.css
│  │  ├─ tabs/                ← mỗi tab một file *_tab.js
│  │  └─ images/
│  ├─ content/                ← content script: Shopee, ChatGPT, Gemini, Wameli...
│  ├─ lib/                    ← xlsx, pdf-lib, html2pdf, jsrsasign
│  ├─ pages/camera.html
│  ├─ tai-anh-shopee/         ← module tải ảnh Shopee
│  ├─ flash-sale/             ← Flash Sale Tool: app.html (quản lý SP & Flash Sale) + tự động đăng ký
│  ├─ order-tool/             ← Order Tool: app.html (đơn Shopee, In phiếu + Wameli) + wameli.html
│  ├─ hub/                    ← Seller Hub: 1 trang gộp Flash Sale + Order Tool, menu bên trái
│  ├─ autoin/                 ← AutoIn (TOPCARE – Đọc đơn hàng): tự xác nhận lấy hàng, in phiếu, nạp Wameli, Telegram
│  ├─ clone-tool/             ← Sao chép sản phẩm (Shopee Clone Tool): sao chép SP shopee.vn sang shop + ảnh bìa AI
│  └─ icons/
├─ web/                       ← nguồn Web BCE (React + Vite)
│  ├─ index.html
│  └─ src/
├─ dist/                      ← bản build của web (extension mở dist/index.html)
├─ tools/server.py            ← server chạy web độc lập + proxy tìm ảnh Bing
└─ archive/                  ← code cũ không còn dùng (giữ lại để tham khảo)
```

## Cài extension

1. `chrome://extensions` → bật **Developer mode** → **Load unpacked** → chọn thư mục gốc dự án.
2. Sau khi sửa code extension: bấm **Reload** trên thẻ extension.

## Web BCE

```bash
npm install
npm run dev               # chạy dev tại http://localhost:5173
npm run build             # build web ra dist/ + đóng gói background Flash Sale
npm run build:fs          # chỉ đóng gói background Flash Sale
npm run build:standalone  # build 1 file HTML duy nhất ra dist-standalone/index.html
npm run serve             # chạy dist/ bằng tools/server.py (cổng 8000)
```

Trong extension, web mở tại `chrome-extension://<id>/dist/index.html`.

### Tab CHỜ LẤY HÀNG (đọc đơn Shopee trực tiếp)

- Tab **CHỜ LẤY HÀNG** trong sidebar đọc đơn Shopee **thời gian thực**, không qua Google Sheets.
- Dữ liệu lấy từ đúng đường API của AutoIn: background nhận message `autoin-cho-lay-hang`
  (`extension/autoin/background.js`) rồi gọi `bgFetchIndex` + `bgFetchCards`
  (`order_list_tab: 300`, `order_to_ship_status: 1` = Chưa xử lý, `2` = Đã xử lý).
- Yêu cầu: có 1 tab `https://banhang.shopee.vn/` đang đăng nhập Kênh Người Bán (background gọi API qua tab này).
- Web chạy được ở **2 nơi**:
  1. **Trong extension** — `chrome-extension://<id>/dist/index.html` (nút **🌐 Web** ở side panel mở sẵn tab này).
     Gọi background bằng `chrome.runtime.sendMessage` thường.
  2. **Web đã deploy** (Vercel/Netlify/Cloudflare Pages/tên miền riêng) — trang web gọi background bằng
     `chrome.runtime.sendMessage(EXTENSION_ID, …)`; cần khai báo domain trong `externally_connectable`
     của `manifest.json` rồi **Reload extension**.
- Deploy: repo có sẵn `vercel.json` nên **Vercel tự build** (`npm ci` → `npm run build` → `dist`).
  Trên Vercel: **Add New → Project → Import Git Repository** → chọn repo này → **Deploy**.
  Sau khi deploy:
  1. Domain `*.vercel.app` đã có sẵn trong `externally_connectable.matches` của `manifest.json`.
     Dùng tên miền riêng thì thêm `"https://domain-cua-ban/*"` vào đó.
  2. Reload extension ở `chrome://extensions` (chỉ cần 1 lần sau khi đổi manifest).
  3. Mở `https://<domain>/?tab=CHO_LAY_HANG` — chip **Extension đã kết nối** là đọc được đơn;
     nếu chip đỏ, banner ghi rõ "chưa cài" / "cần reload" kèm lỗi gốc.
  - GitHub Pages cũng đã bật sẵn qua `.github/workflows/pages.yml` (deploy `dist/` khi push `main`).
- Đổi ID extension: sửa `EXTENSION_ID` trong `web/src/services/shopeeLiveOrders.js` (hoặc mở web với `?ext=<id>`).
- Tự động làm mới 30 giây/lần (chọn 15 giây → 5 phút, hoặc Tắt); có tìm kiếm, lọc nhóm trạng thái,
  sắp xếp theo hạn gửi / tổng tiền, và nút **Kênh Người Bán** để mở tab Shopee.
- Sửa code web: `npm run build`. Sửa background AutoIn / manifest: chỉ cần Reload extension.

## Cấu hình Google

Mọi thông tin service account và Spreadsheet ID mặc định nằm ở `shared/google-config.js`.
Có thể đổi Spreadsheet ID lúc chạy bằng tab Cài đặt (`customSpreadsheetId`).

## Flash Sale Tool

- Mở từ side panel: tab **🔥 Flash Sale** → **Mở trang quản lý Flash Sale** (`extension/flash-sale/app.html`).
- Giao diện (`app.js`, `products-tab.js`…) là ES module, sửa xong chỉ cần Reload extension.
- Phần chạy ngầm (`background-entry.js`, `scheduler.js`, `storage.js`, `shopee-api.js`, `flashsale.js`) được đóng gói
  thành `fs-background.bundle.js` để background chính nạp bằng `importScripts`.
  **Sửa các file này xong phải chạy `npm run build:fs`** rồi Reload extension.
- Dữ liệu lưu với khóa `fs_*` (fs_settings, fs_rules, fs_logs, fs_productCache, fs_mediaCache_v3).

## Order Tool

- Mở từ side panel: tab **📦 Đơn Tool** → **Mở quản lý đơn Shopee** (`extension/order-tool/app.html`)
  hoặc **Mở Đơn & Sản phẩm Wameli** (`extension/order-tool/wameli.html`).
- Toàn bộ là ES module chạy trong trang, không có phần chạy ngầm: sửa xong chỉ cần Reload extension.
- Hướng dẫn chi tiết các chức năng: `extension/order-tool/README.md`.
- Dữ liệu đơn lưu trong IndexedDB `ShopeeOrderToolDB`; cài đặt lưu trong chrome.storage
  (arrangePickupAddress, shipWameliPrefs, shipWameliSeq, wameliUploadForm, wameliUploadPrefs, wameliUser, wameliPass).

## Seller Hub (trang chung)

- `extension/hub/index.html`: menu bên trái (Flash Sale: Sản phẩm, Danh sách, Tạo/Sửa, Tự động đăng ký, Nhật ký;
  Đơn hàng: Đơn Shopee, Đơn xuất kho WML, Sản phẩm WML), bên phải là trang của từng tool trong iframe (nạp 1 lần, giữ trạng thái).
- Nút mở Flash Sale / Đơn Tool trong side panel đều mở trang này (`?m=fs-list`, `?m=order-shopee`...).
- Trang tool nằm trong hub thì ẩn thanh tab cũ (`extension/hub/embed.js` gắn class `embedded`).

## Sao chép sản phẩm (Shopee Clone Tool)

- Side panel → tab **Sao chép sản phẩm**: nhúng `extension/clone-tool/app.html` (nạp khi mở tab lần đầu).
- Content script: `clone-tool/content/shopee-hook.js` + `shopee-relay.js` (shopee.vn, đọc dữ liệu sản phẩm trang tự tải),
  `clone-tool/content/ai-chat.js` (Gemini / ChatGPT: dán ảnh + prompt, lấy ảnh bìa).
- Phần chạy ngầm `clone-tool/background.js` là script thường, background chính nạp bằng `importScripts` (không cần build).
- Hướng dẫn chi tiết: `extension/clone-tool/README.md`.

## AutoIn (TOPCARE – Đọc đơn hàng)

- Side panel → tab **AutoIn**: nhúng `extension/autoin/panel.html` (nạp khi mở tab lần đầu).
- Phần chạy ngầm `autoin/background.js` (script thường, bọc IIFE) được background chính nạp bằng `importScripts`:
  đọc đơn theo chu kỳ, tự xác nhận lấy hàng, in phiếu, tải PDF + Excel vào `TOPCARE-phieu-in/`, nạp Wameli,
  báo âm thanh (`autoin/offscreen.html`, quyền `offscreen`), gửi Telegram, tổng kết 17h & 8h.
- Bản gốc: `archive/extension-doc-don-original/`. Hướng dẫn chi tiết: `extension/autoin/HUONG-DAN.md`.
