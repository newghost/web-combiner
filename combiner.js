var fs    = require('fs')
  , path  = require('path')


var Combine = function(inputFile, outputFile) {

  var TARGET  = {}
    , curJS   = ''
    , curCSS  = ''
    , CTRL  

  var mergeCssJs = function() {
    var files         = Object.keys(TARGET)
      , inputFolder   = path.dirname(inputFile)

    files.forEach(function(targetFile) {

      var files  = TARGET[targetFile]

      files.forEach(function(file, idx) {
        var filePath = path.join(inputFolder, file)

        try {
          var codes = fs.readFileSync(filePath).toString()
          TARGET[targetFile][idx] = codes
        } catch (e) {
          console.log(e)
        }
      })

      fs.writeFile(path.join(inputFolder, targetFile), TARGET[targetFile].join(CTRL), function(err) {
        if (err) {
          console.log(err)
        }
      })
    })
  }

  var grepUrl = function(line, tag) {
    var idx = line.toLowerCase().indexOf(tag)

    line = line.substring(idx + tag.length)

    '\'"'.indexOf(line[0]) > -1 && (line = line.substr(1))

    idx = line.indexOf('"')
    idx < 0 && (idx = line.indexOf('\''))
    idx < 0 && (idx = line.indexOf(' '))
    idx < 0 && (idx = line.indexOf('>'))

    line = line.substring(0, idx)

    return line
  }

  var pickupFiles = function(line) {
    var formatLine = line.trim().toLowerCase()

    //<!--#output="/css/all.css"-->
    if (formatLine.indexOf('<!--#output="') == 0) {
      var file = line.substr(13)
      file = file.substr(0, file.indexOf('"-->'))

      if (file.indexOf('.css') > 0) {
        TARGET[file] = []
        curCSS = file
        return '<link rel="stylesheet" type="text/css" href="' + file + '">'
      }

      if (file.indexOf('.js') > 0) {
        TARGET[file] = []
        curJS = file
        return '<script type="text/javascript" src="' + file + '"></script>'
      }

      return line
    }

    if (curCSS && formatLine.indexOf('<link') == 0) {
      var url = grepUrl(line, 'href=')

      if (url) {
        TARGET[curCSS].push(url)
        return ''
      }
    }

    if (curJS && formatLine.indexOf('<script') == 0) {
      var url = grepUrl(line, 'src=')

      if (url) {
        TARGET[curJS].push(url)
        return ''
      }
    }

    return line
  }

  var removeEmpty = function(line) {
    return line
  }

  var init = function() {
    if (!inputFile) {
      console.error('no input html file')
      return
    }

    !outputFile && (outputFile = inputFile.replace('.htm', '.out.htm'))

    fs.readFile(inputFile, function(err, data) {
      var CODES = data.toString()

      CTRL  = CODES.indexOf('\r\n') > 0 ? '\r\n' : '\n'

      var codes   = CODES.split(/[\r\n]+/g)

      var htmls = codes.map(pickupFiles)
      htmls = htmls.filter(removeEmpty)

      mergeCssJs()

      fs.writeFile(outputFile, htmls.join(CTRL), function(err) {
        if (err) {
          console.log(err)
        }
      })
    })
  }

  init()
}


/*
node combiner inputFile ouptFile
*/
var defaultCommand = function() {
  var inputFile   = process.argv[2]
    , outputFile  = process.argv[3]

  if (inputFile) {
    Combine(inputFile, outputFile)
  }
}



defaultCommand()



module.exports = Combine