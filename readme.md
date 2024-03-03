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

## Bugs:
<ol>
    <li>Async save always saves last used not new picked option</li>
</ol>

## TODO:
<ol>
    <li>When click on dice open a menu from the bottom upwards, when clicking anywhere that is not that menu it's closes it</li>
    <li>Make each dice stateful so it will have min max of options of its own and lock so even when you roll that value won't change</li>
    <li>Add support on shake to roll</li>
    <li>Environment variable support</li>
    <li>Add small button for setting menu, menu should be a different scene</li>
    <li>instead of dice with same background each dice can have own background including gif/video as background</li>
    <li>OOP and clean code</li>
    <li>Test with Jest</li>
    <li>Google ads</li>
    <li>Skins for dices purchaseable from the settings menu</li>
</ol>
