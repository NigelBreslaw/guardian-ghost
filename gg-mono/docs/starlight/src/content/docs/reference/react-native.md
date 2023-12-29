---
title: React Native
description: Details about the project setup
---


## General

Prettier, eslint and jest have been removed from the package.json. This roughly halves the number of dependencies that were being installed. There were only a handful of React Native specific eslint rules so the loss might not be a big deal? Also need to see if vitest can be used to replace what jest was doing.

Running `npx react-native doctor` can find issue in the dev environmemt.

## iOS

MacOS: Ruby needed to be updated to 3.3.0. The following config also added to
.zshrc
source /opt/homebrew/opt/chruby/share/chruby/chruby.sh
source /opt/homebrew/opt/chruby/share/chruby/auto.sh
chruby ruby-3.3.0



## Android

Java 17 was needed. [SdkMan](https://sdkman.io/) was used instead of brew.

`curl -s "https://get.sdkman.io" | bash`

`source "/Users/nigelb/.sdkman/bin/sdkman-init.sh"`

`sdk install java 17.0.9`

`sdk list java`

`sdk install java 17.0.9-tem`

`java -version` => 17.0.9


After setting up Android Studio and an emulator the following is needed in .zshrc

export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

Remember to `source ~/.zshrc` after, or open a new terminal. Without this `pnpm start` will fail to first launch the emulator and then fail to launch the react native app, even though it will install it successfully. 
