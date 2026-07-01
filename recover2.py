import json
import re

transcript_path = r'C:\Users\ADMIN\.gemini\antigravity\brain\be939718-e09f-4ba4-848d-560f9acffefc\.system_generated\logs\transcript_full.jsonl'
output_path = r'd:\tải xuống 2\TONY\app.js.recovered'

file_lines = {}

def extract_strings(obj):
    if isinstance(obj, str):
        if 'The following code has been modified to include a line number' in obj:
            yield obj
    elif isinstance(obj, dict):
        for v in obj.values():
            yield from extract_strings(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from extract_strings(v)

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            for content in extract_strings(data):
                for l in content.splitlines():
                    match = re.match(r'^(\d+):\s(.*)$', l)
                    if match:
                        line_num = int(match.group(1))
                        line_content = match.group(2)
                        file_lines[line_num] = line_content
        except Exception as e:
            pass

if file_lines:
    max_line = max(file_lines.keys())
    recovered = []
    missing_count = 0
    for i in range(1, max_line + 1):
        if i in file_lines:
            recovered.append(file_lines[i])
        else:
            recovered.append(f'// MISSING LINE {i}')
            missing_count += 1
            
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(recovered))
    print(f'Recovered {len(file_lines)} lines up to {max_line}. Missing: {missing_count}.')
else:
    print('No lines recovered.')
