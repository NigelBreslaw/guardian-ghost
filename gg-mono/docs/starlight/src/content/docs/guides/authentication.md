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

Before any changes to the app can be made an assetlinks.json file needs to be deployed to the associated website.
This ends up being deployed as https://guardianghost.com/.well-known/assetlinks.json.

This file contains a fingerprint from the key used to sign the app. Google handle the signing of the production
app. While a debug.keystore is used for local builds. Both fingerprints have been added for now, however the debug.keystore is published on the public git repo. For a real app this would not be a safe thing to do. But would require
a special local build to be configured, a different url that would be used in the app and the call back and also another entry on bungie.net for this dev version. There is a TODO to fix this at a later date.

Details on how to setup the assetlinks and verify them can be found [here](https://developer.android.com/training/app-links/verify-android-applinks).

Details on how to update the AndroidManifest.xml are [here](https://developer.android.com/training/app-links/deep-linking).

The AndroidManifest has been setup so only the following link is captured by the app 'https://guardianghost.com/auth'.
## Web