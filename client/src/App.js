import Home from "./components/home/home_component";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/login/login_component";
import Dashboard from "./components/dashboard/dashboard_component";
import Register from "./components/register/register_component";
import AddProduct from "./components/products/addProduct";
import AddCategory from "../src/components/category/categoryCreate_component";
import { useEffect } from "react";
import Category from "./components/category/category_component";
import EditCategory from "./components/category/category_edit.component";
import EditProduct from "./components/products/editProduct_component";
import Product from "./components/products/product_component";


function PrivateRoute({component}){
      const is_Logged_In = localStorage.getItem("att");

      return is_Logged_In ? component : <Navigate to="/login"/>;

}

function Logout(){
      localStorage.clear();
      const navigate = useNavigate();
      useEffect(() => {
        navigate("/login");
      });
      return null;
}

function App() {
  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/register" element={<Register/>}></Route>
            <Route path="/logout" element={<Logout/>}></Route>
            
            

            <Route path="/dashboard" element={<PrivateRoute component={<Dashboard/>}></PrivateRoute>}>
               
            </Route>
            <Route path="/category" element={<PrivateRoute component={<Category/>}></PrivateRoute>}>
               
            </Route>
            <Route path="/product" element={<PrivateRoute component={<Product/>}></PrivateRoute>}>
               
            </Route>
            <Route path="/addproduct" element={<PrivateRoute component={<AddProduct/>}></PrivateRoute>}>
              
            </Route>
            <Route path="/product/:id" element={<PrivateRoute component={<EditProduct/>}></PrivateRoute>}>
               
            </Route>
            
            <Route path="/addcategory" element={<PrivateRoute component={<AddCategory/>}></PrivateRoute>}>
              
            </Route>
            <Route path="/category/:id" element={<PrivateRoute component={<EditCategory/>}></PrivateRoute>}>
              
            </Route>

            
          </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
