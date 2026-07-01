import json
import re

transcript_path = r'C:\Users\ADMIN\.gemini\antigravity\brain\be939718-e09f-4ba4-848d-560f9acffefc\.system_generated\logs\transcript_full.jsonl'
output_path = r'd:\tải xuống 2\TONY\app.js.recovered'

file_lines = {}

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'TOOL_RESPONSE' and 'view_file' in str(data):
                # Search recursively for the output string
                def extract_output(obj):
                    if isinstance(obj, str):
                        if 'The following code has been modified to include a line number' in obj:
                            return obj
                    elif isinstance(obj, dict):
                        for k, v in obj.items():
                            res = extract_output(v)
                            if res: return res
                    elif isinstance(obj, list):
                        for v in obj:
                            res = extract_output(v)
                            if res: return res
                    return None
                
                content = extract_output(data)
                if content:
                    for l in content.splitlines():
                        match = re.match(r'^(\d+): (.*)$', l)
                        if match:
                            line_num = int(match.group(1))
                            line_content = match.group(2)
                            file_lines[line_num] = line_content
        except Exception:
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
    print(f'Recovered {len(file_lines)} lines up to {max_line}. Missing: {missing_count}. Saved to {output_path}')
else:
    print('No lines recovered.')
