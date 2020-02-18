const Sequelize = require("sequelize");

const sequelize = new Sequelize("checkers", "root", "root", {
    dialect: "mysql",
    host: "localhost",
    port: 3306
});

export const Game =  sequelize.define("game", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    }
});

Game.hasMany(User);
Game.hasOne(Field, {onDelete: "cascade"});

export const User = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export const Field = sequelize.define("field", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    currentTurn: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Field.hasMany(Square, {onDelete: "cascade"});

export const Square = sequelize.define("square", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    positionX: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    positionY: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    rank: {
        type: Sequelize.STRING,
        allowNull: false
    },
    color: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Square.hasOne(Piece, {onDelete: "cascade"});

export const Piece = sequelize.define("piece", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    rank: {
        type: Sequelize.STRING,
        allowNull: false
    },
    color: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

sequelize.sync().then(result => {
    // console.log(result);
}).catch(
    // err=> console.log(err)
);