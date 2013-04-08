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
        var color = '#ffffff';

        for (var i = 0, l = this.game.game.width / 70; i < l; i++) {

            for (j = 0, k = this.game.game.height / 70; j < k; j++) {
                ctx.beginPath();
                ctx.fillStyle = this.background;
                ctx.rect(70 * i, 70 * j, 70, 70);
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
        this.width = this.height = 70;

        this.speed = 2;

        this.direction = ['y', 1, 'height'];
    };

    Player.prototype.init = function() {
        this.x = (this.game.game.width / 2) - (this.width / 2);
        this.y = (this.game.game.height / 2) - (this.height / 2);
    };

    Player.prototype.update = function() {

        window.player = this;

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
                player.direction = direction;
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