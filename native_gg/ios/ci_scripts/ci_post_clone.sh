#!/bin/sh

# Ensure that the script fails if any error occurs. Otherwise Xcode Cloud will continue
# any you might spend hours debugging the wrong part of the workflow.
set -e
set -x

# Xcode cloud could x86 or arm64 architecture. So detect it and install node accordingly.
arch
node_version=20.11.0

if [ "$ARCHITECTURE" == "arm64" ]; then
    # For arm64 architecture (Apple Silicon)
    arch=arm64
else
    # For x86 architecture
    arch=x64
fi

# Echo for debugging logs purposes
echo $HOME
echo "============> Installing Node <============"

# Download and install node
curl "https://nodejs.org/dist/v$node_version/node-v$node_version-darwin-$arch.tar.gz" -o $HOME/Downloads/node.tar.gz
cd /Volumes/workspace/
tar -xf "$HOME/Downloads/node.tar.gz"
NODE_PATH="$PWD/node-v$node_version-darwin-$arch/bin"
echo $NODE_PATH
PATH+=":$NODE_PATH"
export PATH

# Check node and npm version
node -v
npm -v

# Install cocoapods.
echo "============> Installing cocoapods <============"
# Temp hack to work around brew only installing the latest cocoapods version that is broken.
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
export HOMEBREW_NO_INSTALLED_DEPENDENTS_CHECK=TRUE


curl https://raw.githubusercontent.com/Homebrew/homebrew-core/1364b74ebeedb2eab300d62c99e12f2a6f344277/Formula/c/cocoapods.rb > cocoapods.rb
brew install cocoapods.rb

# Install yarn
npm install -g pnpm@8.15.1
pnpm -v



# move to the react native project.
echo "=====> Moving to build directory"
pwd
cd /Volumes/workspace/repository/native_gg
pwd

# Add the .env file
echo "Adding .env file"
echo -n $CLIENT_SECRETS > .env

# Install npm dependencies.
echo "=> Install npm dependencies"
# Workaround for Xcode Cloud issue https://forums.developer.apple.com/forums/thread/738136
pnpm install --frozen-lockfile


# Install all pod dependencies.
echo "=> Install pods"
cd ios && pwd && pod install
