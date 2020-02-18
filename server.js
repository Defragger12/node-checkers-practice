import express from "express";
import path from "path";
import bodyParser from "body-parser";
import {isOpponentTurn, performMove} from "./src/server/opponent";
import {findSquareByPosition} from "./src/positioning";
import {initField} from "./src/server/administration";
import {PORT, SQUARES, TURN_DELAY} from "./src/constants";
import socket from 'socket.io';
import {User} from "./src/server/db/model";
import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import session from "express-session";
import cookieParser from "cookie-parser";
import {createUser} from "./src/server/db/util";

let app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: 'vidyapathaisalwaysrunning',
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session());


app.get('/checkers', (req, res) => {
    // console.log(req.user.isAuthenticated());
    // console.log(req.user.username + " " + req.user.id);
    res.sendFile(path.join(__dirname, '/public/index.html'))
});

app.get('/auth', (req, res) => res.sendFile(path.join(__dirname, '/public/auth.html')));

app.post('/login',
    passport.authenticate('local', {failureRedirect: '/auth'}),
    (req, res) => {
        res.redirect('/checkers?username=' + req.user.username);
    }
);

app.post('/register', (req, res) => {
        if (req.body.username && req.body.password) {
            createUser(req.body.username, req.body.password).then(
                result => {
                    res.redirect('/auth');
                }
            );
        }
    }
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findOne({where : {id: id}}).then(user => done(null, user));
});

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

const server = app.listen(PORT);

const io = socket(server);

io.on('connection', (socket) => {
    console.log('SOCKET IS CONNECTED');

    socket.on('draw_field', () => {
        initField();
        socket.emit('draw_field', SQUARES);
    });
    socket.on('enemy_turns', () => {
        while (true) {
            let turn = performMove();
            if (!turn) {
                break;
            }

            socket.emit('enemy_turn', turn);

            if (turn.isGG || turn.isLast) {
                break;
            }
        }
    });
    socket.on('player_turn', ({from, to}) => {
        socket.emit('player_turn', isOpponentTurn ? null : findSquareByPosition(from).moveTo(to))
    });

    socket.on('disconnect', function () {
        console.log("disconnected")
    });
});

console.log(`Running at ${PORT}`);

