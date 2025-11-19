import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../supabase/supabase";

export default function LoginUser() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Preencha email e senha!");
      return;
    }

    // 🔥 Login via Supabase AUTH
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Email ou senha incorretos!");
      return;
    }

    const user = data.user;

    if (!user) {
      alert("Erro inesperado ao buscar usuário!");
      return;
    }

    // 🔎 PEGAR ROLE DOS METADADOS
    const role = user.user_metadata?.role;

    if (!role) {
      alert("Usuário sem permissão definida! Contate o suporte.");
      return;
    }

    // 🚫 Impedir admin de logar aqui
    if (role === "admin") {
      alert("Admins devem usar o login administrativo!");
      return;
    }

    alert("Login realizado com sucesso!");
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
        onClick={() => navigate("/select")}
          type="submit"
          className="bg-yellow-400 text-black font-bold rounded-lg px-10 py-4 w-1/2 text-2xl"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
