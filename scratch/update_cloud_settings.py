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
      };"""

content = re.sub(
    r'const data: any = \{[\s\S]*?file_url: url\n      \};',
    replacement,
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated BambuCloudApi.ts with settings payload")
