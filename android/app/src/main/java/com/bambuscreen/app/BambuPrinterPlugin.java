package com.bambuscreen.app;

import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPFile;
import org.apache.commons.net.ftp.FTPSClient;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

import java.io.ByteArrayOutputStream;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

@CapacitorPlugin(name = "BambuPrinter")
public class BambuPrinterPlugin extends Plugin {
    private static final String TAG = "BambuPrinterPlugin";
    private MqttClient mqttClient;
    private String currentSerial = "";

    // Lấy SSLSocketFactory chấp nhận mọi chứng chỉ (cho máy in Bambu dùng cert tự ký)
    private SSLSocketFactory getTrustAllSocketFactory() throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[] {
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                public void checkServerTrusted(X509Certificate[] certs, String authType) {}
            }
        };
        SSLContext sc = SSLContext.getInstance("TLS");
        sc.init(null, trustAllCerts, new SecureRandom());
        return sc.getSocketFactory();
    }

    @PluginMethod
    public void connectMqtt(PluginCall call) {
        String ip = call.getString("ip");
        String accessCode = call.getString("accessCode");
        String serial = call.getString("serial");
        String customBroker = call.getString("broker");
        String customUsername = call.getString("username");

        if (accessCode == null || serial == null) {
            call.reject("Thiếu tham số accessCode hoặc serial");
            return;
        }

        currentSerial = serial;
        
        // Nếu không có customBroker, sử dụng ssl://ip:8883 mặc định
        String brokerUrl = customBroker != null ? customBroker : "ssl://" + ip + ":8883";
        String clientId = "bambu_handy_" + System.currentTimeMillis();
        String mqttUsername = customUsername != null ? customUsername : "bblp";
        
        try {
            if (mqttClient != null && mqttClient.isConnected()) {
                try {
                    mqttClient.disconnect();
                } catch (Exception e) {
                    Log.e(TAG, "Lỗi ngắt kết nối MQTT cũ", e);
                }
            }

            mqttClient = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
            MqttConnectOptions connOpts = new MqttConnectOptions();
            connOpts.setUserName(mqttUsername);
            connOpts.setPassword(accessCode.toCharArray());
            connOpts.setSocketFactory(getTrustAllSocketFactory());
            connOpts.setConnectionTimeout(10);
            connOpts.setKeepAliveInterval(30);
            connOpts.setAutomaticReconnect(true);

            mqttClient.setCallback(new MqttCallback() {
                @Override
                public void connectionLost(Throwable cause) {
                    Log.w(TAG, "Mất kết nối MQTT", cause);
                    JSObject ret = new JSObject();
                    ret.put("status", "disconnected");
                    notifyListeners("mqttStatus", ret);
                }

                @Override
                public void messageArrived(String topic, MqttMessage message) {
                    String payload = new String(message.getPayload());
                    JSObject ret = new JSObject();
                    ret.put("topic", topic);
                    ret.put("payload", payload);
                    notifyListeners("mqttMessage", ret);
                }

                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {
                    // Không cần xử lý
                }
            });

            new Thread(() -> {
                try {
                    mqttClient.connect(connOpts);
                    
                    // Đăng ký topic report
                    String topicReport = "device/" + serial + "/report";
                    mqttClient.subscribe(topicReport, 0);

                    JSObject ret = new JSObject();
                    ret.put("status", "connected");
                    ret.put("broker", brokerUrl);
                    
                    getActivity().runOnUiThread(() -> {
                        notifyListeners("mqttStatus", ret);
                        call.resolve(ret);
                    });
                } catch (MqttException e) {
                    Log.e(TAG, "Kết nối MQTT thất bại", e);
                    getActivity().runOnUiThread(() -> call.reject("Kết nối MQTT thất bại: " + (e.getMessage() != null ? e.getMessage() : "Unknown error (Code: " + e.getReasonCode() + ")")));
                } catch (Exception e) {
                    Log.e(TAG, "Lỗi không xác định khi kết nối", e);
                    getActivity().runOnUiThread(() -> call.reject("Lỗi hệ thống khi kết nối: " + (e.getMessage() != null ? e.getMessage() : "Unknown")));
                }
            }).start();

        } catch (Exception e) {
            Log.e(TAG, "Khởi tạo MQTT thất bại", e);
            call.reject("Khởi tạo MQTT thất bại: " + e.getMessage());
        }
    }

    @PluginMethod
    public void publishMqtt(PluginCall call) {
        String topic = call.getString("topic");
        String payload = call.getString("payload");

        if (mqttClient == null || !mqttClient.isConnected()) {
            call.reject("Chưa kết nối MQTT");
            return;
        }

        if (topic == null || payload == null) {
            call.reject("Thiếu topic hoặc payload");
            return;
        }

        try {
            MqttMessage message = new MqttMessage(payload.getBytes());
            message.setQos(0);
            mqttClient.publish(topic, message);
            call.resolve();
        } catch (MqttException e) {
            Log.e(TAG, "Lỗi gửi MQTT", e);
            call.reject("Lỗi gửi MQTT: " + e.getMessage());
        }
    }

    @PluginMethod
    public void disconnectMqtt(PluginCall call) {
        try {
            if (mqttClient != null && mqttClient.isConnected()) {
                mqttClient.disconnect();
            }
            JSObject ret = new JSObject();
            ret.put("status", "disconnected");
            notifyListeners("mqttStatus", ret);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Lỗi ngắt kết nối MQTT", e);
            call.reject("Lỗi ngắt kết nối: " + e.getMessage());
        }
    }

    @PluginMethod
    public void listFilesFtp(PluginCall call) {
        String ip = call.getString("ip");
        String accessCode = call.getString("accessCode");
        String path = call.getString("path", "/");

        if (ip == null || accessCode == null) {
            call.reject("Thiếu tham số ip hoặc accessCode");
            return;
        }

        new Thread(() -> {
            FTPSClient ftps = null;
            try {
                // true để kích hoạt implicit TLS (cổng 990)
                ftps = new FTPSClient(true);
                
                // Cấu hình TrustManager bỏ qua chứng chỉ SSL
                ftps.setTrustManager(new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                });

                ftps.setConnectTimeout(8000);
                ftps.connect(ip, 990);
                
                boolean login = ftps.login("bblp", accessCode);
                if (!login) {
                    getActivity().runOnUiThread(() -> call.reject("Đăng nhập FTP thất bại (Sai Access Code)"));
                    return;
                }

                // Cấu hình chế độ bảo mật dữ liệu và Passive mode
                ftps.execPROT("P"); // Bảo vệ kênh dữ liệu (Private)
                ftps.enterLocalPassiveMode();
                ftps.setFileType(FTP.BINARY_FILE_TYPE);

                FTPFile[] files = ftps.listFiles(path);
                JSArray fileList = new JSArray();

                if (files != null) {
                    for (FTPFile file : files) {
                        JSObject fileObj = new JSObject();
                        fileObj.put("name", file.getName());
                        fileObj.put("size", file.getSize());
                        fileObj.put("isDirectory", file.isDirectory());
                        fileObj.put("timestamp", file.getTimestamp() != null ? file.getTimestamp().getTimeInMillis() : 0);
                        fileList.put(fileObj);
                    }
                }

                ftps.logout();
                ftps.disconnect();

                JSObject ret = new JSObject();
                ret.put("files", fileList);
                getActivity().runOnUiThread(() -> call.resolve(ret));

            } catch (Exception e) {
                Log.e(TAG, "Lỗi kết nối FTPS", e);
                if (ftps != null && ftps.isConnected()) {
                    try {
                        ftps.disconnect();
                    } catch (Exception ignored) {}
                }
                getActivity().runOnUiThread(() -> call.reject("Lỗi kết nối FTPS: " + e.getMessage()));
            }
        }).start();
    }

    @PluginMethod
    public void downloadFileFtp(PluginCall call) {
        String ip = call.getString("ip");
        String accessCode = call.getString("accessCode");
        String remotePath = call.getString("remotePath");

        if (ip == null || accessCode == null || remotePath == null) {
            call.reject("Thiếu tham số ip, accessCode hoặc remotePath");
            return;
        }

        new Thread(() -> {
            FTPSClient ftps = null;
            try {
                ftps = new FTPSClient(true);
                ftps.setTrustManager(new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                });

                ftps.setConnectTimeout(8000);
                ftps.connect(ip, 990);
                
                boolean login = ftps.login("bblp", accessCode);
                if (!login) {
                    getActivity().runOnUiThread(() -> call.reject("Đăng nhập FTP thất bại"));
                    return;
                }

                ftps.execPROT("P");
                ftps.enterLocalPassiveMode();
                ftps.setFileType(FTP.BINARY_FILE_TYPE);

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                boolean success = ftps.retrieveFile(remotePath, outputStream);
                
                ftps.logout();
                ftps.disconnect();

                if (success) {
                    String content = outputStream.toString("UTF-8");
                    JSObject ret = new JSObject();
                    ret.put("content", content);
                    getActivity().runOnUiThread(() -> call.resolve(ret));
                } else {
                    getActivity().runOnUiThread(() -> call.reject("Không thể tải file: " + remotePath));
                }

            } catch (Exception e) {
                Log.e(TAG, "Lỗi tải file FTPS", e);
                if (ftps != null && ftps.isConnected()) {
                    try {
                        ftps.disconnect();
                    } catch (Exception ignored) {}
                }
                getActivity().runOnUiThread(() -> call.reject("Lỗi tải file FTPS: " + e.getMessage()));
            }
        }).start();
    }
}
