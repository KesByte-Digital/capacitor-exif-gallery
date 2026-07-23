// swift-tools-version: 5.9
import PackageDescription

// Public-release variant: consumes the prebuilt ExifGallery.xcframework instead of
// compiling ios/Sources directly. The CI release workflow copies this file to the
// public repo as `Package.swift` — do not rename the product below without also
// updating CapacitorExifGallery.public.podspec and the `files` entry in package.json.
let package = Package(
    name: "CapacitorExifGallery",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "KesbyteCapacitorExifGallery",
            targets: ["ExifGallery"])
    ],
    targets: [
        .binaryTarget(
            name: "ExifGallery",
            path: "ios/Frameworks/ExifGallery.xcframework")
    ]
)
