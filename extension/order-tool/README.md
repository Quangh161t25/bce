# Shopee Order Tool

Extension Chrome xem và xuất **toàn bộ thông tin đơn hàng của shop bạn** trên Kênh Người Bán Shopee (banhang.shopee.vn).

## Cài đặt

1. Mở `chrome://extensions`, bật **Developer mode**.
2. **Load unpacked** → chọn thư mục `ShopeeOrderTool`.
3. Đăng nhập `https://banhang.shopee.vn`.
4. Bấm icon extension → mở trang quản lý đơn. Góc phải hiện tên shop nếu kết nối thành công.

Có thể cài song song với Shopee Seller Tool, hai extension không ảnh hưởng nhau.

## Tính năng

- **Tải đơn theo trạng thái** (Tất cả, Chờ xác nhận, Chờ lấy hàng, Đang giao, Đã giao, Đơn huỷ, Trả hàng/Hoàn tiền, hoặc mã tab tự nhập), giới hạn số đơn, có nút Dừng.
- **Bảng đơn hàng** (mỗi sản phẩm một dòng): mã đơn, ngày đặt, người mua, trạng thái, sản phẩm (ảnh + tên), phân loại, SKU, số lượng, đơn giá, tổng đơn, thanh toán, vận chuyển, mã vận đơn, ghi chú.
- **Thống kê**: số đơn, tổng tiền, số sản phẩm bán, giá trị trung bình/đơn, số người mua.
- **Lọc**: tìm mã đơn / người mua / sản phẩm / SKU / mã vận đơn; lọc theo ngày; sắp xếp.
- **Chi tiết đơn**: tóm tắt + **toàn bộ dữ liệu gốc** của đơn (mọi trường Shopee trả về), nút Copy JSON.
- **Sản phẩm bán chạy** trong các đơn đang lọc.
- **Xuất Excel (CSV)** và **Xuất JSON đầy đủ**. Tuỳ chọn "Kèm thông tin người mua" (bỏ tích để loại tên/ID/địa chỉ người mua khỏi file).

## Cách hoạt động

- Gọi API Kênh Người Bán bên trong tab banhang.shopee.vn bằng phiên đăng nhập của bạn:
  - `POST /api/v3/order/search_order_list_index` — danh sách mã đơn theo trạng thái.
  - `POST /api/v3/order/get_order_list_card_list` — chi tiết đơn (5 đơn / lần).
- Các trường (mã đơn, sản phẩm, tiền, vận chuyển…) được **tự dò** trong dữ liệu đơn; dữ liệu gốc luôn được giữ nguyên để xem/xuất đầy đủ.
- Dữ liệu đơn hàng được lưu tự động trên trình duyệt (IndexedDB). Khi bấm "Tải đơn hàng", công cụ sẽ kiểm tra và chỉ tải các đơn mới chưa lưu, tối đa theo số đơn bạn chọn. Có nút "Xoá đơn đã lưu" để làm mới nếu muốn.

## Gợi ý test & báo lỗi

1. Chọn "Đã giao", tối đa 100 đơn → Tải đơn hàng.
2. Đối chiếu vài đơn với Kênh Người Bán: mã đơn, sản phẩm, số lượng, tổng tiền, vận chuyển.
3. Thử lần lượt từng trạng thái xem có đúng loại đơn không (mã trạng thái 100–700 là dự đoán).

Nếu cột nào trống / sai: bấm **Chi tiết** ở đơn đó → **Copy JSON** → gửi lại (có thể xoá tên/SĐT/địa chỉ người mua trước khi gửi) để chỉnh cho khớp.

## Lưu ý

- Thông tin người mua là dữ liệu cá nhân của khách hàng: chỉ dùng để xử lý đơn, hạn chế chia sẻ file xuất.

## Trang "Đơn Wameli" (đơn xuất kho trên phanmem.wameli.vn)

Mở bằng nút **🏬 Đơn Wameli** trên thanh đầu trang (hệ thống tự động đăng nhập tài khoản Admin `Admin` / `wameli2026abc` khi chưa đăng nhập hoặc hết phiên).

