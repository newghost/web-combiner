Combine
==============
Combine separate file into one using Node.js


Parameters
--------------
- -in:    input file path, it can be configuration file or dictionary;
- -out:   output file path;
- -watch: keep watching the changes, if no parameter just combine once;


Sample: Combine directory
--------------
    node ./combine.js -in static/css              -out static/live/src.js -watch true

Sample: Combine file list 
--------------
    node ./combine.js -in static/js/makefile.inc  -out static/live/src.js -watch true


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
- out:    output file path;
- run:    Running combine at the first time?
- watch:  Keep watching the changes?

Sample: CombineEx
--------------
    node ./combineEx.js -in static/MakeFile.cfg -watch true -run true

Parameters:
--------------
In command line, priority will be higher than parameters in configuration file
- -in:    Input file path, it can be configuration file or dictionary;
- -run:   Running combine at the first time?
- -watch: Keep watching the changes?
