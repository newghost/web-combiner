/*static\js\c.js*/
(function(window){
  window.setTimeout(function(){
    alert("test");
  }, 1000);
})(window);
/*static\js\a.js*/
(function($){
  $(document).ready(function(){
    $("#demo").show();
  });
})(jQuery);
/*static\js\b.js*/
var namespace = {};

(function(namespace){
  namespace.api = function(){
    console.log(this);
  };
})(namespace);
