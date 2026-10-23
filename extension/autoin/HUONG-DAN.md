# TOPCARE – Đọc đơn hàng (bản 3.4)

Bảng bên phải trình duyệt (Side Panel) cho shop **topcareplaza**: đọc đơn, tự xác nhận lấy hàng, in phiếu, tải PDF + Excel, nạp Wameli, **tự động chạy nền kể cả khi đóng bảng**, **báo động âm thanh + thông báo góc màn hình**, **tự động bắn thông báo vào Telegram** và **tổng kết cuối ngày lúc 17h & 8h sáng**.

## Cài / cập nhật (Edge / Chrome)
1. Vào `edge://extensions` (hoặc `chrome://extensions`), bật **Chế độ nhà phát triển**.
2. Lần đầu: **Tải tiện ích đã giải nén** → chọn thư mục `extension-doc-don`. Các lần sau: bấm **Tải lại** (icon ↻).
3. Đồng ý các quyền: thông báo, báo thức/hẹn giờ chạy nền, tải xuống, truy cập trang Shopee, Wameli và Telegram API.
4. Bấm icon extension để mở/đóng bảng (trang tự co lại, không bị che).

## Cần mở sẵn
- 1 tab **Kênh Người Bán Shopee** (`banhang.shopee.vn`) đã đăng nhập.
- 1 tab **Wameli** (`phanmem.wameli.vn`) đã đăng nhập.
- Trình duyệt còn mở. **Bảng extension ĐÓNG HAY MỞ thì Tự động vẫn chạy nền liên tục.**

## Các nút trên bảng điều khiển
| Nút | Làm gì |
|---|---|
| Pill Chưa xử lý / Đã xử lý / Chờ lấy hàng / Đang giao | Xem danh sách + số lượng đơn từng trạng thái |
| ↻ Đọc ngay · Tự đọc 1–5 phút | Quét đơn ngay lập tức hoặc chọn chu kỳ tự đọc |
| 🤖 Tự động: BẬT / TẮT | Bật/tắt chế độ tự động chạy nền toàn bộ quy trình (xác nhận, in, tải, nạp Wameli) |
| 📊 Tổng kết | Mở bảng báo cáo tổng kết ngày (số đơn, số phiếu đã in, các khung nạp Wameli, danh sách đơn lỗi ❌, nút sao chép gửi Zalo, nút bắn vào Telegram) |
| ✈️ Telegram | Cài đặt gửi thông báo tự động vào nhóm chat hoặc kênh Telegram (Token, Chat ID, tùy chọn sự kiện, nút gửi thử) |
| ⬇ PDF vừa in | Xem 30 lần in gần nhất, tải lại PDF + Excel; bật/tắt tự tải và tự nạp Wameli |
| 📗 Sheet IN_DON_WML | Mở trực tiếp Google Sheet `IN_DON_WML` trên trình duyệt để kiểm tra, đối soát lịch sử in & nạp Wameli |
| 📋 Quy trình | Xem các bước xử lý + trạng thái cài đặt hiện tại + nút thử chuông |
| ⚡ Chạy lại tất cả / đã chọn (Tab Đã xử lý) | Tự động chạy lại toàn bộ quy trình cho đơn [Đã xử lý]: Lấy MVD → Tạo phiếu in Shopee → Tải PDF & Excel 28 cột → Nạp Wameli → Tự động ghi vào Sheet `IN_DON_WML` |
| Xác nhận lấy hàng (N đơn) | Làm quy trình thủ công cho các đơn đã tick chọn ở tab Chưa xử lý |

---

## Tính năng gửi thông báo vào Telegram (Mới)

Tiện ích có thể tự động gửi toàn bộ diễn biến đơn hàng vào nhóm chat Telegram của bạn hoặc nhân viên:

### 1. Các thông báo Telegram tự động gửi:
- 📦 **Đơn hàng mới**: Gửi ngay khi đơn được tự động xác nhận lấy hàng (Mã đơn, người mua, danh sách sản phẩm, tổng tiền, ĐVVC, mã vận đơn, hạn giao).
- 🚨 **Cảnh báo lỗi khẩn cấp (❌)**: Gửi ngay khi có đơn bị Shopee từ chối (kho nghỉ, thiếu địa chỉ, lỗi in, nạp Wameli thất bại) để bạn mở điện thoại là biết ngay cần xử lý.
- ☁️ **Nạp Wameli thành công**: Báo mã lô/file, khung giờ Wameli (8H, 11H, 13H...) và số lượng đơn.
- 📊 **Báo cáo 17h00 chiều & 8h00 sáng**: Tự động tổng kết số đơn, số phiếu đã in, các khung Wameli và danh sách đơn lỗi gửi thẳng vào nhóm.

### 2. Cách cài đặt Telegram trong 1 phút:
1. Mở Telegram, tìm **@BotFather**, gửi lệnh `/newbot` và đặt tên cho bot → BotFather sẽ gửi cho bạn **HTTP API Token** (dạng `123456789:ABCdefGhI_klmNOP...`).
2. Thêm Bot vừa tạo vào Nhóm chat của bạn (hoặc chat riêng 1-1 với Bot), gửi 1 tin nhắn bất kỳ vào nhóm.
3. Lấy **Chat ID**: Thêm bot **@userinfobot** hoặc **@getmyid_bot** vào nhóm chat → bot sẽ hiện `Chat ID` (ID nhóm có dạng dấu trừ `-1001234567890`, ID cá nhân là số dương).
4. Mở bảng extension, bấm nút **✈️ Telegram**, dán **Bot Token** và **Chat ID**, tick chọn các thông báo muốn nhận rồi bấm **💾 Lưu cài đặt**.
5. Bấm nút **📨 Gửi tin nhắn thử (Test)** để kiểm tra tin nhắn vào nhóm Telegram!

