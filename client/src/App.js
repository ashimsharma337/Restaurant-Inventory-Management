import Home from "./components/home/home_component";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login/login_component";
import Dashboard from "./components/dashboard/dashboard_component";
import Register from "./components/register/register_component";
import AddProduct from "./components/addProduct";


function App() {
  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/dashboard" element={<Dashboard/>}></Route>
            <Route path="/register" element={<Register/>}></Route>
            <Route path="/addproduct" element={<AddProduct/>}></Route>
          </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
