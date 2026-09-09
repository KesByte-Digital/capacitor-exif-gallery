package com.kesbytedigital.exifgallery;

// Public-release registration hint — copied by the CI release workflow into the public
// repo as android/src/main/java/com/kesbytedigital/exifgallery/ExifGalleryPluginRegistrationHint.java.
// Do not rename or delete without understanding why it exists (see below). See
// ExifGalleryPluginRegistration.public.swift at the repo root for the analogous iOS problem/fix.
//
// PROBLEM: the public npm package ships only the precompiled android/libs/exifgallery-release.aar
// binary, no .java/.kt sources (private repo keeps those under android/src/main, which never
// gets published - see fix: "ship a working binary-only iOS/Android distribution", #113).
//
// Capacitor's Android CLI (`npx cap sync android` / `cap update android`) does two things
// that both depend on real source files existing under the plugin's declared `capacitor.android.src`
// directory (here: "android") - see @capacitor/cli's dist/android/update.js:
//
// 1. findAndroidPluginClassesInPlugin() recursively lists every file under `android/src/main`
//    via Node's fs.readdir - with NO existence check first. A binary-only distribution has no
//    such directory at all, so this throws ENOENT and crashes `cap sync android` for the
//    ENTIRE consuming app (not just this plugin) - not a silent registration failure like iOS,
//    a hard crash before the app can build at all.
// 2. Of whatever .java/.kt files it finds, it regex-scans each one for a line matching
//    /^@(?:CapacitorPlugin|NativePlugin)[\s\S]+?class ([\w]+)/m (note the ^ anchor - unlike
//    iOS's regex, a commented-out annotation will NOT match here) and writes
//    "<package>.<ClassName>" into capacitor.plugins.json. At runtime, Capacitor's Android
//    bridge resolves each entry via Class.forName(...) and instantiates it via reflection.
//
// This file exists purely to give the CLI something to find: a directory that exists (fixing
// point 1) containing a real, uncommented `@CapacitorPlugin(...) class ExifGalleryPlugin { ... }`
// declaration (fixing point 2) whose regex match produces EXACTLY the classpath of the real
// compiled class already shipped in the .aar: com.kesbytedigital.exifgallery.ExifGalleryPlugin.
//
// It is intentionally never compiled - see the public android/build.gradle's
// `sourceSets { main { java.srcDirs = [] } }` - so it can never conflict with (or shadow) the
// real ExifGalleryPlugin class Class.forName() actually resolves to at runtime, which comes
// from the vendored .aar on the classpath, not from this file.
@CapacitorPlugin(name = "ExifGalleryPlugin")
class ExifGalleryPlugin {}
