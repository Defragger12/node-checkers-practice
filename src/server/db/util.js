import {User, Square, Field, Piece} from "./model";
import {DEFAULT_SQUARES} from "../constants";
import {COLOR} from "../../constants";

export const createUser = (username, password) => {
    return User.create({
        username: username,
        password: password
    });
};

export const prepareFieldForUser = async (username) => {
    let user = await User.findOne({where: {username: username}});
    let field = await user.getField();
    if (!field) {
        field = await createField(user);
    }

    let createdField = await Field.findOne(
        {
            attributes: ['id', 'currentTurnColor'],
            where: {id: field.id},

            include: [
                {model: Square, attributes: ['id', 'positionX', 'positionY'],
                    include: [{model: Piece, attributes: ['color', 'rank']}]},
                {model: User, attributes: ['username']}
            ]
        }
    );

    return createdField;
};

export const addUserToField = async (userId, field) => {

    let user = await User.findOne({where: {id: userId}});
    field.addUser(user);
};

export const createField = async (user) => {

    let field = await Field.create({currentTurnColor: COLOR.WHITE});

    field.addUser(user);
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
            Piece.create(pieceToCreate);
        }
    }

    return field
};


