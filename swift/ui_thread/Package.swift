// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "UIThread",
    platforms: [
        .iOS(.v15),
        .macOS(.v12)
    ],
    products: [
        .library(
            name: "UIThread",
            targets: ["UIThread"]),
    ],
    targets: [
        .target(
            name: "UIThread",
            path: "UIThread"),
        .testTarget(
            name: "UIThreadTests",
            dependencies: ["UIThread"]),
    ]
)
