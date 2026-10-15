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
npm run build             # build ra dist/ (extension dùng bản này)
npm run build:standalone  # build 1 file HTML duy nhất ra dist-standalone/index.html
npm run serve             # chạy dist/ bằng tools/server.py (cổng 8000)
```

Trong extension, web mở tại `chrome-extension://<id>/dist/index.html`.

## Cấu hình Google

Mọi thông tin service account và Spreadsheet ID mặc định nằm ở `shared/google-config.js`.
Có thể đổi Spreadsheet ID lúc chạy bằng tab Cài đặt (`customSpreadsheetId`).
