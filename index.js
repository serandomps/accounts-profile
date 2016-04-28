var dust = require('dust')();
var serand = require('serand');

dust.loadSource(dust.compile(require('./template'), 'accounts-profile'));

module.exports = function (sandbox, fn, options) {
    dust.render('accounts-profile', {
        username: options.username
    }, function (err, out) {
        if (err) {
            return;
        }
        sandbox.append(out);
        fn(false, function () {
            $('.accounts-profile', sandbox).remove();
        });
    });
};
