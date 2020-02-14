import express from "express";
import path from "path";
import bodyParser from "body-parser";
import {isOpponentTurn, performMove} from "./src/server/opponent";
import {findSquareByPosition} from "./src/positioning";
import {initField} from "./src/server/administration";
import {SQUARES} from "./src/constants";

let app = express();

app.use(express.static(path.resolve(__dirname, 'public')));
let jsonParser = bodyParser.json();

app.get('/', function(req, res) {
    res.sendFile(path.resolve(__dirname, '/public/index.html'));
});

app.get('/squares', function(req, res) {
    res.json(SQUARES);
});

app.post('/init', function(req, res) {
    initField();
});

app.post('/turn', jsonParser, function(req, res) {

    if (isOpponentTurn) {
        res.json(null);
    }

    if (!req.body) {
        return res.sendStatus(400);
    }

    let squareToMove = findSquareByPosition(req.body.from);
    res.json(squareToMove.moveTo(req.body.to));
});

app.get('/enemy', jsonParser, function(req, res) {

    res.json(performMove());
});

app.listen(3000);

console.log("Running at Port 3000");