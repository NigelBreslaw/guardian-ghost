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
echo $HOME
echo "============> Installing Node <============"
curl "https://nodejs.org/dist/v$node_version/node-v$node_version-darwin-$arch.tar.gz" -o $HOME/Downloads/node.tar.gz
cd /Volumes/workspace/
tar -xf "$HOME/Downloads/node.tar.gz"
NODE_PATH="$PWD/node-v$node_version-darwin-$arch/bin"
echo $NODE_PATH
PATH+=":$NODE_PATH"
export PATH
node -v
npm -v
npm install -g npm@latest
npm -v

echo "=====> Moving to build directory"
pwd
cd /Volumes/workspace/repository/native_gg
pwd

echo "=> Install npm dependencies"
npm ci

echo "============> Installing cocoapods <============"
brew install cocoapods



echo "=> Install pods"
cd ios && pwd && npx pod-install 
