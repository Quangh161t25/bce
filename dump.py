import json

transcript_path = r'C:\Users\ADMIN\.gemini\antigravity\brain\be939718-e09f-4ba4-848d-560f9acffefc\.system_generated\logs\transcript_full.jsonl'
output_path = r'd:\tải xuống 2\TONY\subagent_output.txt'

lines_found = []

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'TOOL_RESPONSE':
            json_str = json.dumps(data)
            if 'app.js' in json_str:
                lines_found.append(json_str)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines_found))
print(f'Wrote {len(lines_found)} tool responses to {output_path}')
