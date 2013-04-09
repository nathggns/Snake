(function(window, document, ready, undefined) {

  if (typeof ready === 'undefined') {
    var args = arguments;
    var callee = arguments.callee;
    var me = this;

    return $(function() {
      Array.prototype.push.call(args, true);
      return callee.apply(me, args);
    });
  }

  var canvas = $('#canvas').eq(0);
  var scale = function() {
    var min = document.width > document.height ? document.height : document.width;

    canvas.css('width', min + 'px');
    canvas.css('height', min + 'px');

    return scale;
  };

  $(window).on('resize', scale());

  var game = new Game(canvas[0]);

  var size = 14;

  var Background = (function() {
    var Background = function Background() {
        this.order = 1;
    };

    Background.prototype.render = function(ctx) {
        var color = '#ffffff';

        for (var i = 0, l = this.game.game.width / size; i < l; i++) {

            for (j = 0, k = this.game.game.height / size; j < k; j++) {
                ctx.beginPath();
                ctx.fillStyle = this.background;
                ctx.rect(size * i, size * j, size, size);
                ctx.fillStyle = color;
                ctx.fill();

                if (color === '#ffffff') {
                    color = '#dddddd';
                } else {
                    color = '#ffffff';
                }
            }
        }
    };

    return Background;
  })();

  var Player = (function() {

    var Player = function Player() {
        this.order = 2;
        this.width = this.height = size * 2;

        this.speed = 1.5;

        this.direction = ['y', 1, 'height'];
    };

    Player.prototype.init = function() {
        this.x = this.y = 0;
    };

    Player.prototype.update = function() {

        var player = this;
        var direction;

        if (37 in game.keys) {
            direction = ['x', -1, 'width'];
        }

        if (39 in game.keys) {
            direction = ['x', 1, 'width'];
        }

        if (38 in game.keys) {
            direction = ['y', -1, 'height'];
        }

        if (40 in game.keys) {
            direction = ['y', 1, 'height'];
        }

        if (direction) {
            (function() {
                if (direction[0] === player.direction[0]) return;

                if (player[player.direction[0]] % size === 0) {
                    player.direction = direction;
                } else {
                    player.timer = setTimeout(arguments.callee, 1);
                }
            })();
        }

        this[this.direction[0]] += this.speed * this.direction[1];

        if (this.y > (this.game.game.height - this.height)) {
            this.y = this.game.game.height - this.height;
        } else if (this.y < 0) {
            this.y = 0;
        }

        if (this.x < 0) {
            this.x = 0;
        } else if (this.x > (this.game.game.width - this.width)) {
            this.x = this.game.game.width - this.width;
        }
    };

    Player.prototype.render = function(ctx) {
        ctx.beginPath();
        ctx.fillStyle = '#aaaaaa';

        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
    };

    return Player;

  })();

  game.add(new Background());
  game.add(new Player());

})(this, this.document);