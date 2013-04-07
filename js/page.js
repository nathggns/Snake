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
    var Background = function Background() {
        this.order = 1;
    };

    Background.prototype.render = function(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.background;
        ctx.rect(0, 0, this.game.game.width, this.game.game.height);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    };

    return Background;
  })();

  var Player = (function() {

    var Player = function Player() {
        this.order = 2;
        this.width = this.height = 50;
    };

    Player.prototype.render = function(ctx) {
        ctx.beginPath();
        ctx.fillStyle = '#aaaaaa';

        var x = (this.game.game.width / 2) - (this.width / 2);
        var y = (this.game.game.height / 2) - (this.height / 2);

        ctx.rect(x, y, this.width, this.height);
        ctx.fill();
    };

    return Player;

  })();

  game.add(new Background());
  game.add(new Player());

})(this, this.document);