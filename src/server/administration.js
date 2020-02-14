import {COLOR, FIELD_LENGTH, OPPONENT_COLOR, PLAYER_COLOR, RANK, SQUARES, TURN_DELAY} from "../constants";
import {Square} from "../model/square";
import {Turn} from "../model/turn";
import {changeTurn, isOpponentTurn} from "./opponent";
import {Piece} from "../model/piece";
import {arePositionsEqual} from "../positioning";

export let isForcedMovePresent;
export let isForcedQueenPresent;
export let positionsNotAllowedToBeatThrough = [];

export function initField() {
    SQUARES.length = 0;

    isForcedMovePresent = false;
    isForcedQueenPresent = false;

    initSquares();
    populateForcedMoves();
}

export function initSquares() {
    const startingPositions = {
        [COLOR.BLACK]: [[2, 1], [4, 1], [6, 1], [8, 1], [1, 2], [3, 2], [5, 2], [7, 2], [2, 3], [4, 3], [6, 3], [8, 3]],
        [COLOR.WHITE]: [[1, 6], [3, 6], [5, 6], [7, 6], [2, 7], [4, 7], [6, 7], [8, 7], [1, 8], [3, 8], [5, 8], [7, 8]],
    };
    for (let color in startingPositions) {
        for (let positionIndex = 0; positionIndex < startingPositions[color].length; positionIndex++) {
            SQUARES.push(new Square(startingPositions[color][positionIndex], new Piece(color, RANK.PLEB)));
        }
    }
    for (let i = 1; i <= FIELD_LENGTH; i++) {
        for (let j = 1; j <= FIELD_LENGTH; j++) {
            if (!SQUARES.find(square => arePositionsEqual(square.position, [i, j]))) {
                SQUARES.push(new Square([i, j]));
            }
        }
    }
}

export function gameFinishedCheck() {
    let noMovesAvailable = true;
    let noPiecesPresent = true;
    for (let i = 0; i < SQUARES.length; i++) {
        if (!SQUARES[i].isEmpty() && SQUARES[i].isFriendly()) {
            noPiecesPresent = false;
            SQUARES[i].populateAvailablePositionsToMove();
            if (SQUARES[i].tempAvailablePositionsToMove.length > 0) {
                noMovesAvailable = false;
            }
        }
    }
    return (noPiecesPresent || noMovesAvailable) && !isForcedMovePresent;
}

export function switchTurn() {
    clearTempMoves();
    positionsNotAllowedToBeatThrough.length = 0;

    changeTurn();

    populateForcedMoves();

    if (gameFinishedCheck()) {
        return true;
    }
}

export function clearTempMoves() {
    isForcedMovePresent = false;
    isForcedQueenPresent = false;
    SQUARES.forEach(square => {
        if (!square.isEmpty()) {
            square.tempAvailablePositionsToMove = [];
            square.tempForcedPositionsToMove = [];
            square.wasLastMoveForced = false;
        }
    });
}

export function populateForcedMoves(specificSquare) {
    isForcedMovePresent = false;
    isForcedQueenPresent = false;

    if (specificSquare) {
        clearTempMoves();
        specificSquare.populateForcedPositionsToMove();
        if (specificSquare.tempForcedPositionsToMove.length > 0) {
            isForcedMovePresent = true;
            if (specificSquare.piece.rank === RANK.QUEEN) {
                isForcedQueenPresent = true;
            }
        }
    } else {
        SQUARES.forEach(square => {
            if (!square.isEmpty() && square.isFriendly()) {
                square.populateForcedPositionsToMove();
                if (square.tempForcedPositionsToMove.length > 0) {
                    if (!isForcedMovePresent) {
                        isForcedMovePresent = true;
                    }
                    if (square.piece.rank === RANK.QUEEN && !isForcedQueenPresent) {
                        isForcedQueenPresent = true;
                    }
                }
            }
        });
    }
}

export function getCurrentPlayerColor() {
    return isOpponentTurn ? OPPONENT_COLOR : PLAYER_COLOR;
}