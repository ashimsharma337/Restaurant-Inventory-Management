import Home from "./components/home/home_component";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login/login_component";
import Dashboard from "./components/dashboard/dashboard_component";


function App() {
  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/dashboard" element={<Dashboard/>}></Route>
          </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
