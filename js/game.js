var Game = (function(window, document, undefined) {

  var Game = function Game(canvas) {
    this.canvas = canvas;
    this.objects = [];
  };

  this.add = function(obj) {
    this.objects.push(obj);

    return this;
  };

  this.remove = function(obj) {
    this.objects.splice(this.objects.indexOf(obj), 1);

    return this;
  };

  return Game;

})(this, this.document);