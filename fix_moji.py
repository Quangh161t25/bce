import os

replacements = {
    'KhÃ´ng': 'Không',
    'Ä''á»c': 'đọc',
    'Ä''Æ°á»£c': 'được',
    'danh sÃ¡ch': 'danh sách',
    'Lá»—i': 'Lỗi',
    'táº£i': 'tải',
    'xÃ¡c Ä''á»‹nh': 'xác định',
    'dòng cáº§n': 'dòng cần',
    'cáº­p nháº­t': 'cập nhật',
    'tháº¥t báº¡i': 'thất bại',
    'THÃ€NH': 'THÀNH',
    'phÃ­': 'phí',
    'trÆ°á»ng': 'trường',
    'sá»''': 'số',
    'lÆ°á»£ng': 'lượng',
    'Tráº¡ng ThÃ¡i': 'Trạng Thái',
    'Tráº£': 'Trả',
    'HoÃ n': 'Hoàn',
    'tiá»n': 'tiền',
    'NgÆ°á»i': 'Người',
    'Tá»•ng': 'Tổng',
    'lÃ²ng': 'lòng',
    'chá»n': 'chọn',
    'trÆ°á»›c': 'trước',
    'thÃªm': 'thêm',
    'nháº­p': 'nhập',
    'Ä''á»§': 'đủ',
    'vÃ ': 'và',
    'tÃ¬nh': 'tình',
    'tráº¡ng': 'trạng',
    'Báº¡n': 'Bạn',
    'Ä''Ã£': 'đã',
    'bá»': 'bỏ',
    'xÃ¡c': 'xác',
    'táº¥t cáº£': 'tất cả',
    'sáº£n pháº©m': 'sản phẩm',
    'ToÃ n bá»™': 'Toàn bộ',
    'nhÃ³m': 'nhóm',
    'dá»¯ liá»‡u': 'dữ liệu',
    'nÃ y': 'này',
    'sáº½': 'sẽ',
    'bá»‹ xÃ³a': 'bị xóa',
    'cÃ³': 'có',
    'cháº¯c': 'chắc',
    'Ã­t nháº¥t': 'ít nhất',
    'má»™t': 'một',
    'há»£p lá»‡': 'hợp lệ',
    'Há»‡ thá»''ng': 'Hệ thống',
    'khiáº¿u náº¡i': 'khiếu nại',
    'Ä''ang': 'đang',
    'giao hÃ ng': 'giao hàng',
    'ÄÃ£': 'Đã',
    'HÃ ng': 'Hàng',
    'ÄÆ¡n': 'Đơn',
    'LÃ­ do': 'Lý do',
    'thanh toÃ¡n': 'thanh toán',
    'Vui lÃ²ng chá» n': 'Vui lòng chọn',
    'LÃ­ do Tráº£ hÃ ng/HoÃ n tiá» n': 'Lý do Trả hàng/Hoàn tiền',
    'Mã sá»‘ khiáº¿u náº¡i': 'Mã số khiếu nại',
    'Mã vận đơn tráº£ hÃ ng': 'Mã vận đơn trả hàng',
    'Tráº¡ng thÃ¡i Tráº£ hÃ ng/HoÃ n tiá» n': 'Trạng thái Trả hàng/Hoàn tiền',
    'Mã vận đơn giao hÃ ng': 'Mã vận đơn giao hàng',
    'Ä Ã£ hoÃ n tiá» n cho NgÆ°á» i mua': 'Đã hoàn tiền cho Người mua',
    'NgÆ°á» i mua Ä‘ang tráº£ hÃ ng': 'Người mua đang trả hàng',
    'Vui lÃ²ng chá» n gian hÃ ng trÆ°á»›c khi thÃªm Excel.': 'Vui lòng chọn gian hàng trước khi thêm Excel.',
    'Vui lÃ²ng chá» n gian vÃ  tÃ¬nh tráº¡ng trÆ°á»›c khi thÃªm Excel.': 'Vui lòng chọn gian và tình trạng trước khi thêm Excel.',
    'Sá»‘ lÆ°á»£ng': 'Số lượng'
}

# Add some specific ones to fix the tricky spaces
replacements.update({
    'chá» n': 'chọn',
    'tÃ¬nh tráº¡ng': 'tình trạng',
    'hÃ ng': 'hàng',
    'tiá» n': 'tiền',
    'NgÆ°á» i': 'Người',
    'Ä‘ang': 'đang',
    'Ä Ã£': 'Đã',
    'tráº£': 'trả',
    'hoÃ n': 'hoàn',
    'sá»‘': 'số',
    'Tráº¡ng thÃ¡i': 'Trạng thái',
    'LÃ­ do': 'Lý do',
    'Tráº£ hÃ ng/HoÃ n tiá» n': 'Trả hàng/Hoàn tiền',
    'gian hÃ ng': 'gian hàng',
    'vÃ ': 'và',
    'chá» n gian trÆ°á»›c khi thÃªm Excel': 'chọn gian trước khi thêm Excel'
})


app_js_path = r'd:\tải xuống 2\TONY\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    text = f.read()

for k, v in replacements.items():
    text = text.replace(k, v)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Replaced mojibake')
