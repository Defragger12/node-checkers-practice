import {BASE_URL} from "../constants";
import axios from "axios";

export async function retrievePlayerColor() {
    let response = await axios({
        url: `${BASE_URL}/player_color`,
        method: 'get'
    });

    console.log("player: " + response.data);

    return response.data;
}

export async function retrieveOpponentColor() {
    let response = await axios({
        url: `${BASE_URL}/opponent_color`,
        method: 'get'
    });

    console.log("opponent: " + response.data);

    return response.data;
}