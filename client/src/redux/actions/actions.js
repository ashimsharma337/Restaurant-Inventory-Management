import { httpRequest } from "../../services/httpclient";
import { ActionTypes } from "../constants/actionTypes"


export const getProducts = () => {
    
    return async function (dispatch) {
        const response = await httpRequest.getItems("/products", true);

        dispatch({type: ActionTypes.GET_PRODUCTS, payload: response.data.result});
    };

};

export const getUsers = () => {
    
    return async function (dispatch) {
        const response = await httpRequest.getItems("/users", true);

        dispatch({type: ActionTypes.GET_USERS, payload: response.data.result});
    };

};

export const getOrders = () => {
    
    return async function (dispatch) {
        const response = await httpRequest.getItems("/orders", true);

        dispatch({type: ActionTypes.GET_ORDERS, payload: response.data.result});
    };

};

export const setOrders = (data) => {
    
    return async function (dispatch) {
        const response = await httpRequest.postItem("/orders", data, true);

        dispatch({type: ActionTypes.SET_ORDERS, payload: response.data.result});
    };
}







