import {isForcedMovePresent, isForcedQueenPresent} from "./administration";
import * as positioning from "../positioning";
import {FIELD_LENGTH, OPPONENT_COLOR, PLAYER_COLOR, RANK, SQUARES} from "../constants";
import {Turn} from "../model/turn";

export let isOpponentTurn = false;

export function changeTurn() {
    isOpponentTurn = !isOpponentTurn;
}

export function performMove() {
    if (!isOpponentTurn) {
        return null;
    }
    if (isForcedMovePresent) {
        return performBestForcedMove();
    } else {
        return performBestAvailableMove();
    }
}

function performBestForcedMove() {
    let suicideMoves = [];
    let squareToMove;
    squareToMove = SQUARES.find(square =>
        square.tempForcedPositionsToMove &&
        square.tempForcedPositionsToMove.length > 0 &&
        square.piece.rank === (isForcedQueenPresent ? RANK.QUEEN : RANK.PLEB)
    );

    let notSuicideForcedMove = performForcedMoveIfNotSuicide(squareToMove, suicideMoves);
    if (notSuicideForcedMove) {
        return notSuicideForcedMove;
    }

    suicideMoves[0].square.wasLastMoveForced = true;
    return suicideMoves[0].square.moveTo(suicideMoves[0].position);
}

function performBestAvailableMove() {

    let squaresWithAvailableMoves = [];
    SQUARES.forEach(square => {
        if (!square.isEmpty() && square.piece.color === OPPONENT_COLOR) {
            square.populateAvailablePositionsToMove();
            if (square.tempAvailablePositionsToMove.length > 0) {
                squaresWithAvailableMoves.push(square);
            }
        }
    });

    let squareToCheckL, squareToCheckR;
    let suicideMoves = [];
    for (let oYcheck = FIELD_LENGTH; oYcheck >= 1; oYcheck--) {
        for (let oXlcheck = 1; oXlcheck <= FIELD_LENGTH / 2; oXlcheck++) {

            let oXrcheck = FIELD_LENGTH + 1 - oXlcheck;

            squareToCheckL = squaresWithAvailableMoves.find(square =>
               positioning.arePositionsEqual(square.position, [oXlcheck, oYcheck])
            );

            let availableNotSuicideMove = performAvailableMoveIfNotSuicide(squareToCheckL, suicideMoves);
            if (availableNotSuicideMove) {
                return availableNotSuicideMove;
            }

            squareToCheckR = squaresWithAvailableMoves.find(square =>
                positioning.arePositionsEqual(square.position, [oXrcheck, oYcheck])
            );
            availableNotSuicideMove = performAvailableMoveIfNotSuicide(squareToCheckR, suicideMoves);
            if (availableNotSuicideMove) {
                return availableNotSuicideMove;
            }
        }
    }

    if (suicideMoves.length === 0) {
        return new Turn(null, null, true, false, true);
    } else {
        return suicideMoves[0].square.moveTo(suicideMoves[0].position);
    }
}

function performForcedMoveIfNotSuicide(square, suicideMoves) {
    if (!square) {
        return;
    }
    for (let i = 0; i < square.tempForcedPositionsToMove.length; i++) {
        if (!checkIfSuicideMove(square, square.tempForcedPositionsToMove[i])) {
            square.wasLastMoveForced = true;
            return square.moveTo(square.tempForcedPositionsToMove[i]);

        } else {
            suicideMoves.push({
                square: square,
                position: square.tempForcedPositionsToMove[i]
            });
        }
    }
}

function performAvailableMoveIfNotSuicide(square, suicideMoves) {
    if (!square) {
        return;
    }
    for (let i = 0; i < square.tempAvailablePositionsToMove.length; i++) {
        if (!checkIfSuicideMove(square, square.tempAvailablePositionsToMove[i])) {
            return square.moveTo(square.tempAvailablePositionsToMove[i]);
        } else {
            suicideMoves.push({
                square: square,
                position: square.tempAvailablePositionsToMove[i]
            });
        }
    }
}

function checkIfSuicideMove(squareToCheck, position) {

    if (!squareToCheck.isMoveToPositionAllowed(position)) {
        return;
    }

    const moveToSquare = positioning.findSquareByPosition(position);

    let forcedMovesBeforeCount = countPlayerForcedMoves();

    moveToSquare.piece = squareToCheck.piece;
    squareToCheck.piece = null;

    let forcedMovesAfterCount = countPlayerForcedMoves();

    squareToCheck.piece = moveToSquare.piece;
    moveToSquare.piece = null;

    return forcedMovesAfterCount > forcedMovesBeforeCount
}

function countPlayerForcedMoves() {

    let forcedMovesCount = 0;

    isOpponentTurn = false;

    SQUARES.forEach(square => {
        if (!square.isEmpty() && square.piece.color === PLAYER_COLOR) {
            square.populateForcedPositionsToMove();
            forcedMovesCount += square.tempForcedPositionsToMove.length
        }
    });

    isOpponentTurn = true;

    return forcedMovesCount;
}