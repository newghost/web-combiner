#!/bin/bash
node ../Combine.js -i static/js/makefile.inc -o static/live/src.js
node ../Combine.js -i static/css/makefile.inc -o static/live/src.css
echo compress them using YIU compressor
java -jar tools/yuicompressor-2.4.7.jar static/live/src.js -o static/live/min.js
java -jar tools/yuicompressor-2.4.7.jar static/live/src.css -o static/live/min.css
echo complete
