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

  var canvas = $('#canvas').add('#background-canvas');

  var scale = function() {
    var min = document.width > document.height ? document.height : document.width;

    canvas.css('width', min + 'px');
    canvas.css('height', min + 'px');

    return scale;
  };

  $(window).on('resize', scale());

  var bgame = new Game(canvas.filter('#background-canvas')[0], 2000);
  var game = new Game(canvas.filter('#canvas')[0]);

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
                ctx.closePath();
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
        this.new_direction = undefined;
        this.movement = 0;
        this.x = this.y = 0;
    };

    Player.prototype.turn = function() {
        if (this.new_direction) {
            this.direction = this.new_direction;
            this.new_direction = undefined;
        }
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

        if (direction && direction[0] !== this.direction[0]) {
            this.new_direction = direction;
        }

        this.movement += this.speed;

        if (this.movement >= this[this.direction[2]]) {
            this[this.direction[0]] += this[this.direction[2]] * this.direction[1];
            this.movement = 0;
            this.turn();
        }

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
        ctx.closePath();
        ctx.fill();
    };

    return Player;

  })();

  bgame.add(new Background());
  game.add(new Player());

})(this, this.document);