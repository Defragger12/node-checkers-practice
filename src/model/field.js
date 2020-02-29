import {COLOR, RANK} from "../constants";
import {Square} from "./square";

export class Field {

    constructor(squares, users, currentTurnColor) {

        this.playerColor = null;

        squares.forEach(square => {
            square.getField = () => this;
        });

        this.users = users;
        this.squares = squares;
        this.currentTurnColor = currentTurnColor;
        this.isAgainstAI = false;
        this.isForcedMovePresent = false;
        this.isForcedQueenPresent = false;
        this.positionsNotAllowedToBeatThrough = [];
    }

    gameFinishedCheck() {
        let noMovesAvailable = true;
        let noPiecesPresent = true;
        for (let i = 0; i < this.squares.length; i++) {
            if (!this.squares[i].isEmpty() && this.squares[i].isFriendly()) {
                noPiecesPresent = false;
                this.squares[i].populateAvailablePositionsToMove();
                if (this.squares[i].tempAvailablePositionsToMove.length > 0) {
                    noMovesAvailable = false;
                }
            }
        }
        return (noPiecesPresent || noMovesAvailable) && !this.isForcedMovePresent;
    };

    switchColor() {
        this.currentTurnColor = (this.currentTurnColor === COLOR.WHITE) ? COLOR.BLACK : COLOR.WHITE
    };


    switchTurn() {
        this.clearTempMoves();
        this.positionsNotAllowedToBeatThrough.length = 0;
        this.switchColor();
        this.populateForcedMoves();

        if (this.gameFinishedCheck()) {
            return true;
        }
    };

    clearTempMoves() {
        this.isForcedMovePresent = false;
        this.isForcedQueenPresent = false;
        this.squares.forEach(square => {
            if (!square.isEmpty()) {
                square.tempAvailablePositionsToMove = [];
                square.tempForcedPositionsToMove = [];
                square.wasLastMoveForced = false;
            }
        });
    };

    populateForcedMoves = (specificSquare) => {
        this.isForcedMovePresent = false;
        this.isForcedQueenPresent = false;

        if (specificSquare) {
            this.clearTempMoves();
            specificSquare.populateForcedPositionsToMove();
            if (specificSquare.tempForcedPositionsToMove.length > 0) {
                this.isForcedMovePresent = true;
                if (specificSquare.piece.rank === RANK.QUEEN) {
                    this.isForcedQueenPresent = true;
                }
            }
        } else {
            this.squares.forEach(square => {
                if (!square.isEmpty() && square.isFriendly()) {
                    square.populateForcedPositionsToMove();
                    if (square.tempForcedPositionsToMove.length > 0) {
                        if (!this.isForcedMovePresent) {
                            this.isForcedMovePresent = true;
                        }
                        if (square.piece.rank === RANK.QUEEN && !this.isForcedQueenPresent) {
                            this.isForcedQueenPresent = true;
                        }
                    }
                }
            });
        }
    };

    initField() {
        this.populateForcedMoves()
    };

    static convertFromDB(field) {

        if (!field) {
            return null
        }

        let convertedField;
        convertedField = new Field(
            field.squares.map(square => Square.convertFromDB(square)),
            field.users,
            field.currentTurnColor
        );
        convertedField.id = field.id;

        return convertedField;
    }
}