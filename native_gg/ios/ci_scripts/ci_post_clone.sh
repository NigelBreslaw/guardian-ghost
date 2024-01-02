#!/bin/sh

#  ci_post_clone.sh
#  
#
#  Created by NigelBreslaw on 2.1.2024.
#

echo "============> Installing NVM <============"
brew install nvm

echo "============> Installing Node <============"
nvm install 20.10.0

echo "=========> Installing cocoapods"
brew install cocoapods

echo "=======> Installing PNPM"
npm install -g pnpm

echo "=====> Moving to build directory"
cd native_gg

echo "=> Install npm dependencies"
pnpm i --frozen-lockfile

echo "=> Install pods"
pnpm run pod-install
