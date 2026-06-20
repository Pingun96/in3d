import re

filepath = r"d:\App Theo dõi IN 3D\src\components\PrintScreen.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """                      // 6. Send API Command to start printing
                      showDialog({ title: 'Đang bắt đầu in', message: 'Đang đánh thức máy in qua Cloud API...', hideCancel: true });
                      const taskId = taskResponse?.task_id || taskResponse?.id || taskResponse?.modelId || "0";
                      await BambuCloudApi.startPrintJob(cloudToken, serial, file.name, fileUrl, taskId);
                      
                      showDialog({ title: 'Thành công', message: 'Đã gửi lệnh in Cloud thành công! Máy in sẽ sớm bắt đầu.', hideCancel: true });"""

content = re.sub(
    r'// 6\. Send API Command to start printing[\s\S]*?throw new Error[\s\S]*?\);',
    replacement,
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated PrintScreen.tsx to remove debug error")
