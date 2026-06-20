import { CapacitorHttp } from '@capacitor/core';

export interface BambuDevice {
  dev_id: string;
  name: string;
  dev_model_name: string;
  online: boolean;
  dev_access_code: string;
}

export interface CloudLoginResponse {
  token: string;
  account: string;
}

import { Capacitor } from '@capacitor/core';

const isWeb = Capacitor.getPlatform() === 'web';
const BASE_URL_USER = isWeb ? '/bambu-user-api' : 'https://api.bambulab.com/v1/user-service';
const BASE_URL_IOT = isWeb ? '/bambu-iot-api' : 'https://api.bambulab.com/v1/iot-service';

export class BambuCloudApi {
  static async sendVerifyCode(email: string): Promise<void> {
    try {
      const response = await CapacitorHttp.post({
        url: `${BASE_URL_USER}/user/sendemail/code`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email: email,
          type: 'codeLogin'
        },
      });
      if (response.status !== 200) {
        throw new Error(`Không thể gửi mã xác thực (Status: ${response.status})`);
      }
    } catch (err: any) {
      console.error('sendVerifyCode error:', err);
      throw new Error(err.message || 'Lỗi khi gửi mã xác thực');
    }
  }

  /**
   * Đăng nhập bằng Email và Password (kèm theo mã Code 2FA nếu có)
   * Trả về Token và Account Name để sử dụng kết nối MQTT
   */
  static async login(email: string, password: string, code?: string): Promise<CloudLoginResponse> {
    try {
      const dataPayload: any = {
        account: email,
        password: password,
      };
      if (code) {
        dataPayload.code = code;
      }

      const response = await CapacitorHttp.post({
        url: `${BASE_URL_USER}/user/login`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: dataPayload,
      });

      if (response.status !== 200 || !response.data) {
        throw new Error(response.data?.error || `Đăng nhập thất bại (Status: ${response.status})`);
      }

      let resData = response.data;
      if (typeof resData === 'string') {
        try {
          resData = JSON.parse(resData);
        } catch (e) {
          // ignore
        }
      }

      // Bambu API trả về { accessToken: "..." } khi thành công (không có code 200)
      const { accessToken, token, account, error, loginType } = resData;
      
      if (loginType === 'verifyCode' || (!accessToken && !token && loginType)) {
        throw new Error('REQUIRE_2FA');
      }

      const finalToken = accessToken || token;

      if (!finalToken) {
        throw new Error(error || 'Không nhận được Token từ máy chủ Bambu.');
      }

      // Lấy Account name để kết nối MQTT
      let parsedAccount = account || email;
      
      try {
        const parts = finalToken.split('.');
        if (parts.length === 3) {
          // Token là JWT (định dạng cũ)
          let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) {
            base64 += '=';
          }
          const decoded = atob(base64);
          const match = decoded.match(/"username"\s*:\s*"([^"]+)"/);
          if (match && match[1]) {
            parsedAccount = match[1];
          }
        } else {
          // Token không phải JWT (định dạng mới), gọi API preference để lấy UID
          const prefRes = await CapacitorHttp.get({
            url: 'https://api.bambulab.com/v1/design-user-service/my/preference',
            headers: {
              'Authorization': `Bearer ${finalToken}`
            }
          });
          if (prefRes.status === 200 && prefRes.data && prefRes.data.uid) {
            parsedAccount = `u_${prefRes.data.uid}`;
          }
        }
      } catch (e) {
        console.error('Lỗi khi lấy username MQTT:', e);
      }

      return { token: finalToken, account: parsedAccount };
    } catch (err: any) {
      console.error('BambuCloudApi login error:', err);
      throw new Error(err.message || 'Lỗi khi gọi API Đăng nhập Cloud', { cause: err });
    }
  }

  /**
   * Lấy danh sách thiết bị từ tài khoản đã đăng nhập
   * @param token Bearer Token nhận được từ bước login
   */
  static async getDevices(token: string): Promise<BambuDevice[]> {
    try {
      const response = await CapacitorHttp.get({
        url: `${BASE_URL_IOT}/api/user/bind`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200 || !response.data) {
        throw new Error(`Lỗi tải danh sách thiết bị (Status: ${response.status})`);
      }

      let resData = response.data;
      if (typeof resData === 'string') {
        try { resData = JSON.parse(resData); } catch(e) {}
      }

      const { devices, error } = resData;
      if (error) {
        throw new Error(error);
      }

      // API trả về object devices là một danh sách, map lại format
      return devices || [];
    } catch (err: any) {
      console.error('BambuCloudApi getDevices error:', err);
      throw new Error(err.message || 'Lỗi khi lấy danh sách máy in', { cause: err });
    }
  }

  /**
   * Lấy danh sách Tasks (Lịch sử in / Mẫu đang in) từ Cloud
   */
  static async getTasks(token: string): Promise<any[]> {
    try {
      const response = await CapacitorHttp.get({
        url: `${BASE_URL_USER}/my/tasks`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200 && response.data && response.data.hits) {
        return response.data.hits;
      }
      return [];
    } catch (err) {
      console.error('BambuCloudApi getTasks error:', err);
      return [];
    }
  }

  /**
   * Yêu cầu URLs S3 để upload file
   */
  static async requestUploadUrl(token: string, filename: string, fileSize: number): Promise<any> {
    try {
      const response = await CapacitorHttp.get({
        url: `${BASE_URL_IOT}/api/user/upload`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          filename: filename,
          size: fileSize.toString()
        }
      });
      
      let resData = response.data;
      if (typeof resData === 'string') {
        try { resData = JSON.parse(resData); } catch(e) {}
      }
      return resData;
    } catch (err: any) {
      console.error('BambuCloudApi requestUploadUrl error:', err);
      throw new Error(err.message || 'Lỗi xin cấp phép Upload', { cause: err });
    }
  }

  /**
   * Kích hoạt in từ Cloud qua API chính thức (thay vì MQTT proxy)
   */
  static async startPrintJob(token: string, deviceId: string, filename: string, url: string, taskId?: string): Promise<any> {
    try {
            const data: any = {
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

  /**
   * Upload file trực tiếp lên S3 bằng Fetch API (để tránh giới hạn Base64 của CapacitorHttp)
   */
  static async uploadToS3(url: string, data: File | string | ArrayBuffer, onProgress?: (percent: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      
      // Không set Content-Type vì S3 presigned URL của Bambu không có chữ ký Content-Type
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`S3 Upload Failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Lỗi mạng khi upload lên S3'));
      xhr.send(data);
    });
  }

  /**
   * Tạo lệnh in qua Cloud API
   */
  static async createPrintTask(
    token: string, 
    title: string,
    deviceId: string, 
    fileName: string, 
    fileUrl: string, 
    fileSize: number, 
    fileMd5: string,
    plateIndex: number = 1
  ): Promise<any> {
    try {
      const payload = {
        title: title,
        deviceId: deviceId,
        fileId: "", 
        fileName: fileName,
        fileSize: fileSize,
        fileUrl: fileUrl,
        md5: fileMd5,
        plateIndex: plateIndex,
        projectId: "0",
        profileId: "0",
        taskType: 1 // 1 is usually cloud print task
      };

      const response = await CapacitorHttp.post({
        url: `${BASE_URL_USER}/my/tasks/create`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: payload
      });

      let resData = response.data;
      if (typeof resData === 'string') {
        try { resData = JSON.parse(resData); } catch(e) {}
      }
      return resData;
    } catch (err: any) {
      console.error('BambuCloudApi createPrintTask error:', err);
      throw new Error(err.message || 'Lỗi khi ra lệnh in qua Cloud', { cause: err });
    }
  }
}
