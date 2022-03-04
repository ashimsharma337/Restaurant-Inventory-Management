import { httpRequest } from "../../services/httpclient";
import { ActionTypes } from "../constants/actionTypes"


export const getProducts = () => {
    
    return async function (dispatch) {
        const response = await httpRequest.getItems("/products");

        dispatch({type: ActionTypes.GET_PRODUCTS, payload: response.data.result});
    };

};

export const getUsers = () => {
    
    return async function (dispatch) {
        const response = await httpRequest.getItems("/users");

        dispatch({type: ActionTypes.GET_USERS, payload: response.data.result});
    };

};




