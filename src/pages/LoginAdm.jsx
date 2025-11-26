import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginAdmin() {
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
      alert("Bem-vindo, Administrador!");
      navigate("/selecione");  // 👉 VAI PARA A PÁGINA SELECIONE
    } else {
      alert("Somente administradores podem acessar aqui!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
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
