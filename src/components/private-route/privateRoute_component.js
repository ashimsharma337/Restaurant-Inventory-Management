import { Navigate } from "react-router-dom";

function PrivateRoute({component}){
    const is_Logged_In = localStorage.getItem("att");

    return is_Logged_In ? component : <Navigate to="/login"/>;

};

export default PrivateRoute;