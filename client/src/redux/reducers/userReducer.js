import { ActionTypes } from "../constants/actionTypes";

const initialState = {
    users: [],
};



export const userReducer = (state = initialState, { type, payload }) => {
     switch(type) {
         case ActionTypes.GET_USERS: 
              return {...state, users: payload };
         default: 
            return state;
     }
}