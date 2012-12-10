#!/bin/bash
echo start watching javascript files.
node ../Combine.js -i static/js/makefile.inc -o static/live/src.js -w
