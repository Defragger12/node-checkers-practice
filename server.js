import express from "express";
import path from "path";
import bodyParser from "body-parser";
import {isOpponentTurn, performMove} from "./src/server/opponent";
import {findSquareByPosition} from "./src/positioning";
import {initField} from "./src/server/administration";
import {PORT, SQUARES, TURN_DELAY} from "./src/constants";
import socket from 'socket.io';

let app = express();

app.use(express.static(path.resolve(__dirname, 'public')));
let jsonParser = bodyParser.json();

app.get('/', function(req, res) {
    res.sendFile(path.resolve(__dirname, '/public/index.html'));
});

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

    socket.on('disconnect', function() {
        console.log("disconnected")
    });
});

console.log(`Running at ${PORT}`);

