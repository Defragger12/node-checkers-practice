import socket from "socket.io";
import {findSquareByPosition} from "../../positioning";
import {server} from "../../../server";

const io = socket(server);

export let playersInGame = 0;

io.on('connection', (socket) => {
    console.log('SOCKET IS CONNECTED');
    playersInGame++;

    socket.on('draw_field', () => {

        // get field data from db and return game instance instead of squares
        // socket.emit('draw_field', SQUARES);
        socket.emit('draw_field', socket.squares);
    });
    // socket.on('enemy_turns', () => {
    //     while (true) {
    //         let turn = performMove();
    //         if (!turn) {
    //             break;
    //         }
    //
    //         socket.emit('enemy_turn', turn);
    //
    //         if (turn.isGG || turn.isLast) {
    //             break;
    //         }
    //     }
    // });
    socket.on('player_turn', ({from, to, color}) => {
        // vs opponent required
        // socket.emit('player_turn', findSquareByPosition(from).moveTo(to))
        io.emit('player_turn', color !== colorTurn ? null : findSquareByPosition(from).moveTo(to))
    });

    socket.on('disconnect', function() {
        playersInGame--;
        console.log("disconnected")
    });
});
