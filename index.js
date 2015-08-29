var dust = require('dust')();
var serand = require('serand');

dust.loadSource(dust.compile(require('./template'), 'accounts-profile'));

module.exports = function (sanbox, fn, options) {
    dust.render('accounts-profile', {
        username: options.username
    }, function (err, out) {
        if (err) {
            return;
        }
        sanbox.append(out);
        fn(false, function () {
            sanbox.remove('.user-login');
        });
    });
};