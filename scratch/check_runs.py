import urllib.request
import json
try:
    req = urllib.request.Request('https://api.github.com/repos/Pingun96/in3d/actions/runs?per_page=3')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        for run in data.get('workflow_runs', []):
            print(f"Run {run['id']}: {run['status']} - {run['conclusion']} ({run['head_commit']['message']})")
except Exception as e:
    print('Error:', e)
