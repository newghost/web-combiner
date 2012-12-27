Combine
==============
Combine separate file into one using Node.js


Parameters
--------------
- -i: input file path, it can be configuration file or dictionary;
- -o: output file path;
- -w: keep watching the changes, if no parameter just combine once;


Sample: Combine directory
--------------
    node ./combine.js -i static/css -o static/live/src.js -w

Sample: Combine file list 
--------------
    node ./combine.js -i static/js/makefile.inc -o static/live/src.js -w


CombineEx
==============
Combine files from configuration

Sample: Configuration
--------------
    #Configuration File

    #Combine Directory, doesn't run combine at the first time
    ?in=static/css&out=static/live/dir.css&run=0

    #Combine Javascript
    ?in=static/js&out=static/live/all.js
      lib/a.js
      b.js
      c.js

    #Combine CSS, just combine at the first time, doens't watch change on it.
    ?in=static/css&out=static/live/all.css&watch=0
      site.css
      a.css
      b.css

Parameters:
--------------
- ?:      Parameter begin with "?"
- in:     Input file path, it can be configuration file or dictionary;
- run:    Running at the first time?
- watch:  Keep watching the changes?

Sample: CombineEx
--------------
    node ./combineEx.js -i static/MakeFile.cfg -w
