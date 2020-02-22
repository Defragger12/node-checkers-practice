import {retrieveOpponentColor, retrievePlayerColor} from "./requests";

retrievePlayerColor().then(color => PLAYER_COLOR = color);
retrieveOpponentColor().then(color => OPPONENT_COLOR = color);

export let PLAYER_COLOR;
export let OPPONENT_COLOR;