import express from "express";
import path from "path";
import {COLOR} from "../../constants";
import {prepareFieldForUser} from "../db/util";
import {playersInGame} from "../socket/checkers";
import {isAuthenticated} from "./auth";

export let common = express();

common.use(isAuthenticated);

common.get('/checkers', (req, res) => {
    //socket event -> fetch data for user, save in local instance

    res.sendFile(path.join(__dirname, '../../../public/index.html'))
});

common.get('/username', (req, res) => res.json(req.user.username));
common.get('/player_color', (req, res) => res.json(playersInGame === 1 ? COLOR.WHITE : COLOR.BLACK));
common.get('/opponent_color', (req, res) => res.json(playersInGame === 1 ? COLOR.BLACK : COLOR.WHITE));

common.post('/field', async (req, res) => {
    let username = req.user.username;
    let userfield = await prepareFieldForUser(username);
    res.json(userfield)
});