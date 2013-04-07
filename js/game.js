var Game = (function(window, document, undefined) {

  var Game = function Game(canvas) {
    this.canvas = canvas;
    this.objects = [];
    this.ctx = this.canvas.getContext('2d');
    this.game = {};

    this.assignResizeHandler();
    this.startLoop();
  };

  Game.prototype.add = function(obj) {
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

      game.game.width = parseInt(game.canvas.attributes.getNamedItem('width').value, 10);
      game.game.height = parseInt(game.canvas.attributes.getNamedItem('height').value, 10);

      return handler;
    };

   document.addEventListener('resize', handler());
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

        object.game = game;

        if (object.update) object.update(game.ctx);
        object.render(game.ctx);
      });

      return requestAnimationFrame(loop);
    };

    loop();
  };

  return Game;

})(this, this.document);