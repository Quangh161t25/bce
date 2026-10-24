# Shopee Chat - Khách Chờ Trả Lời (v2.0.0)

Extension Chrome cho Kênh Người Bán Shopee (`banhang.shopee.vn`):

1. **Phát hiện khách mới bằng API webchat.** Dùng chính token của trang (`localStorage['chat-session'].token`)
   để gọi `GET /webchat/api/v1.2/conversations` và `/conversations/{id}/messages`. Khách được tính là "đang chờ"
   khi tin cuối cùng là của khách (không tính tin tự động).
2. **Tự gửi câu chào qua giao diện** (tắt mặc định): click mở đúng hội thoại → điền ô chat → bấm nút gửi.
   Chốt an toàn:
   - chỉ chào khách nhắn **sau khi bật**, tin không cũ quá X phút, mỗi hội thoại 1 lần / 12 giờ;
   - chỉ gửi khi bạn **không thao tác** X giây, ô chat **không có chữ soạn dở**, và mở **đúng tên khách**;
   - có **chế độ thử**: chỉ điền chữ, không bấm gửi;
   - nhiều tab webchat thì chỉ 1 tab được quét/gửi.
3. **Danh sách tổng hợp để trả lời sau**: panel nổi trên webchat ("🕒 Chờ trả lời") và popup trên thanh công cụ.
   Mỗi khách có các tin đang chờ, thời gian chờ (xanh < 2h, cam < 8h, đỏ ≥ 8h, vì Shopee tính phản hồi trong 12h),
   nút **Mở chat** / **Xong**. Khi shop gửi một tin không phải câu chào, khách tự chuyển sang "Đã xong".

## Cài đặt
1. `chrome://extensions` → bật Developer mode → **Load unpacked** → chọn thư mục `chat/`.
2. Mở `https://banhang.shopee.vn/new-webchat/conversations` (nên **ghim tab** và để bộ lọc "Tất cả cuộc trò chuyện").
3. Bấm nút "🕒 Chờ trả lời" → tab **Cài đặt** → bật chào tự động (nên thử bằng **chế độ thử** trước).

## Giới hạn
- Cần mở tab webchat thì mới quét và gửi được (background chỉ nhắc quét mỗi phút và có thể tự mở lại tab).
- API và giao diện là nội bộ của Shopee, có thể đổi bất cứ lúc nào. Các selector dùng `data-cy="webchat-…"`.
- Đừng bật cùng lúc với "Tin nhắn tự động" có sẵn của Shopee.
