var fs            = require("fs"),
    qs            = require("querystring"),
    path          = require("path"),
    child_process = require("child_process");

var Combine   = require('./combine.js');

var CombineEx = module.exports = function(configFile, watch, run) {

  var self      = this,
      combines  = [],
      timer     = null;

  //Init configuration
  var init = function() {
    fs.exists(configFile, function(exists) {
      if (!exists) {
        console.log(configFile, "doesn't exist.");
        return;
      }

      watch && fs.watch(configFile, function() {
        //stop the old listeners in configuration file
        stopEx();
        //combine again;
        combineEx();
      });

      //combine at the first run
      combineEx();
    });
  };

  //Stop listening
  var stopEx = function() {
    while (combines.length) combines.pop().stop();
  };

  //Combine 
  var combineEx = function() {

    /*
    Avoid execute twice at the same time
    When make change on file, two change events will be popupped.
    So make hot fix for it
    */
    if (timer) return;
    timer = setTimeout(function() { timer = null; }, 300);

    fs.readFile(configFile, function(err, contents) {
      if (err) {
        console.log(err);
        return;
      }

      var lines = [];

      //reading lines
      contents = contents.toString();
      //read a file line-by-line
      contents.match(/[^\r\n]+/g).forEach(function(line) {
        //ignore comments that begin with '#'
        line = line.trim();
        (line[0] != '#') && lines.push(line.trim());
      });

      //handling lines
      var i = 0,
          l = lines.length;

      do {
        //config begin with ?
        if (lines[i][0] == '?') {
          //parse the configuration;
          /*
          in:   directory or configuration path
          out:  output file path
          */
          var cfg   = qs.parse(lines[i].substr(1)),
              cmd   = "",
              files = [];

          //parse the list in the configuration;
          while(++i < l) {
            var firstChar = lines[i][0];

            if (firstChar == "$") {
              cmd = lines[i].substr(1);
            } else if (firstChar != "?") {
              //base folder + file's name, using old separator
              files.push(Combine.join(cfg.in, lines[i]));
            } else {
              break;
            }
          };

          /*
          * Parse force run at the first time parameters, default is true
          * default
          *   watch: false
          *   run:   true
          */
          var _watch  = watch || cfg.watch == "true" || cfg.watch == "1",
              _run    = run   || (cfg.run != "false" && cfg.run != "0");

          var combine;

          files.length > 0
            ? (combine = new Combine(files,  cfg.out, _watch, _run))
            : (combine = new Combine(cfg.in, cfg.out, _watch, _run));

          //Is commands there, persistent commands
          cmd && (function(cmd) {
            combine.onChange = function() {
              console.log("Execute onChange:", cmd);
              child_process.exec(cmd, function (err, stdout, stderr) {
                if (err || stderr) {
                  console.log(err, stderr);
                  return
                }
                console.log(stdout);
              });
            }
          })(cmd);

          combine.init();
          combines.push(combine);
        }
      } while (i < l);
    });
  };

  //public method
  self.init = init;

  return self;
};


/*
* Call it from command lines
* -i: configuration path
* -w: keep watch the changes?
*/
(function() {

  var args    = process.argv.join(' '),
      config  = Combine.parse(args, '-in'),
      watch   = Combine.parse(args, '-watch'),
      run     = Combine.parse(args, '-run');

  //default parameter: watch is false, run is true
  watch = watch == "true" || watch == "1";
  run   = run != "false"  && run != "0";

  config && CombineEx(config, watch, run).init();

})();