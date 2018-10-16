var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var form = require('form');
var locate = require('locate');

dust.loadSource(dust.compile(require('./template'), 'accounts-profile'));

var configs = {
    firstname: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            done();
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    lastname: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            done();
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    alias: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            done();
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    phone: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            done();
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    otp: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            if (data.password && !value) {
                return done(null, 'Please enter your current password');
            }
            done();
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done()
        },
        create: function (context, value, done) {
            if (!value) {
                return done();
            }
            $.ajax({
                primary: true,
                method: 'POST',
                url: utils.resolve('accounts:///apis/v/otps'),
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    name: 'password-update',
                    password: value
                }),
                success: function (data) {
                    done(null, null, data);
                },
                error: function (xhr, status, err) {
                    if (xhr.status === 401) {
                        return done(null, 'Old password you entered is incorrect');
                    }
                    done(err);
                }
            });
        }
    },
    password: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        validate: function (context, data, value, done) {
            if (data.otp && !value) {
                return done(null, 'Please enter your new password');
            }
            done();
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    location: {
        find: function (context, source, done) {
            context.eventer.emit('find', done);
        },
        validate: function (context, data, value, done) {
            context.eventer.emit('validate', value, done);
        },
        update: function (context, source, error, value, done) {
            context.eventer.emit('update', error, value, done);
        },
        render: function (ctx, vform, data, value, done) {
            var options = _.isString(value) ? {user: data.user, location: value} : value;
            locate({}, $('.location', vform.elem), options, function (err, eventer) {
                if (err) {
                    return done(err);
                }
                eventer.on('change', function (location, done) {
                    done();
                });
                done(null, {eventer: eventer});
            });
        },
        create: function (context, value, done) {
            context.eventer.emit('create', value, function (err, errors, location) {
                done(err, errors, location);
            });
        }
    }
};

var findUser = function (id, done) {
    $.ajax({
        method: 'GET',
        url: utils.resolve('accounts:///apis/v/users/' + id),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            done(err);
        }
    });
};

var updateUser = function (user, data, done) {
    var otp = data.otp;
    delete data.otp;
    _.merge(user, data);

    var headers = {};
    otp = otp ? otp.value : null;
    if (otp) {
        headers['X-OTP'] = otp;
    }
    $.ajax({
        method: 'PUT',
        url: utils.resolve('accounts:///apis/v/users/' + user.id),
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(user),
        headers: headers,
        success: function (data) {
            done(null, data);
        },
        error: function (xhr, status, err) {
            if (xhr.status === 401) {
                return done(null, 'Old password you entered is incorrect');
            }
            done(err);
        }
    });
};

module.exports = function (ctx, sandbox, options, done) {
    options = options || {};
    findUser(ctx.user.id, function (err, user) {
        if (err) {
            return done(err);
        }
        dust.render('accounts-profile', user, function (err, out) {
            if (err) {
                return done(err);
            }
            var elem = sandbox.append(out);
            var frm = form.create(elem, configs);
            frm.render(ctx, user, function (err) {
                if (err) {
                    return done(err);
                }
                var update = $('.accounts-profile .update', elem);
                sandbox.on('click', '.accounts-profile .update', function (e) {
                    frm.find(function (err, data) {
                        if (err) {
                            return console.error(err);
                        }
                        frm.validate(data, function (err, errors) {
                            if (err) {
                                return console.error(err);
                            }
                            if (errors) {
                                frm.update(errors, data, function (err) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    update.removeAttr('disabled');
                                });
                                return;
                            }
                            frm.update(errors, data, function (err) {
                                if (err) {
                                    return console.error(err);
                                }
                                frm.create(data, function (err, errors, data) {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    if (errors) {
                                        frm.update(errors, data, function (err) {
                                            if (err) {
                                                return console.error(err);
                                            }
                                            update.removeAttr('disabled');
                                        });
                                        return;
                                    }
                                    updateUser(user, data, function (err) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                        console.log('password updated successfully');
                                    });
                                });
                            });
                        });
                    });
                    return false;
                });
                done(null, function () {
                    $('.accounts-profile', sandbox).remove();
                });
            });
        });
    });
};
