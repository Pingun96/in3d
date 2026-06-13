import json

log_path = r'C:\Users\hiep.pham\.gemini\antigravity\brain\a5137779-8eda-49ed-b440-c8bf7340842d\.system_generated\logs\transcript.jsonl'
filepath = r'C:\Users\hiep.pham\Desktop\Dashboard.tsx'

with open(filepath, 'r', encoding='utf-16') as f:
    lines = f.read().split('\n')

def apply_chunks(chunks):
    global lines
    chunks_sorted = sorted(chunks, key=lambda x: x['StartLine'], reverse=True)
    for c in chunks_sorted:
        start = c['StartLine'] - 1
        end = c['EndLine']
        replacement_lines = c['ReplacementContent'].split('\n')
        lines = lines[:start] + replacement_lines + lines[end:]

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'PLANNER_RESPONSE':
                # Stop right before the step where I broke the file
                if data.get('step_index') >= 4070:
                    continue
                for call in data.get('tool_calls', []):
                    name = call['name']
                    args = call.get('args', {})
                    if 'Dashboard.tsx' in args.get('TargetFile', '') or 'Dashboard.tsx' in args.get('AbsolutePath', ''):
                        if name == 'write_to_file':
                            lines = args['CodeContent'].split('\n')
                        elif name == 'replace_file_content':
                            apply_chunks([args])
                        elif name == 'multi_replace_file_content':
                            apply_chunks(args['ReplacementChunks'])
        except Exception as e:
            pass

with open(r'd:\App Theo dõi IN 3D\src\components\Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print("Done reconstructing Dashboard.tsx properly!")
