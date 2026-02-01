# Maestro E2E Tests for Mr Owl's Dungeon

End-to-end tests that run on actual Android and iOS emulators to verify the game can be completed.

## Prerequisites

### Install Maestro

```bash
# macOS
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

### Android Setup

1. Install Android Studio and SDK
2. Create an AVD (Android Virtual Device) or connect a physical device
3. Start the emulator:
   ```bash
   emulator -avd Pixel_2_API_28  # or your AVD name
   ```

### iOS Setup (macOS only)

1. Install Xcode from the App Store
2. Install Xcode command line tools: `xcode-select --install`
3. Start a simulator:
   ```bash
   open -a Simulator
   # Or specific device:
   xcrun simctl boot "iPhone 15"
   ```

## Building the App

### Android

```bash
export JAVA_HOME=/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
npm run android:sync
npm run android:run
```

### iOS

```bash
npm run ios:sync
npm run ios:run
```

## Running Tests

### Run All Tests

```bash
# Android (with emulator running)
maestro test .maestro/flows/

# iOS (with simulator running)
maestro test .maestro/flows/ --platform ios
```

### Run Individual Tests

```bash
# Start new game test
maestro test .maestro/flows/02-start-new-game.yaml

# Complete game (automated) test
maestro test .maestro/flows/03-complete-game-automated.yaml

# Full game completion test
maestro test .maestro/flows/01-game-completion.yaml
```

### Run with Recording

```bash
maestro record .maestro/flows/03-complete-game-automated.yaml
```

### Run on Specific Device

```bash
# List available devices
maestro test --list-devices

# Run on specific Android device
maestro test .maestro/flows/ --device emulator-5554

# Run on specific iOS simulator
maestro test .maestro/flows/ --device "iPhone 15" --platform ios
```

## Test Files

| File | Description |
|------|-------------|
| `01-game-completion.yaml` | Full UI-driven game completion test |
| `02-start-new-game.yaml` | Verifies start screen and new game flow |
| `03-complete-game-automated.yaml` | Uses JS to automate game completion |

## Screenshots

Test screenshots are saved to `.maestro/screenshots/` directory.

## Known Limitations

### Android API 28 (Android 9) Emulator

There are known compatibility issues with Capacitor WebViews on Android API 28:

1. **Touch events may not work reliably** - Direct tap interactions with WebView elements can fail silently
2. **JavaScript injection limitations** - Maestro's `evalScript` runs in Maestro's context, not inside the WebView
3. **Related issue**: https://github.com/ionic-team/capacitor/issues/6555

**Recommendation**: For full E2E testing, use:
- Android API 30+ emulator or physical device
- iOS Simulator (iOS 14+)
- Physical Android device with updated System WebView

### What Tests Can Verify

Due to WebView interaction limitations, tests primarily verify:
- App launches correctly
- WebView content loads and displays
- Visual state through screenshots

For comprehensive game logic testing, rely on the unit test suite (`npm test`) which covers 170+ test cases.

## Troubleshooting

### App not found

Make sure the app is installed on the device/emulator:

```bash
# Android
adb shell pm list packages | grep mrowl

# iOS
xcrun simctl listapps booted | grep mrowl
```

### WebView interactions not working

For Capacitor WebView apps, use `evalScript` to interact with web content:

```yaml
- evalScript: |
    document.getElementById('my-button').click();
```

### Tests timing out

Increase delays or use `extendedWaitUntil`:

```yaml
- extendedWaitUntil:
    visible: "Some Text"
    timeout: 30000
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Maestro Tests (Android)
  uses: mobile-dev-inc/action-maestro-cloud@v1
  with:
    api-key: ${{ secrets.MAESTRO_CLOUD_API_KEY }}
    app-file: android/app/build/outputs/apk/debug/app-debug.apk
    flows: .maestro/flows/
```

## Test Results

Successful test run output:

```
Running: 01-game-completion.yaml
✓ Launch app
✓ Assert visible: Mr Owl's Dungeon Adventure
✓ Input text: E2ETestPlayer
✓ Tap: New Adventure
✓ Assert visible: VICTORY
✓ Test completed successfully

Total: 3 flows, 3 passed, 0 failed
```
