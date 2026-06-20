import urllib.request
import urllib.error
import json

url = "https://api.bambulab.com/v1/iot-service/api/user/print"
headers = {
    "Authorization": "Bearer FAKE_TOKEN",
    "Content-Type": "application/json"
}
data = {
    "device_id": "012345678",
    "file_name": "test.3mf",
    "file_url": "https://s3.amazonaws.com/test",
    "settings": {
        "bed_levelling": True
    }
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Error Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
