import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "../hooks/use-toast";
import SescLogo from "../assets/sesc.png";
import SenacLogo from "../assets/senac.png";

export default function LoginAdm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const admin = {
      email: "admin@gmail.com",
      password: "123456",
    };

    // 🔹 SOMENTE entra se email e senha forem corretos
    if (email === admin.email && password === admin.password) {
      toast({ title: "Bem-vindo, Administrador!" });
      navigate("/selecionarAdm"); // 👉 VAI PARA A PÁGINA SELECIONE
    } else {
      toast({
        title: "Somente administradores podem acessar aqui!",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
      <div className="absolute top-8 left-0 right-0 px-10 flex items-start justify-between">
        {/* Coluna esquerda: logo Sesc com seta abaixo */}
        <div className="flex flex-col items-center">
          <img src={SescLogo} alt="Sesc" className="w-40" />
          <button
            onClick={() => navigate("/")}
            className="text-black mt-3"
          >
            <ArrowLeft size={40} />
          </button>
        </div>

        {/* Logo Senac à direita */}
        <img src={SenacLogo} alt="Senac" className="w-40" />
      </div>
      <h1 className="text-4xl font-bold text-blue-800 mb-10">
        Login Administrativo
      </h1>

      <form
        onSubmit={handleLogin}
        className="flex flex-col items-center w-[80%] max-w-3xl space-y-8"
      >
        <div className="w-full">
          <label className="text-blue-800 text-xl font-semibold">Email</label>
          <input
            type="email"
            className="w-full bg-blue-700 text-white rounded-lg px-6 py-4 mt-2 text-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="w-full">
          <label className="text-blue-800 text-xl font-semibold">Senha</label>
          <input
            type="password"
            className="w-full bg-blue-700 text-white rounded-lg px-6 py-4 mt-2 text-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* 🔹 NÃO USE onClick AQUI! Isso quebrava o login */}
        <button
          type="submit"
          className="bg-yellow-400 text-black font-bold rounded-lg px-10 py-4 w-1/2 text-2xl"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
