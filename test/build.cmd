#!/bin/bash
node ../combine.js -i static/js/makefile.inc -o static/live/src.js
node ../combine.js -i static/css/makefile.inc -o static/live/src.css

java -jar tools/yuicompressor-2.4.7.jar static/live/src.js -o static/live/src.min.js
java -jar tools/yuicompressor-2.4.7.jar static/live/src.css -o static/live/src.min.css