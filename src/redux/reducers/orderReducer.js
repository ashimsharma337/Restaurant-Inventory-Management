import { ActionTypes } from "../constants/actionTypes";

const initialState = {
    orders: []
};



export const orderReducer = (state = initialState, { type, payload }) => {
     switch(type) {
         case ActionTypes.GET_ORDERS: 
              return {...state, orders: payload };
         case ActionTypes.SET_ORDERS: 
              return {...state, orders: payload };
         default: 
            return state;
     }
}