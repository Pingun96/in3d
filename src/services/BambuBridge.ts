import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface MqttStatusEvent {
  status: 'connected' | 'disconnected';
  broker?: string;
}

export interface MqttMessageEvent {
  topic: string;
  payload: string;
}

export interface FtpFile {
  name: string;
  size: number;
  isDirectory: boolean;
  timestamp: number;
}

interface BambuPrinterPlugin {
  connectMqtt(options: { ip?: string; accessCode: string; serial: string; broker?: string; username?: string }): Promise<MqttStatusEvent>;
  publishMqtt(options: { topic: string; payload: string }): Promise<void>;
  disconnectMqtt(): Promise<void>;
  listFilesFtp(options: { ip: string; accessCode: string; path: string }): Promise<{ files: FtpFile[] }>;
  downloadFileFtp(options: { ip: string; accessCode: string; remotePath: string }): Promise<{ content: string }>;
  addListener(eventName: 'mqttStatus', listenerFunc: (event: MqttStatusEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'mqttMessage', listenerFunc: (event: MqttMessageEvent) => void): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

// Đăng ký Plugin native với Capacitor
const NativeBambuPrinter = registerPlugin<BambuPrinterPlugin>('BambuPrinter');

class BambuBridge {
  private listeners: unknown[] = [];

  /**
   * Kết nối tới MQTT Broker (Hỗ trợ Local và Cloud)
   */
  async connectMqtt(
    accessCode: string, 
    serial: string, 
    ip?: string, 
    broker?: string, 
    username?: string
  ): Promise<MqttStatusEvent> {
    return NativeBambuPrinter.connectMqtt({ ip, accessCode, serial, broker, username });
  }

  /**
   * Ngắt kết nối MQTT
   */
  async disconnectMqtt(): Promise<void> {
    return NativeBambuPrinter.disconnectMqtt();
  }

  /**
   * Gửi gói tin MQTT tới một topic (Ví dụ topic request của máy in)
   */
  async publish(topic: string, payload: unknown): Promise<void> {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return NativeBambuPrinter.publishMqtt({ topic, payload: payloadStr });
  }

  /**
   * Gửi lệnh G-code trực tiếp tới máy in qua MQTT
   */
  async sendGcode(serial: string, gcode: string): Promise<void> {
    const topic = `device/${serial}/request`;
    const payload = {
      print: {
        sequence_id: Math.floor(Math.random() * 10000).toString(),
        command: 'gcode_line',
        param: gcode + '\n'
      }
    };
    return this.publish(topic, payload);
  }

  /**
   * Gửi lệnh điều khiển LED cục bộ
   */
  async controlLed(serial: string, on: boolean): Promise<void> {
    const topic = `device/${serial}/request`;
    const payload = {
      system: {
        sequence_id: Math.floor(Math.random() * 10000).toString(),
        command: 'ledctrl',
        led_node: 'chamber_light',
        led_mode: on ? 'on' : 'off'
      }
    };
    return this.publish(topic, payload);
  }

  /**
   * Gửi lệnh thay đổi tốc độ in
   * @param mode "1" = Silent, "2" = Standard, "3" = Sport, "4" = Ludicrous
   */
  async changePrintSpeed(serial: string, mode: '1' | '2' | '3' | '4'): Promise<void> {
    const topic = `device/${serial}/request`;
    const payload = {
      print: {
        sequence_id: Math.floor(Math.random() * 10000).toString(),
        command: 'print_speed',
        param: mode
      }
    };
    return this.publish(topic, payload);
  }

  /**
   * Tạm dừng in
   */
  async pausePrint(serial: string): Promise<void> {
    const topic = `device/${serial}/request`;
    const payload = {
      print: {
        sequence_id: Math.floor(Math.random() * 10000).toString(),
        command: 'pause'
      }
    };
    return this.publish(topic, payload);
  }

  /**
   * Tiếp tục in
   */
  async resumePrint(serial: string): Promise<void> {
    const topic = `device/${serial}/request`;
    const payload = {
      print: {
        sequence_id: Math.floor(Math.random() * 10000).toString(),
        command: 'resume'
      }
    };
    return this.publish(topic, payload);
  }

  /**
   * Dừng in hoàn toàn
   */
  async stopPrint(serial: string): Promise<void> {
    const topic = `device/${serial}/request`;
    const payload = {
      print: {
        sequence_id: Math.floor(Math.random() * 10000).toString(),
        command: 'stop',
        reason: 'user_cancel'
      }
    };
    return this.publish(topic, payload);
  }

  /**
   * Lắng nghe sự kiện MQTT tin nhắn nhận về
   */
  async onMessage(callback: (event: MqttMessageEvent) => void): Promise<PluginListenerHandle> {
    const handler = await NativeBambuPrinter.addListener('mqttMessage', (event) => {
      callback(event);
    });
    this.listeners.push(handler);
    return handler;
  }

  /**
   * Lắng nghe trạng thái kết nối MQTT
   */
  async onStatusChange(callback: (event: MqttStatusEvent) => void): Promise<PluginListenerHandle> {
    const handler = await NativeBambuPrinter.addListener('mqttStatus', (event) => {
      callback(event);
    });
    this.listeners.push(handler);
    return handler;
  }

  /**
   * Gỡ bỏ mọi Listener để tránh rò rỉ bộ nhớ
   */
  async cleanup(): Promise<void> {
    for (const listener of this.listeners as PluginListenerHandle[]) {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    }
    this.listeners = [];
    return NativeBambuPrinter.removeAllListeners();
  }

  /**
   * Liệt kê file trên thẻ nhớ SD của máy in (qua FTPS cổng 990)
   */
  async listFiles(ip: string, accessCode: string, path: string = '/'): Promise<FtpFile[]> {
    try {
      const response = await NativeBambuPrinter.listFilesFtp({ ip, accessCode, path });
      return response.files;
    } catch (e) {
      console.error('Lỗi khi listFilesFtp:', e);
      throw e;
    }
  }

  /**
   * Tải nội dung file từ thẻ nhớ máy in (dành cho file Gcode nhỏ)
   */
  async downloadFile(ip: string, accessCode: string, remotePath: string): Promise<string> {
    try {
      const response = await NativeBambuPrinter.downloadFileFtp({ ip, accessCode, remotePath });
      return response.content;
    } catch (e) {
      console.error('Lỗi tải file FTP:', e);
      throw e;
    }
  }

  /**
   * Tự động nạp nhựa (Load Filament) thông qua tệp G-code hệ thống
   */
  async loadFilament(serial: string): Promise<void> {
    const topic = `device/${serial}/request`;
    const payload = {
      print: {
        sequence_id: Math.floor(Math.random() * 10000).toString(),
        command: 'gcode_file',
        param: '/usr/etc/print/filament_load.gcode'
      }
    };
    return this.publish(topic, payload);
  }

  /**
   * Tự động rút nhựa (Unload Filament) thông qua lệnh hệ thống
   */
  async unloadFilament(serial: string): Promise<void> {
    const topic = `device/${serial}/request`;
    const payload = {
      print: {
        sequence_id: Math.floor(Math.random() * 10000).toString(),
        command: 'unload_filament'
      }
    };
    return this.publish(topic, payload);
  }

  /**
   * Ra lệnh nạp một khay nhựa cụ thể từ AMS xuống đầu phun
   */
  async amsChangeFilament(serial: string, targetTray: number): Promise<void> {
    const topic = `device/${serial}/request`;
    const payload = {
      print: {
        sequence_id: Math.floor(Math.random() * 10000).toString(),
        command: 'ams_change_filament',
        curr_temp: 220, // Optional target temp if needed, usually omitted or default
        target: targetTray,
        tar_temp: 220
      }
    };
    return this.publish(topic, payload);
  }

  /**
   * Cấu hình thông số khay nhựa AMS / BMCU (màu sắc, loại vật liệu, hãng)
   */
  async setAmsFilament(
    serial: string,
    amsId: number,
    trayId: number,
    brand: string,
    material: string,
    colorHex: string
  ): Promise<void> {
    const topic = `device/${serial}/request`;
    
    // Default values
    let infoIdx = 'GFL99'; // Generic PLA
    let tempMin = 190;
    let tempMax = 240;
    
    const matUpper = material.toUpperCase();
    const isBambu = brand.includes('Bambu');
    const isMatte = brand.includes('Matte');
    
    if (matUpper === 'PLA') {
      if (isBambu) {
        infoIdx = isMatte ? 'GFB01' : 'GFB00';
        tempMin = 190; tempMax = 230;
      } else {
        infoIdx = 'GFL99'; // Generic PLA
        tempMin = 190; tempMax = 240;
      }
    } else if (matUpper === 'PETG') {
      if (isBambu) {
        infoIdx = 'GFG00';
        tempMin = 220; tempMax = 270;
      } else {
        infoIdx = 'GFG99';
        tempMin = 220; tempMax = 270;
      }
    } else if (matUpper === 'ABS') {
      if (isBambu) {
        infoIdx = 'GFU01';
        tempMin = 240; tempMax = 280;
      } else {
        infoIdx = 'GFB99';
        tempMin = 240; tempMax = 280;
      }
    } else if (matUpper === 'ASA') {
      if (isBambu) {
        infoIdx = 'GFA00';
        tempMin = 240; tempMax = 280;
      } else {
        infoIdx = 'GFA99';
        tempMin = 240; tempMax = 280;
      }
    } else if (matUpper === 'TPU') {
      if (isBambu) {
        infoIdx = 'GFT01';
        tempMin = 200; tempMax = 240;
      } else {
        infoIdx = 'GFL95';
        tempMin = 200; tempMax = 240;
      }
    }

    const trayType = matUpper;

    // Định dạng màu hex phải có alpha (ví dụ RRGGBBAA)
    let formattedColor = colorHex.replace('#', '');
    if (formattedColor.length === 6) {
      formattedColor += 'FF';
    }
    
    const payload = {
      print: {
        sequence_id: Math.floor(Math.random() * 10000).toString(),
        command: 'ams_filament_setting',
        ams_id: amsId,
        tray_id: trayId,
        tray_info_idx: infoIdx,
        tray_color: formattedColor,
        tray_type: trayType,
        nozzle_temp_min: tempMin,
        nozzle_temp_max: tempMax
      }
    };
    return this.publish(topic, payload);
  }
}

export const bambuBridge = new BambuBridge();
