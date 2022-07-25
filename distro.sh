#!/usr/bin/env bash
# curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"
cd ~/Desktop
rm -rf ~/Desktop/keystroke
git clone https://github.com/drewburns/keystroke.git keystroke
cd keystroke
npm i --force
npm install sqlite3 --build-from-source --target_arch=arm64 --fallback-to-build
npm run start
# cd ~/Desktop
# printf "cd ~/Desktop/keystroke && npm start" >> StartKeystroke.sh
