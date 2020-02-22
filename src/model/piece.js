import {PLAYER_COLOR} from "../client/constants";

export class Piece {
    constructor(color, rank) {
        this.color = color;
        this.rank = rank;
    }

    generateDivClass() {
        // vs opponent
        return this.rank + "_" + this.color + (this.color === PLAYER_COLOR ? " draggable" : "");
        // return `${this.rank}_${this.color} draggable`;
    }
}