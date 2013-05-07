#! /usr/bin/env node

//depandences
//npm install jsdom
//npm install uglify-js
var fs        = require("fs")
  , path      = require("path")
  , jsdom     = require("jsdom")
  , UglifyJS  = require("uglify-js");


//These two functions comes from https://github.com/remy/inliner.git
function compressCSS(css) {
  return css
    .replace(/\s+/g, ' ')
    .replace(/:\s+/g, ':')
    .replace(/\/\*.*?\*\//g, '')
    .replace(/\} /g, '}')
    .replace(/ \{/g, '{')
    // .replace(/\{ /g, '{')
    .replace(/; /g, ';')
    .replace(/\n+/g, '');
}

function removeComments(element) {
  if (!element || !element.childNodes) return;
  var nodes = element.childNodes,
      i = nodes.length;
  
  while (i--) {
    if (nodes[i].nodeName === '#comment' && nodes[i].nodeValue.indexOf('[') !== 0) {
      element.removeChild(nodes[i]);
    }
    removeComments(nodes[i]);
  }
}

var inline = function(htmlUrl, tarUrl, release) {
  if (!htmlUrl && !tarUrl) {
    console.log("Useage:\n$ ./inline.js srcUrl tarUrl [release]");
    return
  };

  var htmlDir =  path.dirname(htmlUrl);

  var getFile = function(url) {
    var file = path.join(htmlDir, url);
    var text = fs.readFileSync(file, 'utf8');
    return text.toString();
  };

  jsdom.env({
    html:     htmlUrl,
    scripts: ["js/jquery-1.9.1.min.js"],
    done: function (errors, window) {
      var $ = window.$
        , html;

      //remove debug script and remove comments from html
      $(".jsdom").remove();

      $("style").each(function() {
        var $this = $(this),
            url   = $this.attr("data-url");

        if (!url) return;

        $this.text(getFile(url));
      });

      //release mode, remove comments and space
      if (release) {
        removeComments(window.document.documentElement);

        html = window.document.innerHTML;
        html = html.replace(/\s+/g,     ' ');
        html = html.replace(/[\r\n]+/g, ';');

        window.document.innerHTML = html;
      }

      $("link").each(function() {
        var $this = $(this),
            url  = $this.attr("href");

        if (!url) return;

        //add the new style tag, and remove the old link element.
        var code = getFile(url);

        if (release) {
          code = compressCSS(code);
        }

        var $style = $("<style></style>");
        $this.after($style).remove();
        $style.text(code);
      });

      $("script").each(function() {
        var $this = $(this),
            url   = $this.attr("src");

        if (!url) return;

        $this.removeAttr("src");

        // optionally you can pass another argument with options:
        var code = getFile(url);

        if (release) {
          var ast         = UglifyJS.parse(code)
            , compressor  = UglifyJS.Compressor();

          ast.figure_out_scope();
          ast   = ast.transform(compressor);
          code  = ast.print_to_string(); // get compressed code
        }

        $this.text(code);
      });

      html = "<!DOCTYPE html>" + window.document.innerHTML.trim();

      fs.writeFile(tarUrl, html);
    }
  });
}

module.exports = inline;

/*
* Main functions
* inline("mob/mob-lite.html", "mob/mob-lite.src.html");
* inline("mob/mob-lite.html", "mob/mob-lite.min.html", true);
*/
(function() {
  var args = [];

  process.argv.forEach(function(arg) {
    arg != "node"
      && arg.indexOf("inliner.js") < 0
      && args.push(arg);
  });

  args.length > 1 && inline.apply(this, args);
}());