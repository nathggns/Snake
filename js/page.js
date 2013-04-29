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

  var size = 20;

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

    var Player = function Player(fruit, death) {
        this.has_init = false;
        this.fruit = fruit;
        this.order = 2;
        this.death = death;
        this.fruit.player = this;
    };

    Player.prototype.init = function() {
        if (!this.has_init) {
            this.width = this.height = size;

            this.speed = 2;
            this.direction = ['y', 1, 'height'];
            this.new_direction = undefined;
            this.movement = 0;
            this.x = this.y = 0;

            this.tails = [];
            this.fruit.init();
            this.active = true;
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

        if (!this.active) return;

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
            this.die();
            return;
        } else if (this.y < 0) {
            this.die();
            return;
        }

        if (this.x < 0) {
            this.die();
            return;
        } else if (this.x > (this.game.game.width - this.width)) {
            this.die();
            return;
        }

        if (this.x === this.fruit.x && this.y === this.fruit.y) {
            this.fruit.init();
            this.add_tail();
        }

        $.each(this.tails, function(i, tail) {
            if (tail.x === player.x && tail.y === player.y) {
                player.die();
                return false;
            }
        });
    };

    Player.prototype.die = function() {
        return this.death.die(this);
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

        if (direction.length > 0 && direction[0] !== this.direction[0]) {
            this.new_direction = direction;
        }
    };

    return Player;

  })();

  var Death = (function() {

    var Death = function Death() {
        this.dead = false;
        this.order = 5;
    };

    Death.prototype.die = function(player) {
        this.player = player;
        this.player.active = false;
        this.dead = true;
    };

    Death.prototype.render = function(ctx) {
        if (this.dead) {
            ctx.beginPath();
            ctx.fillStyle = '#000000';
            ctx.rect(0, 0, game.game.width, game.game.height);
            ctx.fill();

            ctx.font = "bold 20px sans-serif";
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('You died', game.game.width / 2, game.game.height / 2);

            ctx.font = "normal 12px sans-serif";

            ctx.fillText('Press any key to continue', game.game.width / 2, game.game.height / 2 + 40);
        }
    };

    Death.prototype.update = function() {
        if (this.dead && Object.keys(game.keys).length > 0) {
            this.player.init();
            this.dead = false;
        }
    };

    return Death;

  })();

  var Fruit = (function() {
    var Fruit = function Fruit() {
        this.order = 2;
    };

    Fruit.prototype.init = function() {
        this.exists = true;

        var width = game.game.width;
        var height = game.game.height;
        var w_i = width / size;
        var h_i = height / size;

        var found = true;
        var w_c;
        var h_c;

        var f;

        var each_func = function(i, tail) {
            if (tail.x === w_c * size && tail.y === h_c * size) {
                f = true;
                return false;
            }
        };

        while (found) {

            f = false;

            w_c = Math.random(0, w_i - 1);
            h_c = Math.random(0, h_i - 1);

            if (w_c === 0 && h_c === 0 && !this.player) {
                continue;
            }

            if (this.player) {

                $.each(this.player.tails, each_func);

                if (!f) {
                    if (w_c * size === this.player.x && h_c * size === this.player.y) {
                        f = true;
                    }
                }

                found = f;

            } else {
                found = false;
            }
        }

        this.x = w_c * size;
        this.y = h_c * size;

        this.radius = size / 2;
    };

    Fruit.prototype.render = function(ctx) {
        if (this.exists) {
            ctx.beginPath();
            ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#0000ff';
            ctx.closePath();
            ctx.fill();
        }
    };

    return Fruit;

  })();

  var fruit = new Fruit();
  var death = new Death();
  var player = new Player(fruit, death);

  bgame.add(new Background());
  game.add(player);
  game.add(fruit);
  game.add(death);

})(this, this.document);