- **Chọn Từ ngày / Đến ngày** (và từ khoá nếu cần) → **Lấy đơn**.
- **Cách lấy**:
  - **Xuất Excel Misa / File Nhặt (nhanh)**: extension áp bộ lọc rồi yêu cầu Wameli xuất file Excel (1 request), đọc file ngay trong trình duyệt.
  - **Đọc từng trang (chậm)**: đọc bảng 30 dòng/trang, **tuần tự, nghỉ ≥ 3 giây giữa các trang**, giới hạn số trang. Wameli xử lý từng request một và dễ chặn (403) khi gọi dồn dập.
- Gặp lỗi (403, quá thời gian chờ…) extension **dừng hẳn**, không thử lại. Đợi 15–30 phút rồi thử lại.
- **Dự phòng**: tự bấm xuất Excel trên Wameli rồi chọn file ở ô **"nhập file Excel"** — không gửi request nào tới Wameli.
- Lọc trong kết quả, xuất CSV.

Lưu ý: đây là gọi vào trang quản trị của phần mềm bên thứ ba. Nếu Wameli có API / chức năng xuất tự động chính thức, nên dùng cách đó.

### Sản phẩm Wameli

Trên trang Wameli, chọn **Dữ liệu → Sản phẩm** (không cần chọn ngày; có thể nhập từ khoá):
- **Xuất Excel (nhanh)**: dùng nút "Xuất exel" của trang Sản phẩm (1 request).
- **Đọc từng trang (chậm)**: 50 sản phẩm/trang (~75 trang cho ~3.700 sản phẩm), nghỉ giữa các trang.
- Cột: Ảnh (link), Mã vạch, Mã, Tên, Giá nhập, Giá bán, Giá bán đóng gói, Giá bán thấp nhất, Tồn, Tổng tồn, Tạm giữ, Có thể bán, Id.

## In phiếu giao + tải lên Wameli (tự động)

Trên bảng đơn Shopee: **tích chọn đơn** (cột ô vuông đầu bảng, hoặc ô ở tiêu đề để chọn tất cả đơn đang lọc) → **📦 In phiếu + Wameli**.

1. **Phiếu giao (PDF)**: tạo job in qua `POST /api/v3/logistics/create_sd_jobs` (theo mã kiện `OFG…` + kênh vận chuyển, nhóm theo kênh) rồi tải PDF qua `GET /api/v3/logistics/download_sd_job`.
2. **File Excel** đúng mẫu xuất đơn Shopee (28 cột), điền: Mã đơn hàng, Mã vận đơn, Đơn Vị Vận Chuyển, SKU phân loại hàng, Giá gốc (Y), Số lượng. Cột Y chọn được: đơn giá × 100 (mặc định, khớp mẫu 18876400) / thành tiền × 100 / đơn giá.
3. **Tên file**: `ngàytháng-mãshop-giờphút-sốthứtự` (vd `1610-bce-0801-1`); mã shop tự đoán từ SKU (vd `…-BCE-…` → `bce`), sửa được.
4. **Tải lên Wameli** (Đơn hàng → Thêm mới) với Sàn / Kho / Shop / Ngày / Giờ — extension nhớ Shop Wameli theo mã shop.

Nút **"Chỉ tạo file & tải về máy"** để kiểm tra file trước khi gửi lên Wameli.
Lưu ý: tạo phiếu giao trên Shopee giống bấm "In phiếu giao" (đơn có thể chuyển sang "Đã in"). Đơn chưa "Chuẩn bị hàng" sẽ chưa có mã kiện và bị bỏ qua.

## Chuẩn bị hàng (lấy hàng tận nơi)

Tích chọn các đơn **Chờ lấy hàng** chưa chuẩn bị → **🚚 Chuẩn bị hàng**:
1. Nhập **mã địa chỉ lấy hàng** (address_id – chỉ 1 lần cho mỗi shop, extension nhớ) → **Lấy ngày lấy hàng** (`/api/v3/shipment/mass_ship/get_pickup_time_slots`).
2. Chọn ngày → **Xác nhận** (có hộp thoại xác nhận, không hoàn tác được) → `/api/v3/shipment/batch_init_orders` (`shipping_mode: "pickup"`), nhóm theo kênh vận chuyển.
3. Extension chờ Shopee xử lý (`batch_get_package_shipment_status`, tối đa ~30 giây) rồi kiểm tra in được phiếu chưa (`can_print_waybill`).
4. Tải lại chi tiết các đơn đã xong (để có mã vận đơn) và (tuỳ chọn) mở luôn **In phiếu + Wameli**.
