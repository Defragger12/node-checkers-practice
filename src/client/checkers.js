import io from 'socket.io-client';
import {BASE_URL} from "../constants";
import {drawSquare, moveSquare} from "./drawmanager";
import {Square} from "../model/square";
import {Piece} from "../model/piece";
import {FIELD} from "./drawmanager";
import {retrieveFieldForUser} from "./requests";

export const socket = io(BASE_URL);

retrieveFieldForUser();
// prepareFieldForUser();

//socket.emit('draw_field');

socket.on('enemy_turn', (turn) => {
    moveSquare(turn.from, turn.to, turn.isRankUp);

    if (turn.isGG) {
        if (confirm("GG, go again?")) {
            socket.emit('draw_field');
        }
    }
});

socket.on('player_turn', (turn) => {

    // in case we try to move during opponent turn, turn is null
    if (!turn) {
        // socket.emit("enemy_turns");
        return;
    }

    moveSquare(turn.from, turn.to, turn.isRankUp);

    if (turn.isGG) {
        if (confirm("GG, go again?")) {
            socket.emit('draw_field');
        }
    }

    // vs opponent required
    if (turn.isLast) {

    //     socket.emit("enemy_turns");
    }
});

socket.on('draw_field', (squares) => {

    FIELD.innerHTML = "";

    squares.forEach(square => {
        drawSquare(new Square(
            square.position,
            square.piece ? new Piece(square.piece.color, square.piece.rank) : null
            )
        )
    });
});

async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}
