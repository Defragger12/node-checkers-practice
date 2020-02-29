import {Turn} from "./turn";
import {arePositionsEqual, findSquareByPosition, isPositionWithin, isValidPosition} from "../positioning";
import {Piece} from "./piece";
import {COLOR, DIRECTION, FIELD_LENGTH, RANK} from "../constants";

export class Square {

    constructor(position, piece) {
        this.position = position;
        this.piece = piece;
    }

    erase() {
        this.piece = null;
        this.tempForcedPositionsToMove = [];
        this.tempAvailablePositionsToMove = [];
    }

    moveTo(position) {
        if (!this.isMoveToPositionAllowed(position)) {
            return null;
        }

        const moveToSquare = findSquareByPosition(position, this.getField().squares);
        let isRankUp = moveToSquare.ableToRankUp();
        moveToSquare.piece = new Piece(this.piece.color, isRankUp ? RANK.QUEEN : this.piece.rank);

        this.eraseAllBetween(position);

        if (this.wasLastMoveForced) {
            this.wasLastMoveForced = false;
            this.getField().populateForcedMoves(moveToSquare);
            if (!this.getField().isForcedMovePresent) {
                let gameEnds = this.getField().switchTurn();
                return new Turn(this.position, position, true, isRankUp, gameEnds);
            }
            return new Turn(this.position, position, false, isRankUp);
        } else {
            let gameEnds = this.getField().switchTurn();
            return new Turn(this.position, position, true, isRankUp, gameEnds);
        }
    }

    populateAvailablePositionsToMove() {
        this.tempAvailablePositionsToMove = [];
        switch (this.piece.rank) {
            case RANK.PLEB:
                if (this.piece.color === COLOR.WHITE) {
                    this.searchAvailablePositionsToMove(DIRECTION.TOP_LEFT, 1);
                    this.searchAvailablePositionsToMove(DIRECTION.TOP_RIGHT, 1);
                } else {
                    this.searchAvailablePositionsToMove(DIRECTION.BOTTOM_LEFT, 1);
                    this.searchAvailablePositionsToMove(DIRECTION.BOTTOM_RIGHT, 1);
                }
                break;
            case RANK.QUEEN:
                for (let direction in DIRECTION) {
                    for (let i = 1; i < FIELD_LENGTH; i++) {
                        if (!this.searchAvailablePositionsToMove(DIRECTION[direction], i)) {
                            break;
                        }
                    }
                }
                break;
            default:
                break;
        }
    }

    populateForcedPositionsToMove() {
        this.tempForcedPositionsToMove = [];

        for (let direction in DIRECTION) {
            this.searchForcedPositionsToMove(DIRECTION[direction]);
        }
    }

    searchAvailablePositionsToMove(direction, steps) {
        let squareToCheck = findSquareByPosition(direction(this.position, steps), this.getField().squares);
        if (squareToCheck && squareToCheck.isEmpty()) {
            this.tempAvailablePositionsToMove.push(squareToCheck.position);
            return true;
        }
    }

