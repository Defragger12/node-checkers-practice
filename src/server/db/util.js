import {Field, Piece, Square, User} from "./model";
import {DEFAULT_SQUARES, FIELDS} from "../constants";
import {COLOR} from "../../constants";
import {Field as ClientField} from "../../model/field";
import {arePositionsEqual, retrieveCoords, retrieveHowToReachInfo} from "../../positioning";

export const createUser = (username, password) => {
    return User.create({
        username: username,
        password: password
    });
};

export const prepareFieldForUsers = async (username1, username2) => {

    let user1 = await User.findOne({where: {username: username1}});
    let user2 = await User.findOne({where: {username: username2}});
    await user1.update({color: COLOR.WHITE});
    await user2.update({color: COLOR.BLACK});
    let field = await createField(user1, user2);

    return Field.findOne(fieldQuery({id: field.id}));
};

export const retrieveFieldForUser = async (username) => {
    let user = await User.findOne({where: {username: username}, attributes: ['username', 'color', 'fieldId']});
    let field = FIELDS.find(field => field.users.find(user => user.username === username));
    if (!field) {
        field = ClientField.convertFromDB(await Field.findOne(fieldQuery({id: user.fieldId})));
    }
    if (field) {
        let cachedField = FIELDS.find(existingField => existingField.id === field.id);
        if (cachedField) {
            delete user.fieldId;
            cachedField.users.push(user);
            return cachedField;
        } else {
            FIELDS.push(field)
        }
    }
    return field;
};

export const createField = async (user1, user2) => {

    let field = await Field.create({currentTurnColor: COLOR.WHITE});

    await field.addUser(user1);
    await field.addUser(user2);
    for (let square of DEFAULT_SQUARES) {
        let squareToCreate = {
            positionX: square.position[0],
            positionY: square.position[1],
            fieldId: field.id
        };
        let createdSquare = await Square.create(squareToCreate);
        if (square.piece) {
            let pieceToCreate = {
                rank: square.piece.rank,
                color: square.piece.color,
                squareId: createdSquare.id
            };
            await Piece.create(pieceToCreate);
        }
    }

    return field
};

export const moveSquare = async (turn, field) => {

    let targetSquare = field.squares.find(square => arePositionsEqual(square.position, turn.to));
    await Piece.create({
        squareId: targetSquare.id,
        rank: targetSquare.piece.rank,
        color: targetSquare.piece.color
    });
    await eraseAllPiecesBetween(turn.from, turn.to, field.squares);
};

const eraseAllPiecesBetween = async (position1, position2, squares) => {

    let {horizontalDirection, verticalDirection, distance} = retrieveHowToReachInfo(position1, position2);
    let {xCoord, yCoord} = retrieveCoords(position1);

    for (let i = 0; i < distance; i++) {
        let square = squares.find(square => arePositionsEqual(square.position, [xCoord, yCoord]));
        Piece.destroy({where: {squareId: square.id}});
        horizontalDirection ? xCoord++ : xCoord--;
        verticalDirection ? yCoord-- : yCoord++;
    }
};

const fieldQuery = (condition) => {
    return {
        attributes: ['id', 'currentTurnColor'],
        where: condition,

        include: [
            {
                model: Square, attributes: ['id', 'positionX', 'positionY'],
                include: [{model: Piece, attributes: ['id', 'color', 'rank']}]
            },
            {model: User, attributes: ['username', 'color']}
        ]
    }
};

