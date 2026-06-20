import re

filepath = r"d:\App Theo dõi IN 3D\src\services\BambuCloudApi.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """  static async startPrintJob(token: string, deviceId: string, filename: string, url: string, taskId?: string): Promise<any> {
    try {
      // Strip AWS query params from S3 URL for the Cloud Print API
      const cleanUrl = url.split('?')[0];

      const data: any = {
        device_id: deviceId,
        file_name: filename,
        file_url: cleanUrl,"""

content = re.sub(
    r'  static async startPrintJob\([\s\S]*?file_url: url,',
    replacement,
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated BambuCloudApi.ts to strip URL query string")
