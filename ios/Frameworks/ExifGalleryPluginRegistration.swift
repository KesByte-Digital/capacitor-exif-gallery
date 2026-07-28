// Public-release registration hint — copied by the CI release workflow into the
// public repo as `ios/Frameworks/ExifGalleryPluginRegistration.swift`. Do not
// rename or delete without understanding why it exists (see below).
//
// PROBLEM: the public npm package ships only the precompiled
// ios/Frameworks/ExifGallery.xcframework binary, no .swift/.m sources (private
// repo keeps those under ios/Sources, which never gets published — see fix:
// "ship a working binary-only iOS/Android distribution", #113).
//
// Capacitor's iOS auto-registration works by having the CLI (`npx cap sync ios` /
// `cap update ios`) regex-scan every .swift/.m file under the plugin's declared
// `capacitor.ios.src` directory (here: "ios") for a specific Objective-C bridging
// annotation naming the native plugin class — see @capacitor/cli's
// dist/util/iosplugin.js#findPluginClasses (single, non-global regex match per
// file) — and writes every match into `capacitor.config.json`'s
// `packageClassList`. At runtime, Capacitor's iOS bridge
// (CapacitorBridge.swift#registerPlugins) reads that exact list and resolves
// each entry via `NSClassFromString(...)`.
//
// IMPORTANT: the CLI's regex is non-global — it only takes the FIRST match per
// file. Do not add a second occurrence of the annotation pattern above the real
// one below (e.g. in an explanatory example) or the CLI will register the wrong
// name.
//
// A binary-only distribution has no .swift/.m files for the CLI to scan, so the
// real plugin class was silently never added to packageClassList — no build
// error, no crash, the plugin just never gets registered. Any JS call to
// ExifGallery.initialize()/pick() then fails at runtime with a generic
// Capacitor bridge error: {"code":"UNIMPLEMENTED"}.
//
// This file exists purely to give the CLI's text scan something to find. The
// enum below is a real, syntactically valid, harmless declaration (so IDEs and
// SourceKit don't flag this as broken) — but it is intentionally NOT part of
// any compiled target: the public podspec has no `source_files`
// (vendored_frameworks only) and Package.public.swift's `.binaryTarget` doesn't
// reference it either, so CocoaPods/SPM never actually compile it. It only
// needs to be present as text on disk under `ios/`.

// @objc(ExifGalleryPlugin)
enum ExifGalleryPluginRegistrationHint {}
