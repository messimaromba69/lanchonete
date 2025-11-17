import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function LoginUser() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      alert("Email ou senha incorretos!");
      return;
    }

    // Bloqueia admins aqui
    if (user.type === "admin") {
      alert("Administradores devem usar o LOGIN ADMINISTRATIVO!");
      return;
    }

    alert(`Bem-vindo, ${user.email}!`);
    navigate("/usuario");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">

      {/* Logos */}
      <div className="absolute top-8 w-full flex justify-between px-10">
        <img src="./src/assets/sesc.png" alt="Sesc" className="w-40" />
        <img src="./src/assets/senac.png" alt="Senac" className="w-40" />
      </div>



      <h1 className="text-4xl font-bold text-blue-800 mb-10">
        Login do Usuário
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
