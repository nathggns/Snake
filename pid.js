var npid = require('npid');

exports.create = function() {
    try {
        npid.create('/tmp/snake.pid');
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};