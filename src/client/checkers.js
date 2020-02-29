import io from 'socket.io-client';
import {BASE_URL} from "../constants";
import {addPlayerToList, drawField, moveSquare, removePlayerFromList} from "./drawmanager";
import {preparePlayerList, retrieveFieldForUser, retrieveUserName} from "./requests";

export const socket = io(BASE_URL);

retrieveUserName().then(username => {
    socket.emit('save_user', username);
}).catch(err => console.log(err + "3"));

retrieveFieldForUser().then(([squares, color]) => {
    console.log(squares);
    if (!squares) {
        return;
    }
    drawField(squares, color);
}).catch(err => console.log(err + "2"));

preparePlayerList().then(playerList => {
    for (let player of playerList) {
        addPlayerToList(player);
    }
}).catch(err => console.log(err + "1"));

socket.on('game_invite', (username) => {
    if (confirm(`${username} would like to play against you. Accept invite?`)) {
        socket.emit('game_accept', username);
    }
});

socket.on('game_init', ([squares, color]) => {
    drawField(squares, color);
});

socket.on('add_user_to_list', (username) => {
    addPlayerToList(username)
});

socket.on('remove_user_from_list', (username) => {
    removePlayerFromList(username)
});

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

async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}
