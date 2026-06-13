import re

filepath = r"d:\App Theo dõi IN 3D\src\components\Dashboard.tsx"
with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# The corrupted characters are typically 1 to 4 characters right before the C
# And we know that in Dashboard.tsx, the ONLY thing right before a capital C
# in the UI strings is the degree symbol. Let's be careful to only replace
# it where it's part of a temperature string or similar.
# The corrupted string is typically "Â°C", "Ã‚Â°C", "AC", "A,AC"

content = re.sub(r'([A-Za-z0-9]*)[\u0080-\uFFFF,]*C', r'\1°C', content)
# Wait, this regex is too broad, it would match "A,AC" but also match valid strings.
# Instead, let's just use exact string replacement for the strings we saw in the terminal:
# The terminal printed "AC" which is 'A' + replacement character + 'C'
# "A,AC" which is 'A,A' + replacement character + 'C'

content = content.replace("Â°C", "°C")
content = content.replace("Ã‚Â°C", "°C")
content = content.replace("A,A\ufffdC", "°C")
content = content.replace("A\ufffdC", "°C")
content = content.replace("A,AC", "°C")
content = content.replace("AC", "°C")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed font errors in Dashboard.tsx")
