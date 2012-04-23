/*
* Description: Combine the files into one, support directory and config files.
* Author: Kris Zhang
* Blog: http://c52u.com
*/

(function(){

  var fs = require("fs"),
      path = require("path");

  var combine = module.exports = {
    //Where codes from?
    sourceFile: "",
    //Combined to which file.
    targetFile: "",

    //Interface
    init: function(sourceFile, targetFile){
      //Combine
      fs.stat(sourceFile, function(err, stat){
        if(err) {
          console.log(err);
          return;
        }

        combine.sourceFile = sourceFile;
        combine.targetFile = targetFile;

        if(stat.isFile()){
          var contents = fs.readFileSync(sourceFile, 'utf-8'),
              files = [];

          //read a file line-by-line
          contents.match(/[^\r\n]+/g).forEach(function(line){
            //comments begin with '#', remove them
            if(line[0] != '#'){
              console.log(path.join(combine.sourceFile, line));
              files.push(line);
            }
          });

          console.log("files", files );

        }else{
          //Combine at the first running, then watching the changes.
          if(combine.combine()){
            combine.watch();
          }
        }
      });
    },

    //Watch changes on source folder
    watch: function(){
      fs.watch(combine.sourceFile, function(evt, filename){
        //combine when changes.
        combine.combine();
      });
    },

    //Create output stream
    createStream: function(){
      var stream;
      try{
        stream = fs.createWriteStream(combine.targetFile);
      }
      catch(err){
        console.log("Can't create output stream: ", err);
      }
      return stream;
    },

    //Combine handler
    combine: function(){
      var oStream = combine.createStream(), r = true;
      if(!oStream){
        return false;
      }

      try{
        var files = fs.readdirSync(combine.sourceFile),
            //File name must be consist of numbers characters or "-" "_", "."
            fileReg = /^[a-zA-Z0-9-_\.]+$/;

        files.forEach(function(file){
          if(fileReg.test(file)){

            var fullPath = path.join(combine.sourceFile, file),
                stat = fs.statSync(fullPath);

            if(!stat.isFile()){
              console.log("Skip folder:" + file);
            }else{
              var data = fs.readFileSync(fullPath);
              oStream.write("/*" + file + "*/\r\n");
              oStream.write(data);
              oStream.write("\r\n");

              console.log("Adding file:" + file);
            }
          }else{
            console.log("Skip file:" + file);
          }
        });
        oStream.end();
        console.log("Complete!\r\n\r\n");
      }
      catch(err){
        console.log(err);
        r = false;
      }

      return r;
    }
  };

})();