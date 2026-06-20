import re

filepath = r"d:\App Theo dõi IN 3D\src\services\BambuCloudApi.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """      if (response.status !== 200 || (response.data && response.data.code && response.data.code !== 0 && response.data.code !== 200)) {
        throw new Error(`HTTP ${response.status} | URL: ${response.url} | Body: ${JSON.stringify(response.data)}`);
      }"""

content = re.sub(
    r'if \(response\.status !== 200 \|\| \([\s\S]*?throw new Error[\s\S]*?\}\n',
    replacement + "\n",
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated BambuCloudApi.ts error message")
