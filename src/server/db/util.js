import {User, Square, Field, Piece, Game} from "./model";

export const createUser = (username, password) => {
    return User.create({
        username: username,
        password: password
    });
};

export const getGameForUser = (userId) => {
    let field = User.findOne({where: {id: userId}}).getGame();
    if (!field) {
        return null;
    }
};

export const createGame = (userIds, squares) => {

    let user1 = User.findOne({where: {id: userIds[0]}});
    let user2 = User.findOne({where: {id: userIds[1]}});

    Game.create().then(game => {
        game.addUser(user1);
        game.addUser(user2);
        Field.create({gameId: game.id}).then(field => {
            for (let square in squares) {
                let squareToCreate = {positionX: square.position[0], positionY: square.position[1], fieldId: field.id};
                Square.create(squareToCreate).then(createdSquare => {
                    if (square.piece) {
                        let pieceToCreate = {
                            rank: square.piece.rank,
                            color: square.piece.color,
                            squareId: createdSquare.id
                        };
                        Piece.create(pieceToCreate);
                    }
                });
            }
        })
    });
};