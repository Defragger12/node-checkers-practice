import {BASE_URL} from "../constants";
import axios from "axios";

export const retrievePlayerColor = async () => {
    let response = await axios({
        url: `${BASE_URL}/player_color`,
        method: 'get'
    });

    return response.data;
};

export const retrieveOpponentColor = async () => {
    let response = await axios({
        url: `${BASE_URL}/opponent_color`,
        method: 'get'
    });

    return response.data;
};

export const retrieveUserName = async () => {
    let response = await axios({
        url: `${BASE_URL}/username`,
        method: 'get'
    });

    return response.data;
};

export const retrieveFieldForUser = async () => {
    let response = await axios({
        url: `${BASE_URL}/field`,
        method: 'post'
    });

    console.log(response);
};