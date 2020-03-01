import {
    FIELD_HORIZONTAL_BORDER_LENGTH,
    FIELD_VERTICAL_BORDER_LENGTH,
    RANK,
    STEP_LENGTH
} from "../constants";
import {findDivByPosition, retrieveCoords, retrieveHowToReachInfo} from "../positioning";
import {socket} from "./checkers";
import {Piece} from "../model/piece";
import {Square} from "../model/square";

const FIELD = document.getElementById("field");
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

    let {horizontalDirection, verticalDirection, distance} = retrieveHowToReachInfo(position1, position2);
    let {xCoord, yCoord} = retrieveCoords(position1);

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

export const addPlayerToList = (username, isInGame) => {
    if (findDivWithUser(username)) {
        return;
    }
    PLAYER_LIST.appendChild(generatePlayerItem(username, isInGame));
    updateIsInGameState(username, isInGame);
};

export const removePlayerFromList = (username) => {
    let elementToRemove = findDivWithUser(username);
    elementToRemove.parentNode.removeChild(elementToRemove);
};

export const updateIsInGameState = (username, isInGame) => {
    let playerDiv = findDivWithUser(username);
    let updatedBadge = generatePlayerBadge(username, isInGame);
    if (playerDiv.childNodes[1]) {
        playerDiv.replaceChild(updatedBadge, playerDiv.childNodes[1]);
        return;
    }
    playerDiv.appendChild(updatedBadge);
};

export const makeFieldInactive = () => {
    FIELD.childNodes.forEach(node => node.classList.remove('draggable'));
};

export const updatePlayerFinder = (isInGame) => {
    document.getElementById('invite-player-button').disabled = isInGame;
};

const generatePlayerItem = (username) => {
    let playerItem = document.createElement("div");
    playerItem.className = "list-group-item";
    playerItem.id = username;

    let playerName = document.createElement("strong");
    playerName.className = "align-middle";
    playerName.appendChild(document.createTextNode(username));
    playerItem.appendChild(playerName);

    return playerItem;
};

const generatePlayerBadge = (username, isInGame) => {
    let playerBadge = document.createElement("span");
    playerBadge.className = `badge badge-pill float-right p-2 ${isInGame ? "badge-secondary" : "badge-success btn"}`;
    playerBadge.appendChild(document.createTextNode(isInGame ? "in game" : "send invite"));
    playerBadge.onclick = () => {
        if (isInGame) return;
        socket.emit("game_invite", username);
    };

    return playerBadge;
};

const findDivWithUser = (username) => {
    return document.querySelector(`div#player-list > div#${username}`);
};