import io from 'socket.io-client';
import {BASE_URL} from "../constants";
import {
    addPlayerToList,
    drawField,
    makeFieldInactive,
    moveSquare,
    removePlayerFromList,
    updateIsInGameState, updatePlayerFinder
} from "./drawmanager";
import {preparePlayerList, retrieveFieldDataForUser, retrieveUserName} from "./requests";

export const socket = io(BASE_URL);

init();

socket.on('game_invite', (username) => {
    if (confirm(`${username} would like to play against you. Accept invite?`)) {
        socket.emit('game_accept', username);
    }
});

socket.on('game_init', ([squares, color]) => {
    drawField(squares, color);
    updatePlayerFinder(true);
});

socket.on('update_inGame_state', ([username, state]) => {
    updateIsInGameState(username, state);
});

socket.on('add_user_to_list', ([username, isInGame]) => {
    addPlayerToList(username, isInGame);
});

socket.on('remove_user_from_list', (username) => {
    removePlayerFromList(username)
});

socket.on('game_lost', (username) => {
    alert(`Good game. Player "${username}" won.`);
    updatePlayerFinder(false);
    makeFieldInactive();
});

socket.on('game_won', (username) => {
    alert('Well played. You won!');
    updatePlayerFinder(false);
    makeFieldInactive();
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


async function init() {

    socket.emit('save_user', await retrieveUserName());

    let [squares, color] = await retrieveFieldDataForUser();
    if (squares) {
        drawField(squares, color);
    }

    let playersOnline = await preparePlayerList();
    for (let player of playersOnline) {
        addPlayerToList(player.name, player.isInGame);
    }
}

const delay = async (ms) => {
    return await new Promise(resolve => setTimeout(resolve, ms));
};
