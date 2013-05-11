var GameObject = (function(window, document, undefined) {
  var GameObject = function(){};

  GameObject.inherit(EventEmitter);

  return GameObject;
})();

var Game = (function(window, document, undefined) {

  var GameEvent = function GameEvent(game, e, pos) {
    this.x = e.pageX - pos.left;
    this.y = e.pageY - pos.top;

    this.x /= game.resolution;
    this.y /= game.resolution;

    this.e = e;
    this.pos = pos;
    this.game = game;
  };

  GameEvent.prototype.bounds = function(bounds) {
    if (typeof bounds !== 'object') {
      bounds = {
        x: arguments[0],
        y: arguments[1],
        width: arguments[2],
        height: arguments[3]
      };
    }

    bounds.tl = [bounds.x, bounds.y];
    bounds.tr = [bounds.x + bounds.width, bounds.y];
    bounds.bl = [bounds.x, bounds.y + bounds.height];
    bounds.br = [bounds.x + bounds.width, bounds.y + bounds.height];

    return bounds;
  };

  GameEvent.prototype.within = function() {
    var bounds = this.bounds.apply(this, arguments);

    return this.x >= bounds.tl[0] && this.x <= bounds.tr[0] && this.y >= bounds.tl[1] && this.y <= bounds.bl[1];
  };

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

  Game.inherit(EventEmitter);

  Game.prototype.add = function(obj) {

    if (typeof obj === 'function') {
      obj = new obj(this);
    }

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

      game.resolution = parseInt(game.$canvas.css('width'), 10) / game.defaults.width;

      game.canvas.width = game.game.width;
      game.canvas.height = game.game.height;

      game.render();

      return handler;
    };

   $(window).on('resize', handler());
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
      game.emit('key', e.which);
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

    var $both = canvas.add($touch);

    $.each([{
      object: $touch,
      events: ['click', 'mousedown', 'mouseup']
    }, {
      object: $both,
      events: ['touchstart', 'touchend']
    }], function(i, obj) {

      $.each(obj.events, function(i, name) {
        obj.object.on(name, function(e) {
          var pos = canvas.offset();

          e = new GameEvent(game, e, pos);

          game.emit(name, e);
        });
      });
    });

    $both.on('touchstart', function(e) {

      started = true;
      time = 0;

      $.each(game.objects, function(i, obj) {
        if (obj.touch_start) {
          obj.touch_start(e);
        }
      });
    });

    $both.on('touchend', function(e) {
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

    $both.touchwipe({
      wipeLeft: function() {
        started = false;
        $.each(game.objects, function(i, obj) {
          if (obj.swipe) {
            obj.swipe('left');
          }
        });

        game.emit('swipe', 'left');
      },

      wipeRight: function() {
        started = false;
        $.each(game.objects, function(i, obj) {
          if (obj.swipe) {
            obj.swipe('right');
          }
        });

        game.emit('swipe', 'right');
      },

      wipeUp: function() {
        started = false;
        $.each(game.objects, function(i, obj) {
          if (obj.swipe) {
            obj.swipe('down');
          }
        });

        game.emit('swipe', 'down');
      },

      wipeDown: function() {
        started = false;
        $.each(game.objects, function(i, obj) {
          if (obj.swipe) {
            obj.swipe('up');
          }
        });

        game.emit('swipe', 'up');
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