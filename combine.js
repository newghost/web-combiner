#!/usr/bin/env node

/*
* Description: Combine the files into one, support directory and config files.
* Author: Kris Zhang
* https://github.com/newghost/node-combine
*/

//Combine namespace
var Combine;

(function() {

  var fs    = require("fs"),
      path  = require("path");

  Combine = module.exports = function(source, targetFile, watch, runFirst) {
    var self      = this,
        list      = [],           //watch list, files, directory, configuration
        watchers  = [],           //watcher list, fsWatch objects
        timer     = null,         //avoid execute twice
        dir       = "";           //combine root directory

    self.files = [];              //combine list

    //default parameters
    (typeof runFirst == "undefined") && (runFirst = true);

    //Interface
    var init = function() {
      switch (source.constructor) {
        case Array:        //It's file list
          setList(source);
          break;
        case String:       //It's configuration file or directory path
          //Combine type, it's a directory or cfg file
          fs.stat(source, function(err, stat) {
            if (err) {
              console.log(err);
              return self;
            }

            //It's a configuration files or dictionary
            if (stat.isFile()) {
              setCfg(source);
            } else {
              setDir(source);
            }
          });
          break;
      }

      return self;
    };

    //get output stream
    var getStream = function() {
      var stream;
      try {
        stream = fs.createWriteStream(targetFile);
      } catch (err) {
        console.log("Can't create output stream: ", err);
      }
      return stream;
    };

    //Watch changes on file list
    var setList = function(files) {
      watchList(files);
      runFirst && combine();
    };

    //Watch changes on source folder
    var setDir = function(directory) {
      dir = directory;

      //Combine at the first running, then watching the changes.
      watch && watchFile(directory, combineDir);
      runFirst && combineDir();
    };

    //Watch chagnes on configuration fiel
    var setCfg = function(configuration) {
      var combineCfg = function() {
        //get file list from the configuration files.
        getFiles(configuration);
        runFirst && combine();
      };

      //Listen on the change on the configuration file
      watch && watchFile(configuration, combineCfg);

      //combine at the first running
      combineCfg();
    };

    //get files from cfgFile, return absolute file path
    var getFiles = function(cfgPath) {
      var contents = fs.readFileSync(cfgPath, 'utf-8'),
          files = [],
          lastIdx = cfgPath.lastIndexOf('\\');

      //redefine directory
      dir = cfgPath.substring(0, lastIdx > -1 ? lastIdx : cfgPath.lastIndexOf('/') );

      //read a file line-by-line
      contents.match(/[^\r\n]+/g).forEach(function(line) {
        //ignore comments that begin with '#'
        if (line[0] != '#') {
          files.push(line);
        }
      });

      watchList(files);

      return files;
    };

    //Watch changes on a file
    var watchFile = function(file, caller) {
      try {
        if (list.indexOf(file) < 0) {
          list.push(file);
          watchers.push(
            fs.watch(file, caller)
          );
        }
      } catch (err) {
        console.log("watchFile", file, err);
      }
    };

    //Watch set of files
    var watchList = function(files) {
      watch && files.forEach(function(file) {
        watchFile(path.join(dir, file), combine);
      });

      self.files = files;
    };

    //Combine directory
    var combineDir = function() {
      try {
        var allFiles  = fs.readdirSync(dir),
            files     = [],
            //File name must be consist of numbers characters or "-" "_", "."
            fileReg   = /^[a-zA-Z0-9-_\.]+$/;

        allFiles.forEach(function(file) {
          if (fileReg.test(file)) {
            files.push(file);
          } else {
            console.log("Skip file:" + file);
          }
        });

        self.files = files;

        return combine();
      } catch (err) {
        console.log("combineDir", err);
        return false;
      }
    };

    //Combine set of files into one
    var combine = function() {
      /*
      Avoid execute twice at the same time
      When make change on file, two change events will be popupped.
      So make hot fix for it
      */
      if (timer) return;
      timer = setTimeout(function() {
        timer = null;
      }, 300);

      console.log("Output >> %s", targetFile);

      var oStream = getStream(),
          r = true;

      if (!oStream) {
        return false;
      }

      var files = self.files;

      try {
        files.forEach(function(file) {
          var fullPath  = path.join(dir, file),
              stat      = fs.statSync(fullPath);

          if (!stat.isFile()) {
            console.log("Skip folder:" + file);
          } else {
            var data = fs.readFileSync(fullPath);
            oStream.write("/*" + file + "*/\r\n");
            oStream.write(data);
            oStream.write("\r\n");

            console.log("Adding file:" + file);
          }
        });
        oStream.end();

        //trigger onChange event
        self.onChange && self.onChange();

        var endTime = new Date();
        console.log("count:",
          files.length,
          ", date:", new Date().toTimeString(),
          "\r\n\r\n"
        );
      } catch (err) {
        console.log("combine", err);
        r = false;
      }

      return r;
    };

    //Stop watch listening the chages
    var stop = function() {
      try {
        watchers.forEach(function(watcher) {
          watcher.close();
        });
      } catch (err){
        console.log("stop", err);
      }

      return self;
    };

    //public API
    self.init     = init;
    self.stop     = stop;
    self.onChange = null;

    return self;
  };

  /*
   * Parsing parameters from command line params
   * etc, node combine.js -i configfile.path -o outputfile.path
   * the parameter will be: '-' + one character, like: parsing('-o');
   */
  var parse = function(args, key) {
    if (!key || key[0] != '-') return;

    var reg = new RegExp(" " + key + "[ \t]+[^ $]+", "g"),
        param = args.match(reg);

    if (param && param[0]) {
      return param[0].trim().substr(key.length).trim();
    }
    return "";
  };

  /*
  * Join path with old separator, etc: "/" or "\"
  */
  var join = function() {
    var args  = arguments,
        l     = args.length;

    if (l < 1) return "";

    var arg       = args[0],
        separator = arg.indexOf('\\') > -1 ? '\\' : '/',
        joinPath  = arg;

    for (var i = 1; i < l; i++) {
      var endChar = joinPath[joinPath.length - 1];

      //fix separator
      (endChar != '/' && endChar != '\\') && (joinPath += separator);

      joinPath += args[i];
    }

    return joinPath;
  };

  // Static method
  Combine.parse = parse;
  Combine.join  = join;

})();


/*
* Call it from command lines
* -in: filepath: input directory or path of files.list
* -out: filepath: output files
* -watch: keep watch the changes?
*/
(function() {

  var args    = process.argv.join(' '),
      input   = Combine.parse(args, '-in'),
      output  = Combine.parse(args, '-out'),
      watch   = Combine.parse(args, '-watch'),
      run     = Combine.parse(args, '-run');

  //default parameter: watch is false, run is true
  watch = watch == "true" || watch == "1";
  run   = run != "false"  && run != "0";

  input && output 
    ? Combine(input, output, watch).init()
    : console.log("Useage:\n$ ./combine -in input_file -out output_file -watch [release]");

})();
