import json
import os

transcript_path = r'C:\Users\ADMIN\.gemini\antigravity\brain\0ff97c6f-986f-4951-8579-1b86f488ba98\.system_generated\logs\transcript_full.jsonl'
output_path = r'd:\tải xuống 2\TONY\deleted_lines.txt'

deleted_lines = []
found_diff = False

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'TOOL_RESPONSE' and 'multi_replace_file_content' in str(data):
                content = data.get('content', '')
                if '@@ -1581,540 +1581,735 @@' in content:
                    found_diff = True
                    diff_started = False
                    for l in content.splitlines():
                        if l.startswith('@@ -1581,540'):
                            diff_started = True
                            continue
                        if diff_started:
                            if l.startswith('-'):
                                deleted_lines.append(l[1:])
                            elif l.startswith(' '):
                                deleted_lines.append(l[1:])
                            elif l.startswith('+'):
                                continue
                            elif l.startswith('@@') or l.startswith('[diff_block_end]'):
                                break
                    break
        except Exception as e:
            pass

if found_diff and deleted_lines:
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(deleted_lines))
    print(f'Extracted {len(deleted_lines)} lines to {output_path}')
else:
    print('Diff not found or no lines extracted.')
