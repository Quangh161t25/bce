# Extension "ROAS thật – Shopee"

Tính ROAS thật của Dịch vụ Hiển thị Shopee sau khi trừ đơn hủy, giao thất bại và trả hàng. Xem theo ngày, tuần hoặc tháng.

## Cài đặt (Chrome)
1. Mở `chrome://extensions`.
2. Bật **Chế độ dành cho nhà phát triển** (góc phải trên).
3. Bấm **Tải tiện ích đã giải nén** và chọn thư mục `extension-roas-that`.
4. Mở hoặc tải lại `https://banhang.shopee.vn` (đã đăng nhập shop). Nút **ROAS thật** hiện ở góc trái dưới.

## Dùng
- Chọn **Từ ngày / Đến ngày** (mặc định 30 ngày gần nhất), bấm **Tính**.
- Chuyển tab **Ngày / Tuần / Tháng**.
- **Phí ship hoàn / đơn thất bại**: nhập nếu muốn trừ phí ship chiều về.
- **ROAS hòa vốn**: ROAS thật dưới mức này hiện màu đỏ (ví dụ biên lợi nhuận 20% → hòa vốn 5).
- **Xuất CSV** để mở bằng Excel.

## Cách tính
- Quảng cáo: chi phí, đơn, doanh số theo từng ngày (Shopee trả mốc 15 phút, extension cộng lại theo ngày GMT+7).
- Đơn hàng: trạng thái cuối của mọi đơn tạo trong kỳ:
  - Xong: đã hoàn thành, không có yêu cầu trả hàng
  - Trả hàng: hoàn thành nhưng có yêu cầu trả hàng
  - Hủy: hủy trước khi gửi
  - Thất bại: hủy/giao thất bại sau khi đã gửi
  - Chờ: đang xử lý (chưa tính vào tỷ lệ)
- Tỷ lệ thành công = doanh số đơn Xong ÷ doanh số đơn đã có kết quả (mức cao cộng thêm đơn Trả hàng).
- **ROAS thật = (Doanh số QC × tỷ lệ thành công − phí ship hoàn ước tính) ÷ Chi phí QC.**

## Giới hạn
- Shopee không cho biết đơn nào đến từ quảng cáo, nên tỷ lệ thành công lấy theo toàn shop trong cùng kỳ.
- Chỉ tính quảng cáo sản phẩm (chiến dịch trên trang Dịch vụ Hiển thị, loại `new_cpc_homepage`).
- Ngày gần đây còn nhiều đơn "Chờ" nên ROAS thật của các ngày đó chưa chắc chắn.
- Trạng thái đơn đã kết thúc được lưu đệm trong trình duyệt; lần tính sau nhanh hơn.
- Extension chỉ đọc số liệu, không thay đổi gì trên shop.
