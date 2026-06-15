// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "BambuMqttPlugin",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "BambuMqttPlugin",
            targets: ["BambuPrinterPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/emqx/CocoaMQTT.git", from: "2.1.3")
    ],
    targets: [
        .target(
            name: "BambuPrinterPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CocoaMQTT", package: "CocoaMQTT")
            ],
            path: "ios/Sources/BambuPrinterPlugin"),
        .testTarget(
            name: "BambuPrinterPluginTests",
            dependencies: ["BambuPrinterPlugin"],
            path: "ios/Tests/BambuPrinterPluginTests")
    ]
)