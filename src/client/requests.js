import {parsePosition} from "../positioning";
import {BASE_URL, PORT, TURN_DELAY} from "../constants";
import {drawField, drawSquare, moveSquare} from "./drawmanager";
import * as axios from "axios";

export async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

export async function performPlayerTurn(prevPosition, moveToPosition) {
    let response = await axios({
        url: `${BASE_URL}/turn`,
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
            url: `${BASE_URL}/turn`,
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
        url: `${BASE_URL}/init`,
        method: 'post'
    });
}

export function getSquares() {
    return axios({
        url: `${BASE_URL}/squares`,
        method: 'get',
    })
}