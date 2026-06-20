import re

filepath = r"d:\App Theo dõi IN 3D\src\services\BambuCloudApi.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """      const data: any = {
        device_id: deviceId,
        file_name: filename,
        file_url: url,
        settings: {
          timelapse: false,
          bed_levelling: true,
          flow_cali: false,
          vibration_cali: false,
          layer_inspect: false,
          use_ams: false,
          ams_mapping: ""
        }
      };
      // Do not send file_id or task_id if they are just task IDs, as it causes 400 Bad Request
      
      const response = await CapacitorHttp.post({"""

content = re.sub(
    r'const data: any = \{[\s\S]*?const response = await CapacitorHttp\.post\(\{',
    replacement,
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated BambuCloudApi.ts to remove invalid file_id")
