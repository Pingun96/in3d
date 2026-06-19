import re

filepath = r"d:\App Theo dõi IN 3D\src\services\BambuCloudApi.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

new_method = """  /**
   * Kích hoạt in từ Cloud qua API chính thức (thay vì MQTT proxy)
   */
  static async startPrintJob(token: string, deviceId: string, filename: string, url: string, taskId?: string): Promise<any> {
    try {
      const data: any = {
        device_id: deviceId,
        file_name: filename,
        file_url: url
      };
      if (taskId && taskId !== "0") {
        data.task_id = taskId;
        data.file_id = taskId;
      }
      
      const response = await CapacitorHttp.post({
        url: `${BASE_URL_IOT}/api/user/print`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: data
      });
      
      if (response.status !== 200 || (response.data && response.data.code && response.data.code !== 0 && response.data.code !== 200)) {
        throw new Error(`Lỗi Start Print API: ${JSON.stringify(response.data)}`);
      }
      return response.data;
    } catch (err: any) {
      console.error('BambuCloudApi startPrintJob error:', err);
      throw new Error(err.message || 'Lỗi gửi lệnh in Cloud API', { cause: err });
    }
  }

  /**"""

content = content.replace("  /**\n   * Upload file", new_method + "\n   * Upload file")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated BambuCloudApi.ts with startPrintJob")
