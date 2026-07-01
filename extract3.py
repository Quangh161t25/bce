import json
import os

transcript_path = r'C:\Users\ADMIN\.gemini\antigravity\brain\0ff97c6f-986f-4951-8579-1b86f488ba98\.system_generated\logs\transcript_full.jsonl'
output_path = r'd:\tải xuống 2\TONY\deleted_lines.txt'

deleted_lines = []
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        json_str = json.dumps(data)
        if '@@ -1581,540 +1581,735 @@' in json_str:
            def find_diff(obj):
                if isinstance(obj, str):
                    if '@@ -1581,540 +1581,735 @@' in obj:
                        return obj
                elif isinstance(obj, dict):
                    for k, v in obj.items():
                        res = find_diff(v)
                        if res: return res
                elif isinstance(obj, list):
                    for v in obj:
                        res = find_diff(v)
                        if res: return res
                return None
            
            diff_text = find_diff(data)
            if diff_text:
                lines = diff_text.splitlines()
                started = False
                for l in lines:
                    if l.startswith('@@ -1581,540'): 
                        started = True
                        continue
                    if started:
                        if l.startswith('-') or l.startswith(' '):
                            deleted_lines.append(l[1:])
                        elif l.startswith('+'):
                            continue
                        elif l.startswith('@@') or '[diff_block_end]' in l:
                            break
                break

if deleted_lines:
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(deleted_lines))
    print(f'Extracted {len(deleted_lines)} lines to {output_path}')
else:
    print('Diff not found')
