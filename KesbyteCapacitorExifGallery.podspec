require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

# Public-release variant: vendors the prebuilt ExifGallery.xcframework instead of
# compiling ios/Sources directly. The CI release workflow copies this file to the
# public repo as `KesbyteCapacitorExifGallery.podspec` — the filename must match
# s.name, CocoaPods' local `:path` resolution looks up `<name>.podspec` verbatim.
Pod::Spec.new do |s|
  s.name = 'KesbyteCapacitorExifGallery'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['repository']['url']
  s.author = package['author']
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.ios.vendored_frameworks = 'ios/Frameworks/ExifGallery.xcframework'
  s.ios.deployment_target = '15.0'
  s.dependency 'Capacitor'
end
