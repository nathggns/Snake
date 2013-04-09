var Game = (function(window, document, undefined) {

  var Game = function Game(canvas) {
    this.canvas = canvas;
    this.$canvas = $(canvas);
    this.objects = [];
    this.ctx = this.canvas.getContext('2d');
    this.game = {};
    this.keys = {};

    this.assignResizeHandler();
    this.assignKeyHandler();
    this.startLoop();
  };

  Game.prototype.add = function(obj) {

    obj.game = this;

    if (typeof obj.init === 'function') obj.init();

    this.objects.push(obj);

    this.objects.sort(function(a, b) {
      if (typeof a.order === 'undefined') a.order = this.objects.indexOf(a);
      if (typeof b.order === 'undefined') b.order = this.objects.indexOf(b);

      return a.order > b.order ? 1 : -1;
    });

    return this;
  };

  Game.prototype.remove = function(obj) {
    this.objects.splice(this.objects.indexOf(obj), 1);

    return this;
  };

  Game.prototype.assignResizeHandler = function() {

    var game = this;

    var handler = function() {

      game.game.width = parseInt(game.$canvas.attr('width'), 10);
      game.game.height = parseInt(game.$canvas.attr('height'), 10);

      return handler;
    };

   $(document).on('resize', handler());
  };

  Game.prototype.assignKeyHandler = function() {
    var canvas = this.$canvas;

    if (!canvas.attr('tabindex')) {
      canvas.attr('tabindex', -1);
    }

    canvas.focus();

    var game = this;

    canvas.on('keydown', function(e) {
      game.keys[e.which] = true;
    });

    canvas.on('keyup', function(e) {
      while (e.which in game.keys) {
        delete game.keys[e.which];
      }
    });

    canvas.on('blur', function(e) {
      game.keys = {};
    });
  };

  Game.prototype.startLoop = function() {
    var requestAnimationFrame =
          window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          function(callback) {
            return setTimeout(callback, 16);
          };

    var game = this;

    var loop = function() {
      game.ctx.clearRect(0, 0, game.game.width, game.game.height);

      game.objects.forEach(function(object) {
        if (object.update) object.update(game.ctx);
        object.render(game.ctx);
      });

      return requestAnimationFrame(loop);
    };

    loop();
  };

  return Game;

})(this, this.document);