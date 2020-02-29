import {
    FIELD_HORIZONTAL_BORDER_LENGTH,
    FIELD_VERTICAL_BORDER_LENGTH,
    RANK,
    STEP_LENGTH
} from "../constants";
import {findDivByPosition} from "../positioning";
import {socket} from "./checkers";
import {Piece} from "../model/piece";
import {Square} from "../model/square";

export const FIELD = document.getElementById("field");
const PLAYER_LIST = document.getElementById("player-list");

export const drawSquare = (square) => {

    const div = document.createElement('div');
    div.className = square.generateDivClass();
    div.style.left = FIELD_HORIZONTAL_BORDER_LENGTH + (square.position[0] - 1) * STEP_LENGTH + 'px';
    div.style.top = FIELD_VERTICAL_BORDER_LENGTH + (square.position[1] - 1) * STEP_LENGTH + 'px';
    div.dataset.position = square.position[0] + ',' + square.position[1];
    FIELD.appendChild(div);
};

export const eraseAllPiecesBetween = (position1, position2) => {
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
};

export const erase = (position) => {
    const div = findDivByPosition(position);
    div.className = "square droppable";
};

export const moveSquare = (position1, position2, isRankUp) => {
    let classNameToMove = findDivByPosition(position1).className;
    eraseAllPiecesBetween(position1, position2);

    if (isRankUp) {
        classNameToMove = classNameToMove.replace(RANK.PLEB, RANK.QUEEN);
    }

    findDivByPosition(position2).className = classNameToMove;
};

export const drawField = (squares, playerColor) => {
    FIELD.innerHTML = "";

    squares.forEach(square => {
        drawSquare(new Square(
            square.position,
            square.piece ? new Piece(square.piece.color, square.piece.rank, playerColor) : null
            )
        )
    });
};

export const addPlayerToList = (username) => {
    let existingElement = document.querySelector(`div#player-list > button#${username}`);
    if (existingElement) {
        return;
    }
    PLAYER_LIST.appendChild(generatePlayerItem(username));
};

export const removePlayerFromList = (username) => {
    let elementToRemove = document.querySelector(`div#player-list > button#${username}`);
    elementToRemove.parentNode.removeChild(elementToRemove);
};

const generatePlayerItem = (username) => {
    let playerItem = document.createElement("button");
    playerItem.className = "list-group-item list-group-item-action";
    playerItem.onclick = () => socket.emit("game_invite", username);
    playerItem.id = username;
    playerItem.appendChild(document.createTextNode(username));
    return playerItem;
};