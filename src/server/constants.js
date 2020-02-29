import {COLOR, FIELD_LENGTH, RANK} from "../constants";
import {Square} from "../model/square";
import {Piece} from "../model/piece";
import {arePositionsEqual} from "../positioning";

export let DEFAULT_SQUARES = [];

export const FIELDS = [];
export const SOCKET_TO_USER = [];

const startingPositions = {
    [COLOR.BLACK]: [[2, 1], [4, 1], [6, 1], [8, 1], [1, 2], [3, 2], [5, 2], [7, 2], [2, 3], [4, 3], [6, 3], [8, 3]],
    [COLOR.WHITE]: [[1, 6], [3, 6], [5, 6], [7, 6], [2, 7], [4, 7], [6, 7], [8, 7], [1, 8], [3, 8], [5, 8], [7, 8]],
};
for (let color in startingPositions) {
    for (let positionIndex = 0; positionIndex < startingPositions[color].length; positionIndex++) {
        DEFAULT_SQUARES.push(new Square(startingPositions[color][positionIndex], new Piece(color, RANK.PLEB)));
    }
}
for (let i = 1; i <= FIELD_LENGTH; i++) {
    for (let j = 1; j <= FIELD_LENGTH; j++) {
        if (!DEFAULT_SQUARES.find(square => arePositionsEqual(square.position, [i, j]))) {
            DEFAULT_SQUARES.push(new Square([i, j]));
        }
    }
}