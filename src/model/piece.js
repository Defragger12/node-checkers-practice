export class Piece {
    constructor(color, rank, playerColor) {
        this.color = color;
        this.rank = rank;
        this.playerColor = playerColor;
    }

    generateDivClass() {
        return this.rank + "_" + this.color + (this.color === this.playerColor ? " draggable" : "");
    }
}