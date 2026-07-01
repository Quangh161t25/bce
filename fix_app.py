import os

app_js_path = r'd:\tải xuống 2\TONY\app.js'
deleted_lines_path = r'd:\tải xuống 2\TONY\deleted_lines.txt'

with open(app_js_path, 'r', encoding='utf-8') as f:
    app_js_text = f.read()

with open(deleted_lines_path, 'r', encoding='utf-8') as f:
    deleted_lines_text = f.read()

start_marker = "    const renderDetailInput = (header, value, extraAttributes = '') => {"
end_marker = "function filterTable() {\n    const term = document.getElementById('searchInput').value.toLowerCase();"

start_idx = app_js_text.find(start_marker)
end_idx = app_js_text.find(end_marker)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_marker)
    
    new_text = app_js_text[:start_idx] + deleted_lines_text + app_js_text[end_idx:]
    
    with open(app_js_path, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print(f'Successfully replaced bad chunk. New file length: {len(new_text)}')
else:
    print(f'Markers not found. start_idx: {start_idx}, end_idx: {end_idx}')
