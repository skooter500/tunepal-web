# Get Started
## Prerequisites

Node.js 0.12.0+, used to run JavaScript build tools.

## Install dependencies

Run the following line in the root directory of this project:

`git submodule update --init && npm i -g bower cordova gulp ripple-emulator && npm i && bower i`

## Build and run local server in debug mode

Run the following line in the root directory of this project:

`gulp serve`

It will build this project and create a local server to host it.
Every time there's a file change, it will automatically build the changed file and refresh your browser.
It will also sync all the browsers that are connecting to the local server,
making it much more convenient to see how the website looks like in multiple platforms simultaneously.

## Build and deploy

Run the following line to build production files and deploy to Google App Engine:

`gulp && gulp deploy`

or

`gulp && gulp deploy && gulp serve`

## Troubleshoot

If any of the commands above fails, try the following:

* Delete `node_modules` directory in project root
* Delete/rename `npm` and `npm-cache` in `%USERPROFILE%\AppData\Roaming\`
* Install npm 3 by running `npm i -g npm@3`
* Make sure you have node 0.12.0+ and npm 3.1.0+ installed, by running `node -v` and `npm -v`
* If npm version is still less than 3, change PATH variable:
move npm directory (e.g. `C:\Users\????\AppData\Roaming\npm`, maybe in user-specific PATH)
to the left of node directory (e.g. `C:\Program Files\nodejs`).
Open a new cmd.exe to make sure PATH has been updated.
If not, try opening cmd.exe by Win-R instead of by clicking "Open command prompt" in File Explorer,
or turning off `Launch folder windows in a separate process` in File Explorer options,
or kill and restart explorer.exe.
* Copy the `start` script in `package.json` and run it in command line.
* Run `gulp serve`

# Documentation

* [Frameworks and Libraries](https://github.com/skooter500/tunepal-web/wiki/Frameworks-and-Libraries)
* [File Structure](https://github.com/skooter500/tunepal-web/wiki/File-Structure)
