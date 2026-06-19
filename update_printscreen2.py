import re

filepath = r"d:\App Theo dõi IN 3D\src\components\PrintScreen.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add import
if "import { bambuBridge }" not in content:
    content = content.replace(
        "import { BambuCloudApi } from '../services/BambuCloudApi';",
        "import { BambuCloudApi } from '../services/BambuCloudApi';\nimport { bambuBridge } from '../services/BambuBridge';"
    )

# Add bambuBridge.startCloudPrint call
replacement = """                      const taskResponse = await BambuCloudApi.createPrintTask(
                        cloudToken,
                        file.name,
                        serial,
                        file.name,
                        fileUrl, // Sometimes bambu expects s3 url without query params, but full url works mostly
                        file.size,
                        md5Hash
                      );

                      // 6. Send MQTT Command to start printing
                      showDialog({ title: 'Đang bắt đầu in', message: 'Đang đánh thức máy in...', hideCancel: true });
                      const taskId = taskResponse?.task_id || "0";
                      // Strip query string from S3 URL for MQTT payload to prevent length/parse issues on printer
                      const cleanFileUrl = fileUrl.split('?')[0];
                      await bambuBridge.startCloudPrint(serial, cleanFileUrl, md5Hash, file.name, taskId);"""

content = re.sub(
    r'await BambuCloudApi\.createPrintTask\([\s\S]*?md5Hash\s*\);',
    replacement,
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated PrintScreen.tsx with startCloudPrint")
