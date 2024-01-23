---
title: Authentication
description: Details about setting up authentication
---


## General

Setting up Oauth for web and native apps is such a PITA it's worth documenting it all here.

## iOS

First an 'associated url' is needed. This means when bungie.com redirect back to 'https://guardianghost.com/auth' the iOS app will have the callback details sent to it.

First step is registering the site with Apple. This is done with a json file called 'apple-app-site-association' that needs to be in a folder called '.well-known' in the root of the website. This should then be deployed. Full instructions [here](https://developer.apple.com/documentation/xcode/supporting-associated-domains).

Next is to add an 'Associated Domains' entitlement to the iOS project file. It can be found under 'Targets > native_gg > Signing & Capabilities > +'. It then needs a single entry for the applink 'applinks:guardianghost.com'. 

## Android

## Web