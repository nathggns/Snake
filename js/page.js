(function(window, document, ready, undefined) {

  if (typeof ready === 'undefined') {
    var args = arguments;
    var callee = arguments.callee;
    var me = this;

    return document.addEventListener('DOMContentLoaded', function() {
      Array.prototype.push.call(args, true);
      return callee.apply(me, args);
    });
  }

  var canvas = document.querySelector('#canvas');
  var scale = function() {
    var min = document.width > document.height ? document.height : document.width;

    canvas.style.setProperty('width', min + 'px');
    canvas.style.setProperty('height', min + 'px');

    return scale;
  };

  window.addEventListener('resize', scale());

})(this, this.document);