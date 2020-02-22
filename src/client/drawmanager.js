import {
    FIELD_HORIZONTAL_BORDER_LENGTH,
    FIELD_VERTICAL_BORDER_LENGTH,
    RANK,
    SQUARES,
    STEP_LENGTH
} from "../constants";
import {arePositionsEqual, findDivByPosition, parsePosition} from "../positioning";

export const FIELD = document.getElementById("field");

export function drawSquare(square) {

    const div = document.createElement('div');
    div.className = square.generateDivClass();
    div.style.left = FIELD_HORIZONTAL_BORDER_LENGTH + (square.position[0] - 1) * STEP_LENGTH + 'px';
    div.style.top = FIELD_VERTICAL_BORDER_LENGTH + (square.position[1] - 1) * STEP_LENGTH + 'px';
    div.dataset.position = square.position[0] + ',' + square.position[1];
    FIELD.appendChild(div);
}

function eraseAllPiecesBetween(position1, position2) {
    let horizontalDirection = position1[0] < position2[0];
    let verticalDirection = position1[1] > position2[1];

    let xCoord = position1[0];
    let yCoord = position1[1];

    let distance = Math.abs(position2[0] - position1[0]);
    for (let i = 0; i < distance; i++) {
        erase([xCoord, yCoord]);
        horizontalDirection ? xCoord++ : xCoord--;
        verticalDirection ? yCoord-- : yCoord++;
    }
}

function erase(position) {
    const div = findDivByPosition(position);
    div.className = "square droppable";
}

export function moveSquare(position1, position2, isRankUp) {
    let classNameToMove = findDivByPosition(position1).className;
    eraseAllPiecesBetween(position1, position2);

    if (isRankUp) {
        classNameToMove = classNameToMove.replace(RANK.PLEB, RANK.QUEEN);
    }

    findDivByPosition(position2).className = classNameToMove;
}