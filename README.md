Combine
==============
Combine separate file into one using Node.js


Parameters
--------------
-i: input file path, it can be configuration file or dictionary;
-o: output file path;
-w: keep watching the changes, if no parameter just combine once;

Sample
--------------
    node ./combine.js -i static/js/makefile.inc -o static/live/src.js -w