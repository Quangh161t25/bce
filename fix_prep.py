import os

app_js_path = r'd:\tải xuống 2\TONY\app.js'
deleted_lines_path = r'd:\tải xuống 2\TONY\deleted_lines.txt'

with open(app_js_path, 'r', encoding='utf-8') as f:
    app_js_text = f.read()

with open(deleted_lines_path, 'r', encoding='utf-8') as f:
    deleted_lines_text = f.read()

start_marker = "    const renderDetailInput = (header, value, extraAttributes = '') => {\n        const options = getDonHangFieldOptions(header);"
end_marker = "    const confirmMessage = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')\n        ? Dữ liệu từ  file () sẽ được đọc theo tên cột và cập nhật sheet ''. Tiếp tục?\n        : currentTab === 'DS_SP'\n            ? Dữ liệu từ  file () sẽ XÓA TOÀN BỘ dữ liệu cũ trong sheet '' rồi ghi dữ liệu mới. Tiếp tục?"

start_idx = app_js_text.find(start_marker)
end_idx = app_js_text.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # include start_marker, exclude end_marker for the bounds, since start_marker is in the output and end_marker is too
    # wait, deleted_lines_text has neither start_marker nor end_marker, EXCEPT that the diff context might have included them.
    # The diff block was:
    #  @@ -1581,540 +1581,735 @@
    #      const renderDetailInput = (header, value, extraAttributes = '') => {
    #          const options = getDonHangFieldOptions(header);
    # -        if (options) {
    # ...
    #      const confirmMessage = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
    #          ? Dữ liệu từ  file () sẽ được đọc theo tên cột và cập nhật sheet ''. Tiếp tục?
    #          : currentTab === 'DS_SP'
    
    # Let's just construct the new text. 
    # Notice that deleted_lines_text contains the unchanged context lines as well!
    # Because my python script appended l[1:] for BOTH '-' and ' '.
    # Let's check what deleted_lines_text starts and ends with.
    pass

