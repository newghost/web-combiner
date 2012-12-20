/*
* Description: Combine the files into one, support directory and config files.
* Author: Kris Zhang
* Blog: http://c52u.com
*/

//Combine namespace
var Combine;

(function() {

  var fs = require("fs"),
      path = require("path");

  Combine = module.exports = function(sourceFile, targetFile, watch) {
    var self  = this,
        files = [],           //combine list
        list  = [],           //watch list
        dir   = "";           //combine root directory

    //Interface
    var init = function() {
      //Combine type, it's a directory or cfg file
      fs.stat(sourceFile, function(err, stat) {
        if (err) {
          console.log(err);
          return;
        }

        //It's a configuration files or dictionary
        if (stat.isFile()) {
          setCfg(sourceFile);
        } else {
          setDir(sourceFile);
        }
      });
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

      watch && files.forEach(function(file) {
        if (list.indexOf(file) < 0) {
          watchFile(file);
          list.push(file);
        };
      });

      self.files = files;

      return files;
    };

    //Watch changes on source folder
    var setDir = function(directory) {
      dir = directory;

      //Combine at the first running, then watching the changes.
      if (combineDir()) {
        watch && fs.watch(directory, combineDir);
      }
    };

    //Watch chagnes on configuration fiel
    var setCfg = function(configuration) {
      var combineCfg = function() {
        //get file list from the configuration files.
        getFiles(configuration);
        combine();
      };

      //Listen on the change on the configuration file
      watch && fs.watch(configuration, combineCfg);

      //combine at the first running
      combineCfg();
    };

    //Watch changes on a file
    var watchFile = function(file) {
      try {
        fs.watch(path.join(dir, file), combine);
      } catch (err) {
        console.log("watchFile", file, err);
      }
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

    //
    init();
  };

})();


/*
* call it from command lines
* -i filepath: input directory or cfg file
* -o filepath: output files
* -w: keep watch the changes?
*/
(function() {

  /*
   * parsing parameters from command line
   * etc, node combine.js -i configfile.path -o outputfile.path
   * the parameter will be: '-' + one character, like: parsing('-o');
   */
  var parsing = function(args, key) {
    if (!key || key.length != 2 || key[0] != '-') return;

    var reg = new RegExp(" " + key + "((?! -\\w).)*", "g"),
        param = args.match(reg);

    if (param && param[0]) {
      return param[0].substr(4, 500);
    }
  };

  var args    = process.argv.join(' '),
      input   = parsing(args, '-i'),
      output  = parsing(args, '-o');

  input && output && Combine(input, output, args.indexOf(' -w') > 0);

})();
