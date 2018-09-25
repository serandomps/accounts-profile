var dust = require('dust')();
var serand = require('serand');

dust.loadSource(dust.compile(require('./template'), 'accounts-profile'));

module.exports = function (ctx, sandbox, options, done) {
    options = options || {};
    dust.render('accounts-profile', options, function (err, out) {
        if (err) {
            return done(err);
        }
        sandbox.append(out);
        done(null, function () {
            $('.accounts-profile', sandbox).remove();
        });
    });
};
