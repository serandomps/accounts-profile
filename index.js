var dust = require('dust')();
var serand = require('serand');

dust.loadSource(dust.compile(require('./template'), 'accounts-profile'));

module.exports = function (sandbox, options, done) {
    dust.render('accounts-profile', {
        username: options.username
    }, function (err, out) {
        if (err) {
            return done(err);
        }
        sandbox.append(out);
        done(null, function () {
            $('.accounts-profile', sandbox).remove();
        });
    });
};
