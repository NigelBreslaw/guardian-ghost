#!/bin/sh

#  ci_post_clone.sh
#  
#
#  Created by NigelBreslaw on 2.1.2024.
#

echo "============> Installing Node <============"
curl "https://nodejs.org/dist/v20.10.0/node-v20.10.0-darwin-arm64.tar.gz" -o $HOME/Downloads/node.tar.gz
tar -xf "$HOME/Downloads/node.tar.gz"
NODE_PATH="$PWD/node-v20.10.0-darwin-arm64/bin"
PATH+=":$NODE_PATH"
export PATH
node -v
npm -v

echo "============> Installing cocoapods <============"
brew install cocoapods




echo "=======> Installing PNPM"
npm install -g pnpm@8.13.1


echo "=====> Moving to build directory"
cd native_gg

echo "=> Install npm dependencies"
pnpm i --frozen-lockfile

echo "=> Install pods"
pnpm run pod-install
