import Foundation
import Capacitor
import CocoaMQTT

@objc(BambuPrinterPlugin)
public class BambuPrinterPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BambuPrinterPlugin"
    public let jsName = "BambuPrinter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "connectMqtt", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "publishMqtt", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "disconnectMqtt", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "listFilesFtp", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "downloadFileFtp", returnType: CAPPluginReturnPromise)
    ]
    
    private var mqtt: CocoaMQTT?
    private var currentSerial: String = ""
    private var connectCall: CAPPluginCall?

    @objc func connectMqtt(_ call: CAPPluginCall) {
        guard let accessCode = call.getString("accessCode"),
              let serial = call.getString("serial") else {
            call.reject("Missing accessCode or serial")
            return
        }
        
        let ip = call.getString("ip") ?? ""
        self.currentSerial = serial
        let broker = call.getString("broker") ?? "ssl://\(ip):8883"
        let username = call.getString("username") ?? "bblp"
        
        let clientId = "bambu_handy_" + String(Int(Date().timeIntervalSince1970))
        
        let hostUrl = broker.replacingOccurrences(of: "ssl://", with: "")
        let parts = hostUrl.split(separator: ":")
        let host = String(parts[0])
        let port: UInt16 = parts.count > 1 ? UInt16(parts[1]) ?? 8883 : 8883

        self.mqtt?.disconnect()
        
        let mqtt = CocoaMQTT(clientID: clientId, host: host, port: port)
        mqtt.username = username
        mqtt.password = accessCode
        mqtt.enableSSL = true
        mqtt.allowUntrustCACertificate = true
        mqtt.keepAlive = 30
        mqtt.autoReconnect = true
        mqtt.delegate = self
        
        self.connectCall = call
        self.mqtt = mqtt
        _ = mqtt.connect()
    }
    
    @objc func publishMqtt(_ call: CAPPluginCall) {
        guard let topic = call.getString("topic"),
              let payload = call.getString("payload") else {
            call.reject("Missing topic or payload")
            return
        }
        
        guard let mqtt = self.mqtt, mqtt.connState == .connected else {
            call.reject("MQTT not connected")
            return
        }
        
        mqtt.publish(topic, withString: payload, qos: .qos0)
        call.resolve()
    }
    
    @objc func disconnectMqtt(_ call: CAPPluginCall) {
        self.mqtt?.disconnect()
        self.notifyListeners("mqttStatus", data: ["status": "disconnected"])
        call.resolve()
    }
    
    @objc func listFilesFtp(_ call: CAPPluginCall) {
        call.reject("Not implemented on iOS")
    }
    
    @objc func downloadFileFtp(_ call: CAPPluginCall) {
        call.reject("Not implemented on iOS")
    }
}

extension BambuPrinterPlugin: CocoaMQTTDelegate {
    public func mqtt(_ mqtt: CocoaMQTT, didConnectAck ack: CocoaMQTTConnAck) {
        if ack == .accept {
            mqtt.subscribe("device/\(self.currentSerial)/report", qos: CocoaMQTTQoS.qos0)
            self.notifyListeners("mqttStatus", data: ["status": "connected"])
            self.connectCall?.resolve(["status": "connected"])
            self.connectCall = nil
        } else {
            self.connectCall?.reject("MQTT Connection Refused")
            self.connectCall = nil
        }
    }
    
    public func mqtt(_ mqtt: CocoaMQTT, didPublishMessage message: CocoaMQTTMessage, id: UInt16) {}
    public func mqtt(_ mqtt: CocoaMQTT, didPublishAck id: UInt16) {}
    public func mqtt(_ mqtt: CocoaMQTT, didReceiveMessage message: CocoaMQTTMessage, id: UInt16) {
        self.notifyListeners("mqttMessage", data: [
            "topic": message.topic,
            "payload": message.string ?? ""
        ])
    }
    public func mqtt(_ mqtt: CocoaMQTT, didSubscribeTopics success: NSDictionary, failed: [String]) {}
    public func mqtt(_ mqtt: CocoaMQTT, didUnsubscribeTopics topics: [String]) {}
    public func mqttDidPing(_ mqtt: CocoaMQTT) {}
    public func mqttDidReceivePong(_ mqtt: CocoaMQTT) {}
    public func mqttDidDisconnect(_ mqtt: CocoaMQTT, withError err: Error?) {
        self.notifyListeners("mqttStatus", data: ["status": "disconnected"])
        if let error = err, let call = self.connectCall {
            call.reject("MQTT Disconnected: \(error.localizedDescription)")
            self.connectCall = nil
        }
    }
}
