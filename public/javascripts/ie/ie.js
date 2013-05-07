$(function() {

    $('.middle, .center').each(function() {

        var $this = $(this);

        var func = function() {
            if ($this.hasClass('middle')) {
                $this.css('marginTop', (0 - $this.height() / 2) + 'px');
            }

            if ($this.hasClass('center')) {
                $this.css('marginLeft', (0 - $this.width() / 2) + 'px');
            }
        };

        func();

        $(window).resize(func);

        var width = $this.width();
        var height = $this.height();

        var watch = function() {
            if ($this.width() !== width || $this.height() !== height) func();

            return setTimeout(watch, 100);
        };

        watch();
    });

});