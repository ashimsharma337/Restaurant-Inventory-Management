import { combineReducers } from "redux";
import { orderReducer } from "./orderReducer";
import { productReducer } from "./productReducer";
import { userReducer } from "./userReducer";


const reducers = combineReducers({
    allProducts: productReducer,
    allUsers: userReducer,
    allOrders: orderReducer
});

export default reducers;