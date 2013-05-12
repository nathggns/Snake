(function(window, document, ready, undefined) {

  if (typeof ready === 'undefined') {
    var args = arguments;
    var callee = arguments.callee;
    var me = this;

    return $(window).load(function() {
      Array.prototype.push.call(args, true);
      return callee.apply(me, args);
    });
  }

  if (!window.sessionStorage) {
    window.sessionStorage = {};
  }

  if (typeof sessionStorage.mute === 'undefined') {
    sessionStorage.mute = 'false';
  }

  var canvas = $('#canvas').add('#background-canvas');

  var scale = function() {
    var touch = $('.touch-capture');
    var dimensions = [parseInt(touch.css('width'), 10), parseInt(touch.css('height'), 10)];

    var min = Math.min.apply(Math, dimensions);

    canvas.css('width', min + 'px');
    canvas.css('height', min + 'px');

    return scale;
  };

  $(window).on('resize', scale());

  var bgame = new Game(canvas.filter('#background-canvas')[0], 20000, true, 15);
  var game = new Game(canvas.filter('#canvas')[0], 16, true);
  var size = 20;

  var sounds = {
    bite: $('.bite-sound')[0],
    death: $('.death-sound')[0],
    background: $('.background-sound')[0]
  };

  sounds.background.volume = 0.1;

  var images = {
    sound: $('.sound')[0],
    mute: $('.sound-mute')[0]
  };

  var Background = (function() {
    var Background = function Background() {
        this.order = 1;
    };

    Background.prototype.render = function(ctx) {

        var color = '#ffffff';
        var real_size = this.unit(size);

        for (var i = 0, l = this.game.game.width / size; i < l; i++) {

            for (j = 0, k = this.game.game.height / size; j < k; j++) {
                ctx.beginPath();
                ctx.fillStyle = this.background;
                ctx.rect(real_size * i, real_size * j, real_size, real_size);
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

    Background.inherit(GameObject);

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

            var new_direction = this.new_direction;
            this.new_direction = undefined;

            if (new_direction.length < 1 || new_direction[0] === this.direction[0]) {
                return;
            }

            this.direction = new_direction;
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

        if (direction) {
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

        if (this.y > this.game.game.height - this.height) {
            this.y = 0;
            this.direction[1] = 1;
        } else if (this.y < 0) {
            this.y = this.game.game.height - this.height;
            this.direction[1] = -1;
        }

        if (this.x < 0) {
            this.x = this.game.game.width - this.width;
            this.direction[1] = -1;
        } else if (this.x > this.game.game.width - this.width) {
            this.x = 0;
            this.direction[1] = 1;
        }

        if (this.x === this.fruit.x && this.y === this.fruit.y) {
            this.fruit.init();
            this.add_tail();
            if (!sounds.background.paused) sounds.bite.play();
        }

        $.each(this.tails, function(i, tail) {
            if (tail.x === player.x && tail.y === player.y) {
                player.die();
                return false;
            }
        });
    };

    Player.prototype.die = function() {

        if (!sounds.background.paused) sounds.death.play();

        return this.death.die(this);
    };

    Player.prototype.render = function(ctx) {

        var game = this;

        ctx.beginPath();
        ctx.fillStyle = '#aaaaaa';

        ctx.rect(Math.floor(this.unit(this.x)), Math.floor(this.unit(this.y)), Math.ceil(this.unit(this.width)), Math.ceil(this.unit(this.height)));
        ctx.closePath();
        ctx.fill();

        $.each(this.tails, function() {
            ctx.beginPath();
            ctx.fillStyle = '#ff0000';

            ctx.rect(Math.floor(game.unit(this.x)), Math.floor(game.unit(this.y)), Math.ceil(game.unit(game.width)), Math.ceil(game.unit(game.height)));
            ctx.closePath();
            ctx.fill();
        });
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

        if (direction.length > 0 && direction[1]) {
            this.new_direction = direction;
        }
    };

    Player.inherit(GameObject);

    return Player;

  })();

  var Death = (function() {

    var Death = function Death() {
        this.dead = false;
        this.order = 99;
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
            ctx.rect(0, 0, this.unit(game.game.width), this.unit(game.game.height));
            ctx.fill();

            ctx.font = "bold " + this.unit(20) + "px sans-serif";
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('You died', this.unit(game.game.width / 2), this.unit(game.game.height / 2));

            ctx.font = "normal " + this.unit(12) + "px sans-serif";

            var string = 'Press the space key to continue';

            if (Modernizr.touch) {
                string = 'Tap to continue';
            }

            ctx.fillText(string, this.unit(game.game.width / 2), this.unit(game.game.height / 2 + 40));
        }
    };

    Death.prototype.update = function() {
        if (this.dead && 32 in game.keys) {
            this.start();
        }
    };

    Death.prototype.start = function() {
        this.player.init();
        this.dead = false;
    };

    Death.prototype.touch_start = function() {
        if (this.dead) {
            this.start();
        }
    };

    Death.inherit(GameObject);

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
            ctx.arc(this.unit(this.x + this.radius), this.unit(this.y + this.radius), this.unit(this.radius), 0, 2 * Math.PI, false);
            ctx.fillStyle = '#0000ff';
            ctx.closePath();
            ctx.fill();
        }
    };

    Fruit.inherit(GameObject);

    return Fruit;

  })();

  var Pause = (function() {
    var Pause = function Pause() {
        this.order = 5;
        this.update_when_paused = true;
    };

    Pause.prototype.update = function() {
        if (this.game.paused && 32 in game.keys) {
            this.game.play();
        } else if (!this.game.paused && 80 in game.keys) {
            this.game.pause();
        }
    };

    Pause.prototype.touch_start = function() {
        if (this.game.paused) {
            this.game.play();
        }
    };

    Pause.prototype.render = function(ctx) {
        if (this.game.paused) {

            var game = this.game;

            ctx.beginPath();
            ctx.fillStyle = '#000000';
            ctx.rect(0, 0, this.unit(game.game.width), this.unit(game.game.height));
            ctx.fill();

            ctx.font = "bold " + this.unit(20) + "px sans-serif";
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Game is paused', this.unit(game.game.width / 2), this.unit(game.game.height / 2));

            ctx.font = "normal " + this.unit(12) + "px sans-serif";

            var string = 'Press the space key to continue';

            if (Modernizr.touch) {
                string = 'Tap to continue';
            }

            ctx.fillText(string, this.unit(game.game.width / 2), this.unit(game.game.height / 2 + 40));
        }
    };

    Pause.inherit(GameObject);

    return Pause;
  })();

  var Button = (function() {
    var Button = function(game){
        this.order = 99;
    };

    Button.inherit(GameObject);

    Button.prototype.init = function() {

        var game = this.game;

        this.width = this.height = size;

        this.x = game.game.width - this.width - (size / 2);
        this.y = game.game.height - this.height - (size / 2);
    };

    Button.prototype.get_bounds = function() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    };

    Button.prototype.render = function(ctx) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 0, 0, .5)';
        ctx.rect(this.unit(this.x), this.unit(this.y), this.unit(this.width), this.unit(this.height));
        ctx.fill();
    };

    return Button;
  })();

  var PauseButton = (function() {

    var PauseButton = function PauseButton() {
        return Button.apply(this, arguments);
    };

    PauseButton.inherit(Button);

    PauseButton.prototype.init = function() {

        Button.prototype.init.apply(this, arguments);

        var game = this.game;

        this.on('click', function() {
            game.pause();
        });
    };

    PauseButton.prototype.render = function(ctx) {

        if (this.game.paused) return;

        Button.prototype.render.apply(this, arguments);

        ctx.beginPath();
        ctx.fillStyle = '#fff';

        var args = [this.x + (this.width / 6), this.y + (this.height / 6), (this.width / 4), this.height - (this.height / 3)];
        var me = this;

        $.each(args, function(i, arg) {
            args[i] = me.unit(arg);
        });

        ctx.rect.apply(ctx, args);
        ctx.fill();

        args[0] = this.unit(this.x + this.width - (this.width / 6) - (this.width / 4));

        ctx.rect.apply(ctx, args);
        ctx.fill();

        ctx.closePath();
    };

    return PauseButton;
  })();

  var SoundButton = (function() {
    var SoundButton = function() {
        Button.apply(this, arguments);

        this.update_when_paused = true;
    };

    SoundButton.inherit(Button);

    SoundButton.prototype.init = function() {
        Button.prototype.init.apply(this, arguments);

        this.x -= this.width + (size / 2);

        var g = this;

        this.on('click', function() {
            g.toggle_sound();
        });

        this.timer = 30;
    };

    SoundButton.prototype.toggle_sound = function(update_storage) {
        if (sounds.background.paused) {
            sounds.background.play();
            if (!update_storage) sessionStorage.mute = 'false';
        } else {
            sounds.background.pause();
            if (!update_storage) sessionStorage.mute = 'true';
        }
    };

    SoundButton.prototype.update = function() {

        if (this.timer >= 30 && 77 in game.keys || 83 in game.keys) {
            this.toggle_sound();
            this.timer = 0;
        }

        if (sessionStorage.mute === 'true' && !sounds.background.paused) {
            this.toggle_sound(true);
        }

        if (this.game.paused && !sounds.background.paused) {
            this.toggle_sound(true);
            this.muted_for_pause = true;
        }

        if (this.muted_for_pause && !this.game.paused) {
            this.toggle_sound(true);
            this.muted_for_pause = false;
        }

        this.timer++;
    };

    SoundButton.prototype.render = function(ctx) {

        if (this.game.paused) return;

        Button.prototype.render.apply(this, arguments);

        var args = [this.x + (this.width / 6), this.y + (this.height / 6), this.width - (this.width / 3), this.height - (this.height / 3)];
        var me = this;

        $.each(args, function(i, arg) {
            args[i] = me.unit(arg);
        });

        args.unshift(sounds.background.paused ? images.mute : images.sound);

        ctx.drawImage.apply(ctx, args);
    };

    return SoundButton;
  })();

  var fruit = new Fruit();
  var death = new Death();
  var player = new Player(fruit, death);
  var pause = new Pause();

  bgame.add(new Background());
  game.add(player);
  game.add(fruit);
  game.add(death);

  game.add(PauseButton);
  game.add(SoundButton);
  game.add(pause);

  $(window).on('blur', function() {
    game.pause();
  });

})(this, this.document);