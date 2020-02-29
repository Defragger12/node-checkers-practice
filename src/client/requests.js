import {BASE_URL} from "../constants";
import axios from "axios";

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
        method: 'get'
    });

    return response.data;
};

export const preparePlayerList = async () => {
    let response = await axios({
        url: `${BASE_URL}/players`,
        method: 'get'
    });

    return response.data;
};