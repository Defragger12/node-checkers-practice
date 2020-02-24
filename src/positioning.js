import {FIELD_LENGTH} from "./constants";

export function isValidPosition(position) {
    return position[0] <= FIELD_LENGTH || position[0] >= 1 || position[1] <= FIELD_LENGTH || position[1] >= 1
}

export function arePositionsEqual(position1, position2) {
    return position1[0] === position2[0] && position1[1] === position2[1];
}

export function topLeft(position, steps) {
    const topLeftPosition = [position[0] - steps, position[1] - steps];
    return isValidPosition(topLeftPosition) ? topLeftPosition : null
}

export function topRight(position, steps) {
    const topRightPosition = [position[0] + steps, position[1] - steps];
    return isValidPosition(topRightPosition) ? topRightPosition : null
}

export function bottomLeft(position, steps) {
    const bottomLeftPosition = [position[0] - steps, position[1] + steps];
    return isValidPosition(bottomLeftPosition) ? bottomLeftPosition : null
}

export function bottomRight(position, steps) {
    const bottomRightPosition = [position[0] + steps, position[1] + steps];
    return isValidPosition(bottomRightPosition) ? bottomRightPosition : null
}

export function parsePosition(position) {
    return position.split(",").map(positionString => Number(positionString));
}

export function isPositionWithin(positionToCheck, position1, position2) {
    let horizontalDirection = position1[0] < position2[0];
    let verticalDirection = position1[1] > position2[1];

    let xCoord = position1[0];
    let yCoord = position1[1];
    let distance = Math.abs(position2[0] - xCoord);
    for (let i = 0; i <= distance; i++) {
        if (arePositionsEqual(positionToCheck, [xCoord, yCoord])) {
            return true;
        }
        horizontalDirection ? xCoord++ : xCoord--;
        verticalDirection ? yCoord-- : yCoord++;
    }
    return false;
}

export function findDivByPosition(position) {
    return isValidPosition(position) ?
        document.querySelectorAll(`[data-position='${position[0]},${position[1]}']`)[0] :
        null
}

export function findSquareByPosition(position, squares) {
    return isValidPosition(position) ?
        squares.find(square => arePositionsEqual(square.position, position)) :
        null
}