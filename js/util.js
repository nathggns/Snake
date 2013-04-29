(function() {

    var random = Math.random;

    Math.random = function(min, max, round) {
        if (arguments.length === 0) {
            return random.apply(this, arguments);
        }

        if (typeof round === 'undefined') {
            round = true;
        }
        
        if (round) {
            return Math.floor(random() * (max - min + 1)) + min;
        } else {
            return random() * (max - min) + min;
        }
    };

})();