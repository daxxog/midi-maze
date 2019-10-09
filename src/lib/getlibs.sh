#!/bin/bash
cd js
rm *.min.js

node ../getlibs.js sh
sh getlibscurl.sh
rm getlibscurl.sh
ls