var Game = (function(window, document, undefined) {

  var Game = function Game(canvas, delay) {
    this.canvas = canvas;
    this.$canvas = $(canvas);
    this.objects = [];
    this.ctx = this.canvas.getContext('2d');
    this.game = {};
    this.keys = {};
    this.paused = false;

    this.resolution = 1;

    this.defaults = {
      width: canvas.width,
      height: canvas.height
    };

    this.assignResizeHandler();
    this.assignKeyHandler();
    this.startLoop();

    this.delay = delay || 16;
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

  Game.prototype.pause = function() {
    this.paused = true;
  };

  Game.prototype.play = function() {
    this.paused = false;
  };

  Game.prototype.assignResizeHandler = function() {

    var game = this;

    var handler = function() {

      game.game.width = parseInt(game.$canvas.attr('width'), 10);
      game.game.height = parseInt(game.$canvas.attr('height'), 10);

      game.resolution = game.game.width / game.defaults.width;

      game.canvas.width = game.game.width;
      game.canvas.height = game.game.height;

      game.render();

      return handler;
    };

   $(document).on('resize', handler());
  };

  Game.prototype.render = function(update) {
    this.ctx.clearRect(0, 0, this.game.width, this.game.height);

    var game = this;
    var paused = this.paused;

    this.objects.forEach(function(object) {
      if (update && object.update && (!paused || object.update_when_paused)) object.update(game.ctx);
      object.render(game.ctx);
    });
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

    var started = false;
    var time = 0;

    var $touch = $('.touch-capture');

    $touch.attr('tabindex', -1);

    $touch.focus(function() {
      canvas.focus();
    });

    canvas.add($touch).on('touchstart', function(e) {

      started = true;
      time = 0;

      $.each(game.objects, function(i, obj) {
        if (obj.touch_start) {
          obj.touch_start(e);
        }
      });
    });

    canvas.add($touch).on('touchend', function(e) {
      started = false;

      $.each(game.objects, function(i, obj) {
        if (obj.touch_end) {
          obj.touch_end(e);
        }
      });
    });

    (function() {

      if (started) {
        time++;

        if (time > 10) {

          time = 0;

          $.each(game.objects, function(i, obj) {
            if (obj.touch_hold) {
              obj.touch_hold();
            }
          });
        }
      }

      return setTimeout(arguments.callee, 16);

    })();

    canvas.add($touch).touchwipe({
      wipeLeft: function() {
        started = false;
        $.each(game.objects, function(i, obj) {
          if (obj.swipe) {
            obj.swipe('left');
          }
        });
      },

      wipeRight: function() {
        started = false;
        $.each(game.objects, function(i, obj) {
          if (obj.swipe) {
            obj.swipe('right');
          }
        });
      },

      wipeUp: function() {
        started = false;
        $.each(game.objects, function(i, obj) {
          if (obj.swipe) {
            obj.swipe('down');
          }
        });
      },

      wipeDown: function() {
        started = false;
        $.each(game.objects, function(i, obj) {
          if (obj.swipe) {
            obj.swipe('up');
          }
        });
      },

      min_move_x: 20,
      min_move_y: 20
    });
  };

  Game.prototype.startLoop = function() {

    var game = this;

    var requestAnimationFrame = function(cb) {
      return setTimeout(cb, game.delay);
    };

    var loop = function() {
      game.render(true);

      return requestAnimationFrame(loop);
    };

    loop();
  };

  return Game;

})(this, this.document);