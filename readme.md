# Dice roller

Node JS React native android application that let you decide 1-6 dices to roll<br>

## How to run:
```shell
npm start
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

## Build and Publish
> **_INFO:_** One's must have an eas account to build this project
### Build Preview
```shell
eas build -p android --profile preview
```

### Publish to store
```shell
eas submit # will publish using "production" profile
```

## Bugs:
 1. Async save always saves last used not new picked option


## TODO:
 1. Add google account configuration for "eas submit"
 2. When click on dice open a menu from the bottom upwards, when clicking anywhere that is not that menu it's closes it
 3. Make each dice stateful so it will have min max of options of its own and lock so even when you roll that value won't change
 4. Add support on shake to roll
 5. Environment variable support
 6. Add small button for setting menu, menu should be a different scene
 7. Instead of dice with same background each dice can have own background including gif/video as background
 8. OOP and clean code
 9.  Test with Jest
 10. Google ads
 11. Skins for dices purchaseable from the settings menu
