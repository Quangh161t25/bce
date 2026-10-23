# Shopee Seller Tool

Extension Chrome cho Kênh Người Bán Shopee (banhang.shopee.vn): xem **toàn bộ sản phẩm** của shop và quản lý **Flash Sale của Shop**.

## Cài đặt

1. Mở `chrome://extensions`, bật **Developer mode** (Chế độ nhà phát triển).
2. Bấm **Load unpacked** (Tải tiện ích đã giải nén) → chọn thư mục `ShopeeFlashSaleTool`.
3. Đăng nhập `https://banhang.shopee.vn`.
4. Bấm icon extension → mở trang quản lý. Góc phải phía trên sẽ hiện tên shop nếu kết nối thành công.

## Tính năng

| Tab | Chức năng |
|---|---|
| Sản phẩm | Tải **toàn bộ** sản phẩm của shop (lưu lại để mở nhanh lần sau). Bảng mỗi phân loại một dòng: ID chính, tên, SKU, ID / tên / SKU / ảnh phân loại, ảnh chính, ảnh mô tả, video, giá, giá KM, tồn kho, ngày tạo. Tìm theo tên/ID/SKU; lọc trạng thái & tồn kho; sắp xếp. **🖼 Ảnh & Video** (xem, mở ảnh gốc, copy link). Chọn nhiều để **Thêm vào Flash Sale**, **Xuất Excel (CSV)**, **Xuất link ảnh/video** |
| Danh sách Flash Sale | Xem FS sắp diễn ra / đang diễn ra / đã kết thúc; xem chi tiết; **Nhân bản**; **Sửa SP** (FS sắp diễn ra); **Làm mẫu** tự động |
| Tạo / Sửa Flash Sale | Chọn **nhiều khung giờ**; thêm sản phẩm (tất cả phân loại); đặt giá FS hàng loạt (giảm %, giảm tiền, = giá KM, giá cố định, làm tròn); số lượng & giới hạn mua; kiểm tra lỗi trước khi gửi; báo phân loại bị từ chối |
| Tự động đăng ký | Mẫu tự đăng ký FS vào khung giờ còn trống theo giờ trong ngày, số ngày đăng ký trước, số FS tối đa mỗi lần chạy. Chạy ngầm theo chu kỳ hoặc "Chạy ngay" |
| Nhật ký | Lịch sử đăng ký Flash Sale |

## Cách hoạt động

- Mọi request gọi API Kênh Người Bán, chạy **bên trong tab banhang.shopee.vn** (qua `chrome.scripting`) bằng chính phiên đăng nhập của bạn. Nếu chưa có tab nào, extension tự mở một tab ngầm.
- Chỉ đọc và thao tác dữ liệu **của shop đang đăng nhập**.
- Ảnh/video lấy từ `get_product_info`. Link ảnh: `https://cf.shopee.vn/file/{mã ảnh}`; link video: `https://mms.vod.susercontent.com/file/{đường dẫn}`.
- Chạy ngầm (tự động đăng ký) cần Chrome đang mở và vẫn đăng nhập Kênh Người Bán.

## Gợi ý test

1. **Kết nối**: thấy tên shop ở góc phải.
2. **Sản phẩm**: Tải toàn bộ → so số lượng với Kênh Người Bán; kiểm tra giá, tồn kho, ảnh, video.
3. **Flash Sale**: tạo thử 1 FS ở khung giờ xa nhất với 1–2 sản phẩm → kiểm tra trên Shopee.
4. **Tự động**: Làm mẫu từ 1 FS → bật mẫu, "Tối đa mỗi lần chạy" = 1 → Chạy ngay → xem Nhật ký.

Nếu có lỗi: F12 trên trang quản lý (Console), hoặc `chrome://extensions` → Shopee Seller Tool → **service worker**, chụp lại gửi để chỉnh.

## Lưu ý

- Shopee có điều kiện riêng cho Flash Sale (mức giảm tối thiểu, số lượng, ngành hàng…). Phân loại không đạt sẽ được liệt kê sau khi gửi.
- Chưa có: xoá/tắt Flash Sale, tắt từng sản phẩm trong FS đang chạy.
