#!/bin/bash
cd src
cd lib
./getlibs.sh
cd ../..
tar -cvzf midi-maze.tgz src