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
        this.has_init = false;
    };

    Player.prototype.init = function() {
        if (!this.has_init) {
            this.order = 2;
            this.width = this.height = 14;

            this.speed = 2;
            this.direction = ['y', 1, 'height'];
            this.new_direction = undefined;
            this.movement = 0;
            this.x = this.y = 0;

            this.tails = [];
        }
    };

    Player.prototype.add_tail = function() {
        var tail = {
            x: this.x,
            y: this.y
        };

        this[this.direction[0]] += this[this.direction[2]] * this.direction[1];

        this.tails.unshift(tail);
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

        if (65 in game.keys) {
            this.add_tail();
        }

        if (direction && direction[0] !== this.direction[0]) {
            this.new_direction = direction;
        }

        this.movement += this.speed;

        if (this.movement >= this[this.direction[2]]) {

            if (this.tails.length > 0) {
                this.tails.pop();

                this.tails.unshift({
                    x: this.x,
                    y: this.y
                });
            }

            this[this.direction[0]] += this[this.direction[2]] * this.direction[1];
            this.movement = 0;
            this.turn();
        }

        if (this.y > (this.game.game.height - this.height)) {
            this.init();
        } else if (this.y < 0) {
            this.init();
        }

        if (this.x < 0) {
            this.init();
        } else if (this.x > (this.game.game.width - this.width)) {
            this.init();
        }

        $.each(this.tails, function(i, tail) {
            if (tail.x === player.x && tail.y === player.y) {
                player.init();
                return false;
            }
        });
    };

    Player.prototype.render = function(ctx) {

        var game = this;

        $.each(this.tails, function() {
            ctx.beginPath();
            ctx.fillStyle = '#ff0000';

            ctx.rect(this.x, this.y, game.width, game.height);
            ctx.closePath();
            ctx.fill();
        });

        ctx.beginPath();
        ctx.fillStyle = '#aaaaaa';

        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.closePath();
        ctx.fill();
    };

    Player.prototype.swipe = function(dir) {

        var direction = [];

        switch (dir) {
            case 'left':
            case 'right':
                direction = ['x', null, 'width'];
            break;

            case 'up':
            case 'down':
                direction = ['y', null, 'height'];
            break;
        }

        switch (dir) {
            case 'left':
            case 'up':
                direction[1] = -1;
            break;

            case 'right':
            case 'down':
                direction[1] = 1;
            break;
        }

        if (direction.length > 0) {
            this.new_direction = direction;
        }
    };

    Player.prototype.touch_hold = function() {
        this.add_tail();
    };

    return Player;

  })();

  bgame.add(new Background());
  game.add(new Player());

})(this, this.document);