    searchForcedPositionsToMove(direction) {
        let squareToCheck, squareToCheck1, squareToCheck2;
        switch (this.piece.rank) {
            case RANK.PLEB:
                squareToCheck1 = findSquareByPosition(direction(this.position, 1), this.getField().squares);
                if (!squareToCheck1 ||
                    squareToCheck1.isEmpty() ||
                    squareToCheck1.isFriendly()
                ) {
                    return;
                }
                squareToCheck2 = findSquareByPosition(direction(this.position, 2), this.getField().squares);
                if (squareToCheck2 && squareToCheck2.isEmpty()) {
                    this.tempForcedPositionsToMove.push(squareToCheck2.position);
                }
                break;
            case RANK.QUEEN:
                for (let i = 1; i < FIELD_LENGTH; i++) {
                    squareToCheck = findSquareByPosition(direction(this.position, i), this.getField().squares);
                    squareToCheck1 = findSquareByPosition(direction(this.position, i + 1), this.getField().squares);
                    if (!squareToCheck || !squareToCheck1 || (!squareToCheck.isEmpty() && squareToCheck.isFriendly())) {
                        return;
                    }
                    if (!squareToCheck.isEmpty() && !squareToCheck1.isEmpty()) {
                        return;
                    }
                    if (!squareToCheck.isEmpty() && !squareToCheck.isFriendly() && squareToCheck1.isEmpty()) {
                        for (let i = 0; i < this.getField().positionsNotAllowedToBeatThrough.length; i++) {
                            if (isPositionWithin(
                                this.getField().positionsNotAllowedToBeatThrough[i],
                                this.position,
                                squareToCheck1.position
                            )) {
                                return;
                            }
                        }
                        this.tempForcedPositionsToMove.push(squareToCheck1.position);
                        for (let j = i + 2; j < FIELD_LENGTH; j++) {
                            squareToCheck2 = findSquareByPosition(direction(this.position, j), squares);
                            if (squareToCheck2 && squareToCheck2.isEmpty()) {
                                this.tempForcedPositionsToMove.push(squareToCheck2.position)
                            } else {
                                return;
                            }
                        }
                    }
                }
                break;
            default:
                break;
        }
    }

    isMoveToPositionAllowed(position) {
        if (!isValidPosition(position)) {
            return false;
        }

        if (this.getField().isForcedQueenPresent && this.piece.rank !== RANK.QUEEN) {
            return false;
        }

        if (this.getField().isForcedMovePresent) {
            let forcedToMoveSquare;
            if (this.tempForcedPositionsToMove) {
                forcedToMoveSquare = this.tempForcedPositionsToMove.find(availablePosition =>
                    arePositionsEqual(availablePosition, position)
                )
            }
            if (forcedToMoveSquare) {
                this.wasLastMoveForced = true;
                return true;
            }
            return false;
        }

        if (!this.tempAvailablePositionsToMove || this.tempAvailablePositionsToMove.length === 0) {
            this.populateAvailablePositionsToMove();
        }

        return this.tempAvailablePositionsToMove ?
            this.tempAvailablePositionsToMove.find(availablePosition =>
                arePositionsEqual(availablePosition, position)
            ) :
            false;
    }

    eraseAllBetween(position) {
        let horizontalDirection = this.position[0] < position[0];
        let verticalDirection = this.position[1] > position[1];

        let xCoord = this.position[0];
        let yCoord = this.position[1];

        let distance = Math.abs(position[0] - this.position[0]);
        for (let i = 0; i < distance; i++) {
            let squareToBeat = this.getField().squares.find(square => arePositionsEqual(square.position, [xCoord, yCoord]));
            if (squareToBeat && !squareToBeat.isEmpty()) {
                if (i >= 1) {
                    this.getField().positionsNotAllowedToBeatThrough.push(squareToBeat.position);
                }
                squareToBeat.erase();
            }
            horizontalDirection ? xCoord++ : xCoord--;
            verticalDirection ? yCoord-- : yCoord++;
        }
    }

    isEmpty() {
        return !this.piece;
    }

    isFriendly() {
        return this.piece.color === this.getField().currentTurnColor;
    }

    generateDivClass() {
        return "square " + (this.isEmpty() ? "droppable " : this.piece.generateDivClass());
    }

    ableToRankUp() {
        return this.getField().currentTurnColor === COLOR.BLACK ? this.position[1] === FIELD_LENGTH : this.position[1] === 1;
    }

    static convertFromDB(square) {
        let convertedPiece;
        if (square.piece) {
            convertedPiece = new Piece(square.piece.color, square.piece.rank);
            convertedPiece.id = square.piece.id;
        }
        let convertedSquare = new Square([square.positionX, square.positionY], convertedPiece);
        convertedSquare.id = square.id;
        return convertedSquare;
    }
}