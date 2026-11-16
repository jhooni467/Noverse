# NOVERSE Android build

- App ID: `com.noverse.gamehub`
- First native app version: `1.00` (versionCode 100)
- The APK is built by GitHub Actions from the same web app source.
- Run **Actions → Build NOVERSE Android APK → Run workflow** to create the APK artifact.
- The workflow keeps the Android debug signing key in a GitHub Actions cache so consecutive builds from this repository can update the same installation. Do not delete the cache named `noverse-v1-debug-signing-key`.
- This is a debug-signed APK for direct testing/distribution, not a Play Store release. For a permanent production signing identity, configure a private release keystore and GitHub Actions secrets before distributing widely.
