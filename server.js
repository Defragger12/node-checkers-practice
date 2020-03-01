import express from "express";
import {PORT} from "./src/constants";
import {FIELDS, SOCKET_TO_USER} from "./src/server/constants";
import {middleware} from "./src/server/api/middleware";
import {auth} from "./src/server/api/auth";
import {game} from "./src/server/api/game";
import socket from "socket.io";
import {Field} from "./src/server/db/model";
import {Field as ClientField} from "./src/model/field";
import {moveSquare, prepareFieldForUsers} from "./src/server/db/util";
import {findSquareByPosition} from "./src/positioning";

let app = express();

app.use(middleware);
app.use(auth);
app.use(game);

export const server = app.listen(PORT);

console.log("SERVER STARTED");

const io = socket(server);

io.on('connection', (socket) => {

    socket.on('game_invite', (username) => {
        let targetSocket = SOCKET_TO_USER.find(existingSocket => existingSocket.username === username).socket;
        if (targetSocket.id === socket.id) {
            return;
        }
        targetSocket.emit(
            'game_invite',
            SOCKET_TO_USER.find(existingSocket => existingSocket.socket.id === socket.id).username
        );
    });

    socket.on('game_accept', async (username) => {
        let acceptedSocket = SOCKET_TO_USER.find(existingSocket => existingSocket.username === username);
        let invitingSocket = SOCKET_TO_USER.find(existingSocket => existingSocket.socket.id === socket.id);

        let parsedField = ClientField.convertFromDB(await prepareFieldForUsers(invitingSocket.username, username));

        FIELDS.push(parsedField);

        let createdUsers = parsedField.users;

        socket.emit('game_init', [
            parsedField.squares,
            createdUsers.find(user => user.username === invitingSocket.username).color
        ]);
        socket.broadcast.emit('update_inGame_state', [invitingSocket.username, true]);
        acceptedSocket.socket.emit('game_init', [
            parsedField.squares,
            createdUsers.find(user => user.username === acceptedSocket.username).color
        ]);
        acceptedSocket.socket.broadcast.emit('update_inGame_state', [acceptedSocket.username, true]);
    });

    socket.on('save_user', (username) => {
        let existingSocket = SOCKET_TO_USER.find(element =>
            (element.socket.id === socket.id || element.username === username)
        );
        if (existingSocket) {
            SOCKET_TO_USER.splice(SOCKET_TO_USER.indexOf(existingSocket), 1);
        }

        SOCKET_TO_USER.push({socket: socket, username: username});
        socket.broadcast.emit('add_user_to_list', [username, isUserInGame(username)]);
    });

    socket.on('player_turn', async ({from, to}) => {
        // vs opponent required
        // if gameEnds - delete field

        let {player, enemy, field} = retrieveUserRelatedData(socket);

        if (player.color !== field.currentTurnColor) {
            return;
        }

        let enemySocket = SOCKET_TO_USER.find(element => element.username === enemy.username);
        let turn = findSquareByPosition(from, field.squares).moveTo(to);

        if (!turn) {
            return;
        }

        if (enemySocket) {
            enemySocket.socket.emit('player_turn', turn);
        }
        socket.emit('player_turn', turn);

        if (!turn.defeatedColor) {
            await moveSquare(turn, field);
            await Field.update({currentTurnColor: field.currentTurnColor}, {where: {id: field.id}});
            return;
        }

        socket.emit('game_won', player.username);
        socket.broadcast.emit('update_inGame_state', [player.username, false]);
        enemySocket.socket.emit('game_lost', player.username);
        enemySocket.socket.broadcast.emit('update_inGame_state', [enemy.username, false]);
        FIELDS.splice(FIELDS.indexOf(field), 1);
        await Field.destroy({where: {id: field.id}});
    });

    socket.on('disconnect', () => {

        let socketElement = SOCKET_TO_USER.find(element => element.socket.id === socket.id);
        if (!socketElement) {
            return;
        }
        socket.broadcast.emit('remove_user_from_list', socketElement.username);
        SOCKET_TO_USER.splice(SOCKET_TO_USER.indexOf(socketElement), 1);
        console.log("disconnected")
    });
});

export const isUserInGame = (username) => {
    return FIELDS.find(field => field.users.find(user => user.username === username)) != null
};

const retrieveUserRelatedData = (socket) => {
    let username = SOCKET_TO_USER.find(element => element.socket.id === socket.id).username;
    let userfield = FIELDS.find(field => field.users.find(user => user.username === username));
    let player = userfield.users.find(user => user.username === username);
    let enemy = userfield.users.find(user => user.username !== username);

    return {player: player, enemy: enemy, field: userfield};
};

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