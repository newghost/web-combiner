var fs    = require("fs"),
    qs    = require("querystring"),
    path  = require("path");

var Combine = require('./combine.js');

var CombineEx = module.exports = function(configFile, watch) {

  var combines = [];

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
        var cfg = qs.parse(lines[i].substr(1)),
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


/*
* Call it from command lines
* -i: configuration path
* -w: keep watch the changes?
*/
(function() {

  var args    = process.argv.join(' '),
      config  = Combine.parse(args, '-i'),
      watch   = args.indexOf(' -w') > 0;

  config && CombineEx(config, watch);

})();