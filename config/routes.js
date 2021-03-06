module.exports = function(app, passport, auth) {
    //User Routes
    var users = require('../app/controllers/users');
    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);

    //Setting up the users api
    app.post('/users', users.create);

    app.post('/users/session', passport.authenticate('local', {
        failureRedirect: '/signin',
        failureFlash: 'Invalid email or password.'
    }), users.session);

    app.get('/users/me', users.me);
    app.get('/users/:userId', users.show);

    //Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the github oauth routes
    app.get('/auth/github', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/github/callback', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Finish with setting up the userId param
    app.param('userId', users.user);

    //Object Routes
    var objects = require('../app/controllers/objects');
    app.get('/objects', auth.requiresLoginOrCanvsApi, objects.all);
    app.get('/object_search', auth.requiresLoginOrCanvsApi, objects.search);
    app.post('/objects', auth.requiresLoginOrCanvsApi, objects.create);
    app.get('/objects/:objectId', auth.requiresLoginOrCanvsApi, objects.show);
    app.put('/objects/:objectId', auth.requiresLoginOrCanvsApi, objects.update);
    app.get('/objects/name/:objectName', auth.requiresLoginOrCanvsApi, objects.getByName);
    app.del('/objects/:objectId', auth.requiresLoginOrCanvsApi, objects.destroy);

    //Finish with setting up the articleId param
    app.param('objectId', objects.object);

    //Object Routes
    var references = require('../app/controllers/references');
    app.get('/references', references.fullReferences);
    app.del('/references/:referenceId', references.destroy);

    //Finish with setting up the articleId param
    app.param('referenceId', references.reference);

    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);

};
