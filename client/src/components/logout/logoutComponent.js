import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout(){
    localStorage.clear();
    const navigate = useNavigate();
    useEffect(() => {
      navigate("/login");
    });
    return null;
}

export default Logout;