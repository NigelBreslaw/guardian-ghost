#!/bin/sh

#  ci_post_clone.sh
#  
#
#  Created by NigelBreslaw on 2.1.2024.
#

echo "============> Installing Node <============"
brew install node@20

echo "============> Linking Node <============"
brew link node@20

echo "=========> Installing cocoapods"
brew install cocoapods

echo "=======> Installing PNPM"
npm install -g pnpm@8.13.1

echo "=====> Moving to build directory"
cd native_gg

echo "=> Install npm dependencies"
pnpm i --frozen-lockfile

echo "=> Install pods"
pnpm run pod-install
