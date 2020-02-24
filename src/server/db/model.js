import Sequelize from "sequelize";

const sequelize = new Sequelize("checkers", "root", "root", {
    dialect: "mysql",
    host: "localhost",
    port: 3306,
    logging: false
});

export const User = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
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
    currentTurnColor: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

export const Square = sequelize.define("square", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    positionX: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    positionY: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

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

Field.hasMany(User);
User.belongsTo(Field);

Field.hasMany(Square, {onDelete: "cascade"});

Square.hasMany(Piece, {onDelete: "cascade"});

sequelize.sync().then(result => {
    // console.log(result);
}).catch(
    // err=> console.log(err)
);