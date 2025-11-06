import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lanchonete from "./pages/Lanchonete";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Select from "./pages/Select";
import Menu from "./pages/Menu";
import Sesc from "./pages/Sesc";
import Salgados from "./pages/Salgados";
import Doces from "./pages/Doces";
import Bebidas from "./pages/Bebidas";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";

import Senac from "./pages/Senac";
import Salgado from "./pages/Salgado";
import Doce from "./pages/Doce";
import Bebida from "./pages/Bebida";
import Carrinho from "./pages/Carrinho";
import Pagamento from "./pages/Pagamento";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lanchonete />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select" element={<Select />} />
        <Route path="/menu/:unidade" element={<Menu />} />
        <Route path="/sesc" element={<Sesc/>} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/salgados" element={<Salgados/>} />
        <Route path="/doces" element={<Doces/>} />
        <Route path="/bebidas" element={<Bebidas />} />

        <Route path="/senac" element={<Senac/>} />
        <Route path="/salgado" element={<Salgado/>} />
        <Route path="/doce" element={<Doce/>} />
        <Route path="/bebida" element={<Bebida />} />
        <Route path="/carrinho" element={<Carrinho/>} />
        <Route path="/pagamento" element={<Pagamento/>} />
      </Routes>
    </BrowserRouter>
  );
}
