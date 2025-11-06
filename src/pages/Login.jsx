import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      alert(`Bem-vindo, ${user.name || "usuário"}!`);
      navigate("/select");
    } else {
      alert("E-mail ou senha incorretos!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
      {/* Cabeçalho */}
      <div className="absolute top-8 w-full flex justify-between px-10">
        <img src="./src/assets/sesc.png" alt="Sesc" className="w-40" />
        <img src="./src/assets/senac.png" alt="Senac" className="w-40" />
      </div>
      
      <div className=" flex items-end justify-between w-[90%] max-w-8xl mb-30">
        <button
          onClick={() => navigate(-1)}
          className="absolute -translate-y-12 text-black hover:text-gray-700"
        >
          <ArrowLeft size={38} />
        </button>
        
      </div>

      {/* Título */}
      <h1 className="text-4xl font-bold text-blue-800 mb-10">
        Entrar na Conta
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleLogin}
        className="flex flex-col items-center w-[80%] max-w-3xl space-y-8"
      >
        <div className="w-full">
          <label className="block text-blue-800 font-semibold mb-2 text-xl">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-blue-700 text-white rounded-lg px-6 py-4 text-xl focus:outline-none focus:ring-2"
          />
        </div>

        <div className="w-full">
          <label className="block text-blue-800 font-semibold mb-2 text-xl">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-blue-700 text-white rounded-lg px-6 py-4 text-xl focus:outline-none focus:ring-2"
          />
        </div>

        <button
          type="submit"
          className="bg-yellow-400 text-black font-bold rounded-lg px-10 py-4 w-1/2 text-2xl hover:bg-yellow-500 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
