import {FIELD_LENGTH} from "./constants";

export const isValidPosition = (position) => {
    return position[0] <= FIELD_LENGTH || position[0] >= 1 || position[1] <= FIELD_LENGTH || position[1] >= 1
};

export const arePositionsEqual = (position1, position2) => {
    return position1[0] === position2[0] && position1[1] === position2[1];
};

export const topLeft = (position, steps) => {
    const topLeftPosition = [position[0] - steps, position[1] - steps];
    return isValidPosition(topLeftPosition) ? topLeftPosition : null
};

export const topRight = (position, steps) => {
    const topRightPosition = [position[0] + steps, position[1] - steps];
    return isValidPosition(topRightPosition) ? topRightPosition : null
};

export const bottomLeft = (position, steps) => {
    const bottomLeftPosition = [position[0] - steps, position[1] + steps];
    return isValidPosition(bottomLeftPosition) ? bottomLeftPosition : null
};

export const bottomRight = (position, steps) => {
    const bottomRightPosition = [position[0] + steps, position[1] + steps];
    return isValidPosition(bottomRightPosition) ? bottomRightPosition : null
};

export const parsePosition = (position) => {
    return position.split(",").map(positionString => Number(positionString));
};

export const isPositionWithin = (positionToCheck, position1, position2) => {

    let {horizontalDirection, verticalDirection, distance} = retrieveHowToReachInfo(position1, position2);
    let {xCoord, yCoord} = retrieveCoords(position1);

    for (let i = 0; i <= distance; i++) {
        if (arePositionsEqual(positionToCheck, [xCoord, yCoord])) {
            return true;
        }
        horizontalDirection ? xCoord++ : xCoord--;
        verticalDirection ? yCoord-- : yCoord++;
    }
    return false;
};

export const findDivByPosition = (position) => {
    return isValidPosition(position) ?
        document.querySelectorAll(`[data-position='${position[0]},${position[1]}']`)[0] :
        null
};

export const findSquareByPosition = (position, squares) => {
    return isValidPosition(position) ?
        squares.find(square => arePositionsEqual(square.position, position)) :
        null
};

export const retrieveHowToReachInfo = (position1, position2) => {
    return {
        horizontalDirection: position1[0] < position2[0],
        verticalDirection: position1[1] > position2[1],
        distance: Math.abs(position2[0] - position1[0])
    };
};

export const retrieveCoords = (position) => {
    return {
        xCoord: position[0],
        yCoord: position[1]
    }
};