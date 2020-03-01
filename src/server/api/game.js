import express from "express";
import path from "path";
import {retrieveFieldForUser} from "../db/util";
import {isAuthenticated} from "./auth";
import {SOCKET_TO_USER} from "../constants";
import {isUserInGame} from "../../../server";

export let game = express();

game.use(isAuthenticated);

game.get('/checkers', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/checkers.html'))
});

game.get('/players', (req, res) => {
    let usernames = SOCKET_TO_USER.map(socket => socket.username).filter(username => username !== req.user.username);

   res.json(usernames.map(username => {return {name: username, isInGame: isUserInGame(username)}}));
});

game.get('/field', async (req, res) => {
    let username = req.user.username;
    let field = await retrieveFieldForUser(username);
    if (!field) {
        res.json();
        return;
    }
    let playerColor = field.users.find(user => user.username === username).color;
    res.json([field.squares, playerColor]);
});