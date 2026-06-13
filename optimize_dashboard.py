import re

filepath = r"d:\App Theo dõi IN 3D\src\components\Dashboard.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure we add React.memo
if "export const Dashboard = React.memo(function Dashboard(" not in content:
    content = content.replace("export function Dashboard(props: DashboardProps) {", "export const Dashboard = React.memo(function Dashboard(props: DashboardProps) {")
    content = content.replace("export function Dashboard(props: any) {", "export const Dashboard = React.memo(function Dashboard(props: any) {")
    
    # We need to close the parenthesis for React.memo at the end of the file
    # We look for the last '}' of the function.
    content = re.sub(r'\}\s*$', '});\n', content)
    
with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Dashboard.tsx memoized.")
