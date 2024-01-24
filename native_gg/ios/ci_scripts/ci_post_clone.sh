#!/bin/sh

#  ci_post_clone.sh
#  
#
#  Created by NigelBreslaw on 2.1.2024.
#


arch
node_version=20.11.0

if [ "$ARCHITECTURE" == "arm64" ]; then
    # For arm64 architecture (Apple Silicon)
    arch=arm64
else
    # For x86 architecture
    arch=x64
fi

echo "============> Installing Node <============"
curl "https://nodejs.org/dist/v$node_version/node-v$node_version-darwin-$arch.tar.gz" -o $HOME/Downloads/node.tar.gz
tar -xf "$HOME/Downloads/node.tar.gz"
NODE_PATH="$PWD/node-v$node_version-darwin-$arch/bin"
PATH+=":$NODE_PATH"
export PATH
node -v
npm -v

echo "============> Installing cocoapods <============"
brew install cocoapods

pwd

# echo "=====> Moving to build directory"
# cd native_gg

# echo "=> Install npm dependencies"
# npm ci

# echo "=> Install pods"
# cd ios && npx pod-install 
