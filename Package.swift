// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorExifGallery",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorExifGallery",
            targets: ["ExifGallery"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "ExifGallery",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/ExifGalleryPlugin"),
        .testTarget(
            name: "ExifGalleryPluginTests",
            dependencies: ["ExifGallery"],
            path: "ios/Tests/ExifGalleryPluginTests")
    ]
)