---

## ⚡ Chạy lại đơn "Đã xử lý" & Ghi nhận Google Sheet `IN_DON_WML`

### 1. Chạy lại quy trình cho đơn [Đã xử lý]
Khi đơn hàng đã được xác nhận (hoặc được xác nhận trên Shopee nhưng chưa in / nạp Wameli):
1. Chuyển sang tab **"Đã xử lý"**.
2. Bạn có thể:
   - Bấm **"⚡ Chạy lại tất cả (N)"**: Tiện ích tự động lấy mã vận đơn, tạo phiếu in Shopee, tải PDF & Excel 28 cột, nạp Wameli và đồng bộ vào Sheet cho toàn bộ đơn đã xử lý.
   - Hoặc tick chọn các đơn mong muốn rồi bấm **"⚡ Chạy lại đơn đã chọn (X)"**.
3. Tiến trình xử lý hiển thị trực tiếp trên thanh trạng thái và khung log.

### 2. Ghi nhận lịch sử vào Google Sheet `IN_DON_WML`
Mỗi khi in đơn và nạp Wameli (kể cả tự động chạy nền ở Chưa xử lý hay chạy lại ở Đã xử lý), tiện ích sẽ tự động ghi từng dòng sản phẩm vào tab **`IN_DON_WML`** trên Google Sheet với 19 cột chi tiết:
- `Thời gian in`, `Lô Wameli`, `Khung giờ`, `Kho hàng`, `Mã gian`, `Tên shop`
- `Mã đơn hàng`, `Mã kiện hàng`, `Mã vận đơn`, `Đơn vị vận chuyển`
- `SKU sản phẩm`, `SKU phân loại`, `Tên sản phẩm`, `Số lượng`, `Đơn giá`, `Tổng tiền đơn`
- `Trạng thái Wameli`, `Nguồn xử lý` (Chưa xử lý / Đã xử lý (Chạy lại)), `Ghi chú`

👉 Bấm nút **📗 Sheet IN_DON_WML** trên thanh công cụ bất kỳ lúc nào để mở ngay Google Sheet và đối soát!

---

## 3 Tính năng vận hành tự động

### 1. 🔔 Báo động khi có đơn mới hoặc khi lỗi (Khỏi phải nhìn bảng)
- **Khi có đơn mới được xác nhận thành công**: Chuông **"ting"** trong trẻo + thông báo góc màn hình + bắn tin Telegram.
- **Khi có lỗi (❌)**: Chuông **cảnh báo 2 nốt trầm** + thông báo đỏ góc màn hình + cảnh báo lỗi Telegram.
- Thử âm thanh: 2 nút `🔊 Thử tiếng "Ting"` và `🔊 Thử tiếng lỗi` trong menu `📊 Tổng kết` và `📋 Quy trình`.

### 2. 📊 Tổng kết cuối ngày (Lúc 17h chiều & 8h sáng)
- Đúng **17h00 chiều** và **8h00 sáng**, extension tự động phát chuông nhắc, thông báo góc màn hình và gửi báo cáo tổng kết vào Telegram.
- Có thể bấm nút `📊 Tổng kết` trên thanh công cụ để xem bất cứ lúc nào, sao chép gửi Zalo hoặc bấm `✈️ Bắn vào Telegram` ngay lập tức.

### 3. ⚡ Tự động chạy nền ngay cả khi ĐÓNG BẢNG
- Không cần phải giữ bảng extension luôn mở trên màn hình.
- Miễn trình duyệt còn mở và 2 tab Shopee, Wameli còn đăng nhập, Service Worker sẽ chạy ngầm theo chu kỳ (1, 2, 3 hoặc 5 phút) bằng Chrome Alarms.

---

## Khung giờ nạp Wameli & Gợi ý tự động
Tiện ích tự động tính toán và gợi ý khung giờ nạp Wameli thích hợp nhất theo thời gian thực (mặc định luôn chọn `⚡ Tự động`):

| Giờ hiện tại | Khung giờ gợi ý tự động |
|---|---|
| Trước 8h25 | 8H (Sáng sớm) |
| 8h25 – 9h45 | 11H (Trước trưa) |
| 9h45 – 13h30 | 13H (Đầu chiều) |
| 13h30 – 15h45 | 14H (Chiều) |
| 15h45 – 17h00 | 16H (Cuối chiều) |
| Sau 17h00 | 8H ngày hôm sau |

- Khung đó hôm nay đã **Đã in** (cùng kho) → tự động chuyển sang khung kế tiếp.
- Khung 16H đã in, hoặc sau 17h00 → chuyển sang **8H ngày hôm sau**.

👉 **Tùy chỉnh số giờ in theo ý muốn:**
Mặc định tiện ích chọn `⚡ Tự động (Gợi ý: ...)` nhưng luôn hiển thị gợi ý trực quan để bạn kiểm tra. Bạn có thể bấm vào ô chọn **"⏰ Giờ in Wameli"** trên thanh công cụ hoặc ở các tab Chưa xử lý / Đã xử lý để tự do chọn khung giờ bạn mong muốn (`8H`, `11H`, `13H`, `14H`, `16H`, `8H ngày mai`). Tiện ích sẽ lưu nhớ lựa chọn của bạn.

## Lưu ý
- Xác nhận lấy hàng và nạp Wameli **không hoàn tác được**.
- Muốn in thẳng không cần bấm tay: mở Edge/Chrome bằng shortcut có thêm cờ `--kiosk-printing` (in trực tiếp ra máy in mặc định).
