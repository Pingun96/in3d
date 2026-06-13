import re

filepath = r"d:\App Theo dõi IN 3D\src\components\Dashboard.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace all °C with just C
content = content.replace("°C", "C")
content = content.replace("ÂC", "C") # Just in case

# Put °C back in temperatures
content = content.replace("{props.nozzleTemp}C", "{props.nozzleTemp}°C")
content = content.replace("{props.nozzleTarget}C", "{props.nozzleTarget}°C")
content = content.replace("{props.bedTemp}C", "{props.bedTemp}°C")
content = content.replace("{props.bedTarget}C", "{props.bedTarget}°C")
content = content.replace("{props.chamberTemp}C", "{props.chamberTemp}°C")

content = content.replace('className="text-sm ml-1">C</span>', 'className="text-sm ml-1">°C</span>')
content = content.replace('className="text-[#999999] text-xs">C</span>', 'className="text-[#999999] text-xs">°C</span>')
content = content.replace('190 C</span>', '190 °C</span>')
content = content.replace('240 C</span>', '240 °C</span>')
content = content.replace('className="text-lg text-gray-500">C</span>', 'className="text-lg text-gray-500">°C</span>')
content = content.replace(">C</spa", ">°C</spa")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed real C replacements!")
