#!/bin/bash

sudo ./nodebb stop
sudo npm i git+https://github.com/edly-io/nodebb-plugin-openedx-discussion.git
cd node_modules/nodebb-plugin-openedx-discussion
sudo npm i module-alias
cd ../..
sudo ./nodebb activate nodebb-plugin-openedx-discussion
sudo ./nodebb build
