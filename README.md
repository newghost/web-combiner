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

Sample: CombineEx configuration file
--------------
    node ./combineEx.js -i static/MakeFile.cfg -w

Sample: Configuration File
--------------
    #Configuration File

    #Combine Directory
    $in=static/css&out=static/live/dir.css

    #Combine Javascript
    $in=static/js&out=static/live/all.js
      lib/a.js
      b.js
      c.js

    #Combine CSS
    $in=static/css&out=static/live/all.css
      site.css
      a.css
      b.css