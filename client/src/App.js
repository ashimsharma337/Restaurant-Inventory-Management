import Home from "./components/home/home_component";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login/login_component";
import Dashboard from "./components/dashboard/dashboard_component";
import Register from "./components/register/register_component";
import AddProduct from "./components/addProduct";

function PrivateRoute({component}){
      const is_Logged_In = localStorage.getItem("token");

      return is_Logged_In ? component : <Navigate to="/login"/>;

}

function App() {
  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/register" element={<Register/>}></Route>
            
            

            <Route path="/dashboard" element={<PrivateRoute component={<Dashboard/>}></PrivateRoute>}>
               
            </Route>
            <Route path="/addproduct" element={<PrivateRoute component={<AddProduct/>}></PrivateRoute>}>
              
            </Route>

            
          </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
