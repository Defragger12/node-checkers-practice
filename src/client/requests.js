import {parsePosition} from "../positioning";
import {TURN_DELAY} from "../constants";
import {drawField, drawSquare, moveSquare} from "./drawmanager";
import * as axios from "axios";
import {Square} from "../model/square";
import {Piece} from "../model/piece";

export async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

export async function performPlayerTurn(prevPosition, moveToPosition) {
    let response = await axios({
        url: 'http://localhost:3000/turn',
        method: 'post',
        data: {
            from: parsePosition(prevPosition),
            to: parsePosition(moveToPosition)
        }
    });

    if (!response.data) {
        return false;
    }

    moveSquare(response.data.from, response.data.to, response.data.isRankUp);

    let gameEnds = await checkIfGameEnds(response);
    if (gameEnds || !response.data.isLast) {
        return false;
    }

    return true;
}

export async function performEnemyTurns() {
    while (true) {
        await delay(TURN_DELAY);
        let enemyResponse = await axios({
            url: 'http://localhost:3000/enemy',
            method: 'get'
        });

        if (!enemyResponse.data) {
            return;
        }

        moveSquare(enemyResponse.data.from, enemyResponse.data.to, enemyResponse.data.isRankUp);

        let gameEnds = await checkIfGameEnds(enemyResponse);
        if (gameEnds || enemyResponse.data.isLast) {
            return;
        }
    }
}

async function checkIfGameEnds(response) {
    if (response.data.isGG) {
        await delay(TURN_DELAY);
        if (confirm("GG, go again?")) {
            drawField();
        }
        return true;
    }
}

export function resetField() {
    axios({
        url: 'http://localhost:3000/init',
        method: 'post'
    });
}

export function getSquares() {
    return axios({
        url: 'http://localhost:3000/squares',
        method: 'get',
    })
}