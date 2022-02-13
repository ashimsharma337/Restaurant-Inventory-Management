import Home from "./components/home/home_component";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login/login_component";


function App() {
  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
          </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
