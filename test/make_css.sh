#!/bin/bash
echo start watching css files.
node ../combine.js -i static/css/makefile.inc -o static/live/src.css -w
