import {PLAYER_COLOR} from "../constants";

export class Piece {
    constructor(color, rank) {
        this.color = color;
        this.rank = rank;
    }

    generateDivClass() {
        return this.rank + "_" + this.color + (this.color === PLAYER_COLOR ? " draggable" : "");
    }
}