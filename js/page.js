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

  var game = new Game(canvas);

  var Background = (function() {
    var Background = function Background() {};

    Background.prototype.render = function(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.background;
        ctx.rect(0, 0, this.game.game.width, this.game.game.height);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    };

    return Background;
  })();

  game.add(new Background());

})(this, this.document);