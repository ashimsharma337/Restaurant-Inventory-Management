import { ActionTypes } from "../constants/actionTypes"
export const setUsers = (users) => {
    return {
        type: ActionTypes.GET_USERS,
        payload: users,
    };
}