// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "BuildError",
    platforms: [
        .iOS(.v15),
        .macOS(.v12)
    ],
    products: [
        .library(
            name: "BuildError",
            targets: ["BuildError"]),
    ],
    targets: [
        .target(
            name: "BuildError",
            path: "BuildError"),
        .testTarget(
            name: "BuildErrorTests",
            dependencies: ["BuildError"]),
    ]
)
