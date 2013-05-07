#!/bin/bash
node ../combine.js -in static/js/makefile.inc   -out static/live/src.js
node ../combine.js -in static/css/makefile.inc  -out static/live/src.css

java -jar tools/yuicompressor-2.4.7.jar static/live/src.js  -o static/live/src.min.js
java -jar tools/yuicompressor-2.4.7.jar static/live/src.css -o static/live/src.min.css