/*
* Description: Combine all the files in a specfic folder into one file.
* Author: Kris Zhang
* Blog: http://c52u.com
*/

(function(){

  var fs = require("fs"),
      path = require("path");

  var combine = module.exports = {
    //Where codes from?
    sourceDir: "",
    //Combined to which file.
    targetFile: "",
    //Flag: Is in the combine process already?
    isCombine: false,

    //Interface
    init: function(sourceDir, targetFile){
      combine.sourceDir = sourceDir;
      combine.targetFile = targetFile;

      //Combine at the first running, then watching the changes.
      if(combine.combine()) combine.watch();
    },

    //Watch changes on source folder
    watch: function(){
      fs.watch(combine.sourceDir, function(evt, filename){
        //When it's in the combine process, ignore the changes.
        if(combine.isCombine) return;
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

      combine.isCombine = true;
      try{
        var files = fs.readdirSync(combine.sourceDir),
            //File name must be consist of number, character, and "-" "_", "."
            fileReg = /^[a-zA-Z0-9-_\.]+$/;

        files.forEach(function(file){
          if(fileReg.test(file)){

            var fullPath = path.join(combine.sourceDir, file),
                stat = fs.statSync(fullPath);

            if(!stat.isFile()){
              console.log("Skip folder:" + file);
            }else{
              var data = fs.readFileSync(fullPath);
              oStream.write("\r\n/*" + file + "*/\r\n");
              oStream.write(data);

              console.log("Adding file:" + file);
            }
          }else{
            console.log("Skip file:" + file);
          }
        });
        oStream.end();
        console.log("Complete!");
      }
      catch(err){
        console.log(err);
        r = false;
      }
      combine.isCombine = false;

      return r;
    }
  };

})();