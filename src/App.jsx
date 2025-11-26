import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lanchonete from "./pages/Lanchonete";
import Cadastro from "./pages/Cadastro";
import LoginAdm from "./pages/LoginAdm";
import LoginUser from "./pages/LoginUser";
import Register from "./pages/Register";
import RegisterAdm from "./pages/RegisterAdm";
import Select from "./pages/Select";
import Sesc from "./pages/Sesc";
import Salgados from "./pages/Salgados";
import Doces from "./pages/Doces";
import Bebidas from "./pages/Bebidas";
import Carrinho from "./pages/Carrinho";
import Pagamento from "./pages/Pagamento";
import Profile from "./pages/Profile";
import EditarPerfil from "./pages/EditarPerfil";
import Selecione from "./pages/Selecione";



import Senac from "./pages/Senac";
import Salgado from "./pages/Salgado";
import Doce from "./pages/Doce";
import Bebida from "./pages/Bebida";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lanchonete />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/loginAdm" element={<LoginAdm />} />
        <Route path="/loginUser" element={<LoginUser />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registerAdm" element={<RegisterAdm />} />
        <Route path="/select" element={<Select />} />
        <Route path="/sesc" element={<Sesc />} />
        <Route path="/menu/senac" element={<Senac />} />
        <Route path="/sesc" element={<Sesc/>} />
        <Route path="/salgados" element={<Salgados/>} />
        <Route path="/doces" element={<Doces/>} />
        <Route path="/bebidas" element={<Bebidas />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/pagamento" element={<Pagamento />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />

        <Route path="/senac" element={<Senac/>} />
        <Route path="/salgado" element={<Salgado/>} />
        <Route path="/doce" element={<Doce/>} />
        <Route path="/bebida" element={<Bebida />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/selecione" element={<Selecione />} />
      </Routes>
    </BrowserRouter>
  );
}
