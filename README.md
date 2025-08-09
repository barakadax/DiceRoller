# Dice roller
Node JS React native android/ios application that is customizable in dice roll options, amount of dices and dices style

## How to run:
```shell
# For android
npm start android

# For ios
npm start ios
```

## How to install dependencies:
```shell
npm install
```

## How to build for production:
```shell
# First run this for CLI commands
npm install -g eas-cli

# For android
eas build --platform android --profile production --local

# For ios
eas build --platform ios --profile production --local
```

## Commands to check if device is connected and is authorized to debug:
```shell
adb kill-server
adb start-server
adb devices
```

## TODO:
<ol>
    <li>Add support video/gif as dice background</li>
    <li>Fix icons</li>
    <li>Add support on shake to roll</li>
    <li>Better ux/ui</li>
    <li>3D dices with real dice throwing animation</li>
    <li>Test with Playwright?</li>
    <li>Google ads?</li>
    <li>Skins for dices purchaseable from the settings menu?</li>
</ol>