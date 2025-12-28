// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "OptionalsCrash",
    platforms: [
        .iOS(.v15),
        .macOS(.v12)
    ],
    products: [
        .library(
            name: "OptionalsCrash",
            targets: ["OptionalsCrash"]),
    ],
    targets: [
        .target(
            name: "OptionalsCrash",
            path: "OptionalsCrash"),
        .testTarget(
            name: "OptionalsCrashTests",
            dependencies: ["OptionalsCrash"]),
    ]
)
