---
title: Automated Deployment
description: Automated Deployment details.
---


### Deployments

All released are fully automated*. This is to minimize developer effort and make it trivial to push out public releases, bug fixes and internal beta's. 

All the web apps are deployed to production and development tracks on Cloudflare. To see a beta deployment look for the link on any competed PR on github.

\* Currently the Android release is not fully automated. This is only possible once the app is in a state where it can be reviewed and elevated to the alpha, beta or production track. Currently the app does not do enough to pass even an alpha review.

Note all the web deployments and iOS beta + TestFlight deployment are 100% automated. iOS production deployments could also be automated, but this isn't wise till the first couple of releases have been completed manually and successfully. 

### Cloudflare
To create a new deployment e.g. for say 'new.guardianghost.com' first visit the [cloudflare pages dashboard](https://dash.cloudflare.com/a993e54a3f3b468de91f1d9d6d9499e7/workers-and-pages). Then Create Application > Pages > Upload assets. And add a bare bones html site for the first deployment. Give it a name e.g. 'gg-new'.

Once deployed you can then copy one of existing cloudflare deployments from .github/workflows. Then change the project it builds to the new one and the deploy 'projectName:' to be the new one e.g. 'gg-new'. Also change the 'directory:' to upload the new built project.

Then go the 'gg-new' or whatever dashboard on cloudflare and set the custom domain to be 'new.guardianghost.com' or whatever the name is.

That's it! There is a global api and account token. The action just needs to know the new project name and what files to upload.

NOTE: The cloudflare github action won't upload anything in a node_modules folder. This breaks the react native expo web build that has several icons in a folder called 'node_modules'. The github action has a bashscript to workaround this.

```yaml
- name: build # Plus workaround cloudflare not uploading the node_modules folder
    run: |
    cd native 
    pnpm expo export -p web
    mv dist/assets/node_modules/* dist/assets/
    find dist/_expo/static/js/web/ -type f -print0 | xargs -0 sed -i 's/assets\/node_modules/assets/g'
```

### Xcode Cloud

While all the other deployments are automated and run on Github actions, iOS does not. Instead it runs on Xcode Cloud which has been linked with the Github repo. The reasons for this are cost, ease of deployment and security. The standard apple developer account comes with 1500 minutes a month of Xcode Cloud build time for free. It's fully integrated with Apple's developer system so all the app certificate management and signing 'just works'. Finally the entire certificate system is managed by Apple so there are no security concerns or extra setup needed to protect these items for a project hosted in a public github repo. They don't even need to be added as github secrets.

Currently Xcode Cloud is pretty bare bones and has limited caching. A build takes around 10 minutes. Because of how little software is installed on Apple's build machines and the time it takes to add anything the project uses the MacOS default version of Ruby (2.6.x). Updating to 3.x.x would add significant time to the builds while Ruby is updated on every run.

#### Xcode Cloud Tips

Xcode cloud is slow and the project is currently only set to create a build on pushes to 'Main' that also include updated release notes. If you want to enhance the script you should create a new Xcode Cloud workflow that triggers on every push from your working branch. Get everything working. Then delete that workflow. The script you are looking to update lives at ``` native/ios/ci_post_clone.sh```. If in the future it becomes possible to cache the cocoa-pods (maybe it already is?) the build time could be potentially halved.
