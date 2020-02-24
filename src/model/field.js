import {COLOR, RANK} from "../constants";

export class Field {
    constructor(user1, user2, squares, isAgainstAI) {
        this.user1 = user1;
        this.user2 = user2;
        squares.forEach(square => square.field = this);
        this.squares = squares;
        this.currentTurnColor = COLOR.WHITE;
        this.isAgainstAI = isAgainstAI;
        this.isForcedMovePresent = false;
        this.isForcedQueenPresent = false;
        this.id = null;
        this.positionsNotAllowedToBeatThrough = [];
    }

    gameFinishedCheck = () => {
        let noMovesAvailable = true;
        let noPiecesPresent = true;
        for (let i = 0; i < this.squares.length; i++) {
            if (!this.squares.isEmpty() && this.squares.isFriendly()) {
                noPiecesPresent = false;
                this.squares.populateAvailablePositionsToMove();
                if (this.squares.tempAvailablePositionsToMove.length > 0) {
                    noMovesAvailable = false;
                }
            }
        }
        return (noPiecesPresent || noMovesAvailable) && !this.isForcedMovePresent;
    };

    switchColor = () => {
        this.currentTurnColor = (this.currentTurnColor === COLOR.WHITE) ? COLOR.BLACK : COLOR.WHITE;
    };

    switchTurn = () => {
        this.clearTempMoves();
        this.positionsNotAllowedToBeatThrough.length = 0;

        this.switchColor();

        this.populateForcedMoves();

        if (this.gameFinishedCheck()) {
            return true;
        }
    };

    clearTempMoves = () => {
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

    initField = () => {
        this.populateForcedMoves();
    }
}