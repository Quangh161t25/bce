# Shopee Clone Tool

Extension Chrome chỉ để **sao chép sản phẩm** từ shopee.vn sang shop của bạn, kèm tạo ảnh bìa bằng AI (Gemini / ChatGPT).
Không cần tài khoản bên thứ ba – mọi thao tác dùng chính phiên đăng nhập Shopee của bạn.

## Cài đặt

1. Mở `chrome://extensions`, bật **Developer mode**.
2. **Load unpacked** → chọn thư mục `ShopeeCloneTool`.
3. Đăng nhập `https://banhang.shopee.vn` (shop nhận sản phẩm) và `https://gemini.google.com` (nếu dùng AI).
4. Bấm icon extension → Side Panel mở bên phải.

## Cách dùng

1. Mở trang sản phẩm cần sao chép trên **shopee.vn** (nếu trang đã mở trước khi cài, bấm **F5**). Side Panel tự hiện sản phẩm.
2. Chỉnh tuỳ chọn: cân nặng (mặc định 5000 g), tồn kho (mặc định 1000), tăng giảm giá, SKU…
3. Bấm **Sao chép sang Shopee**. Thành công thì tab sản phẩm mới trên Kênh Người Bán sẽ được mở.

### Ảnh bìa bằng AI

- Dán link **ảnh 1** (ảnh mẫu). **Ảnh 2** là ảnh sản phẩm – bấm ảnh nhỏ để chọn ảnh khác.
- **Mở Gemini / Mở ChatGPT**: mở trang AI, dán sẵn 2 ảnh + prompt, bạn tự bấm gửi.
- Trên Gemini, ảnh tạo xong có nút **📥 Dùng làm ảnh bìa** → ảnh về ô "Ảnh bìa mới khi sao chép".
- **⚡ Tự động**: mở Gemini → tự gửi → chờ ảnh → lấy làm ảnh bìa → tự bấm sao chép. Giữ Side Panel mở trong lúc chạy.
- Không lấy được ảnh từ Gemini? Tải ảnh về máy rồi bấm **Chọn ảnh từ máy**.

## Tuỳ chọn

| Tuỳ chọn | Ý nghĩa |
|---|---|
| Tăng giảm giá | `+10%`, `-5%`, `10%` (= +10%), `+20000`, `-15.000`, `=99000`. Làm tròn tới 100đ |
| Xóa ảnh bìa gốc | Bỏ ảnh đầu tiên của sản phẩm gốc (khi có từ 2 ảnh) |
| Không trùng SP | Dừng nếu shop đã có sản phẩm cùng SKU sản phẩm (mặc định = ID sản phẩm gốc) |
| Giữ tồn kho gốc | Dùng tồn kho của shop gốc nếu đọc được, không thì dùng ô Tồn kho |
| ID sản phẩm mẫu | Sản phẩm trong shop của bạn để lấy **đơn vị vận chuyển**. Để trống = sản phẩm mới nhất |

## Cách hoạt động

- **Đọc sản phẩm nguồn**: khi bạn mở trang shopee.vn, extension đọc lại dữ liệu chi tiết mà chính trang đó tải về (`/api/v4/pdp/get_pc`), không gửi thêm request nào tới Shopee.
- **Tạo sản phẩm**: chạy bên trong tab banhang.shopee.vn (giống ShopeeFlashSaleTool): đọc thuộc tính ngành hàng, lấy vận chuyển từ sản phẩm mẫu, tạo sản phẩm (`create_product_info`).
- Nếu Shopee báo lỗi (ảnh, thương hiệu, thuộc tính, bảng size, video…), extension tự chỉnh và thử lại tối đa 8 lần. Lỗi trùng / giới hạn sản phẩm / thao tác quá nhanh thì dừng và báo.

## Khi có lỗi

- Chuột phải vào Side Panel → **Inspect** → tab **Console**: có log `[Shopee Clone] payload` và `create failed` với phản hồi đầy đủ của Shopee. Chụp lại gửi để chỉnh.
- "thiếu ngành hàng" ở ô sản phẩm: F5 trang shopee.vn rồi thử lại.
