# Dice roller
Node JS React native android/ios application that is customizable in dice roll options, amount of dices and dices style

## How to run locally:
```shell
# Remove this library from the `package.json`
"expo-dev-client"

# For android
npm start android

# For ios
npm start ios
```

## How to install dependencies:
```shell
npm install
```

## Commands to check if device is connected and is authorized to debug:
```shell
adb kill-server
adb start-server
adb devices
```

## TODO:
<ol>
    <li>Change max value of a cube & settings default max for all cubes to be FlatList instead of a Slider with minimum value of 2 & maximum of 100</li>
    <li>Files are too long and unreadable, split to multiple files and refactor reuseable code and style</li>
    <li>Add support video/gif as dice background</li>
    <li>Add support on shaking to roll the dices</li>
    <li>3D dices with real dice throwing animation</li>
    <li>Better ux/ui?</li>
    <li>Help page to explain how to use the app?</li>
    <li>Unit tests with Playwright?</li>
</ol>