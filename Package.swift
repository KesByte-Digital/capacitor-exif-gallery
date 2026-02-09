// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorImageGallery",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapacitorImageGallery",
            targets: ["ImageGalleryFramework"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        // Binary target for precompiled .xcframework
        .binaryTarget(
            name: "ImageGalleryFramework",
            path: "ios/Frameworks/ImageGallery.xcframework"
        ),
        // Note: Tests are excluded when using binary distribution
        // To run tests, use the Xcode project directly
    ]
)