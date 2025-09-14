---
title: Continuous Integration
description: Details on continuous integration
---

The aim is to have an ultra fast and simple CI.

The CI is powered by github actions and the aims are:
1. Full CI run should only take 1 min for the entire monorepo.
2. CI costs should happily fit inside githubs free tier. That's 2000 minutes a month. However none of these minutes are currently used as this is a public repo and runs are not counted towards this total.
3. Try and use some of the new generation of Rust based tools to keep every stage as fast as possible.

#### Mandatory Checks

The main branch is protected and requires all merges to come via a pull request (PR). Before the PR is merged the CI is run and in the github settings for branch protection the 'Main CI' has to successfully pass. The UI is a bit confusing, to add a CI job it must be 'named'. See the snippet below for an example.

```yaml
jobs:
  main-ci-mono:
    name: Main CI Mono
    timeout-minutes: 5
    runs-on: ubuntu-latest
```

The CI is powered by
[Dependabot](https://github.com/dependabot) is enabled on the repo and runs everyday. In general the number of dependencies is kept as low as possible. However the aim is to only have items updated on a weekly basis.

### Oracle Cloud VM setup
Oracle Cloud's free tier is used to host a linux VM running a [Turborepo](https://turbo.build) remote cache. The VM is simply configured to use the free AMD x64 instance and the Ubuntu 22.10 image. I did try the Oracle Linux image and found it to be slow and unreliable. The VM would often get stuck.

If the VM needs to be recreated the following steps are required.
1. Terminate the old VM. It will hang around a few hours till Oracle remove it.
2. Create a new free tier x64 based Ubuntu image.
3. Opt to have Oracle create the public/private keys and download them.
4. To use the private key you need to change its permissions e.g `chmod 400 ssh-key-2024-03-11.key`
5. SSH into the new VM e.g. `ssh -i ssh-key-2024-03-11.key ubuntu@<ip address>`
7. 
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

8. sudo apt-get update
9. sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
10. Install nano `sudo apt-get install nano`
11. create a .env file ` nano .env`
12. Add the following to the .env and save it
```txt
NODE_ENV=production
PORT=3000
TURBO_TOKEN=<SECRET>
LOG_LEVEL=info
STORAGE_PROVIDER=local
```
Make sure <SECRET> is whatever text secret is being used on github actions. Don't literally copy the above item!
13. Congrats on saving and exiting nano.
14. Tell docker to setup the cache `sudo docker run --restart always -d --env-file=.env -p 3000:3000 ducktors/turborepo-remote-cache`
15. Update the github actions and dependabot secrets with the new URL. NOTE!!! don't have a trailing slash at the end of the url e.g. use `http://<ip address>:3000` not `http://<ip address>:3000/`as some versions of turborepo fail to work with the trailing slash.
:::tip[Enterprise CI]
Self hosting a Gitlab runner could enable an even faster CI. So far getting ccache to work with Gitlab has not been successful. Also quite some time is wasted on downloading and uploading gradle caches. 
:::
