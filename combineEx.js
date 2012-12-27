var fs    = require("fs"),
    qs    = require("querystring"),
    path  = require("path");

var Combine = require('./combine.js');

var CombineEx = module.exports = function(configFile, watch) {

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
    timer = setTimeout(function() {
      timer = null;
    }, 300);

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
        (line[0] != '#') && lines.push(line.trim());
      });

      //handling lines
      var i = 0,
          l = lines.length;

      do {
        //config start with $
        if (lines[i][0] == '$') {
          //parse the configuration;
          /*
          in:   directory or configuration path
          out:  output file path
          */
          var cfg   = qs.parse(lines[i].substr(1)),
              files = [];

          //parse the list in the configuration;
          while(++i < l) {
            if (lines[i][0] != "$") {
              //base folder + file's name
              files.push(path.join(cfg.in, lines[i]));
            } else {
              break;
            }
          };

          var combine;

          files.length > 0
            ? (combine = new Combine(files, cfg.out, watch))
            : (combine = new Combine(cfg.in, cfg.out, watch));

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
      config  = Combine.parse(args, '-i'),
      watch   = args.indexOf(' -w') > 0;

  config && CombineEx(config, watch).init();

})();