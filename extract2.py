import os

transcript_path = r'C:\Users\ADMIN\.gemini\antigravity\brain\0ff97c6f-986f-4951-8579-1b86f488ba98\.system_generated\logs\transcript_full.jsonl'
output_path = r'd:\tải xuống 2\TONY\deleted_lines.txt'

deleted_lines = []
found_diff = False

with open(transcript_path, 'r', encoding='utf-8') as f:
    text = f.read()
    if '@@ -1581,540 +1581,735 @@' in text:
        found_diff = True
        idx = text.find('@@ -1581,540 +1581,735 @@')
        diff_text = text[idx:idx+100000]
        for l in diff_text.splitlines():
            # If we hit an unescaped literal newline or next diff block end
            if l.startswith('@@ -1581,540'):
                continue
            if l.startswith('-'):
                deleted_lines.append(l[1:])
            elif l.startswith(' '):
                deleted_lines.append(l[1:])
            elif l.startswith('+'):
                continue
            elif l.startswith('@@') or '[diff_block_end]' in l:
                break

if found_diff and deleted_lines:
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(deleted_lines))
    print(f'Extracted {len(deleted_lines)} lines to {output_path}')
else:
    print('Diff not found or no lines extracted.')
