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
    ?in=static/css&out=static/live/dir.css&run=false

    #Combine Javascript
    ?in=static/js&out=static/live/debug.js
      lib/a.js
      b.js
      c.js
    #Minify the combined javascript
    $java -jar tools/yuicompressor-2.4.7.jar static/live/debug.js -o static/live/debug.min.js

    #Combine CSS, just combine at the first time, doens't watch change on it.
    ?in=static/css&out=static/live/debug.css&watch=0
    #Minify the combined css
    $java -jar tools/yuicompressor-2.4.7.jar static/live/debug.css -o static/live/debug.min.css
      site.css
      a.css
      b.css

Parameters:
--------------
In configuration file
- ?:      Parameter begin with "?"
- $:      Commands that execute after combined.
- in:     Input file path, it can be configuration file or dictionary;
- run:    Running combine at the first time?
- watch:  Keep watching the changes?

Parameters:
--------------
In command line, priority will be higher than parameters in configuration file
- -i: Input file path, it can be configuration file or dictionary;
- -r: Running combine at the first time?
- -w: Keep watching the changes?

Sample: CombineEx
--------------
    node ./combineEx.js -i static/MakeFile.cfg -w -r
