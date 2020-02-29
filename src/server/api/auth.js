import express from "express";
import passport from "passport/lib";
import {User} from "../db/model";
import {Strategy as LocalStrategy} from "passport-local/lib";
import path from "path";
import {createUser} from "../db/util";
import session from "express-session";

export let auth = express();

export let isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect("/auth")
    }
};

auth.use(session({
    secret: 'vidyapathaisalwaysrunning',
    resave: true,
    saveUninitialized: true
})); // session secret
auth.use(passport.initialize());
auth.use(passport.session());

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({where: {username: username}}).then(user => {
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'});
            }
            if (user.password !== password) {
                return done(null, false, {message: 'Incorrect password.'});
            }
            done(null, user);
        });
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findOne({where: {id: id}}).then(user => done(null, user));
});

auth.get('/auth', (req, res) => {
    res.render(path.join(__dirname, '../../../public/auth.ejs'), {
        errorMessage: req.flash('error'),
        successMessage: req.flash('success')
    })
});

auth.post('/login',
    passport.authenticate('local', {failureRedirect: '/auth', successRedirect: "/checkers", failureFlash: true}),
    (req, res) => {}
);

auth.post('/register', async (req, res) => {
    if (!(req.body.username && req.body.password)) {
        return;
    }
    try {
        let createdUser = await createUser(req.body.username, req.body.password);
        req.flash('success', 'user was created');
    } catch (err) {
        req.flash('error', 'user with such username already exists');
    }
    res.redirect('/auth');
});

auth.get('/username', (req, res) => res.json(req.user.username));