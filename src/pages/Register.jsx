import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../supabase/supabase"; // ajuste caminho

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirm) {
      alert("Preencha todos os campos!");
      return;
    }

    if (password !== confirm) {
      alert("As senhas não coincidem!");
      return;
    }

    setLoading(true);

    // 1️⃣ Criar usuário no Supabase Auth usando METADADOS
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "usuario", // dado salvo no próprio Auth
          criadoEm: new Date().toISOString(),
        },
      },
    });

    if (error) {
      alert("Erro ao criar conta: " + error.message);
      console.log(error);
      setLoading(false);
      return;
    }

    setLoading(false);
    alert("Conta criada com sucesso!");

    // 2️⃣ Redirecionar para login
    navigate("/loginuser");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">

      {/* Logos */}
      <div className="absolute top-8 left-0 right-0 px-10 flex items-start justify-between">
        {/* Coluna esquerda: logo Sesc com seta abaixo */}
        <div className="flex flex-col items-center">
          <img src="./src/assets/sesc.png" alt="Sesc" className="w-40" />
          <button onClick={() => navigate("/cadastro")} className="text-black mt-3">
            <ArrowLeft size={40} />
          </button>
        </div>

        {/* Logo Senac à direita */}
        <img src="./src/assets/senac.png" alt="Senac" className="w-40" />
      </div>

      {/* Formulário */}
      <div className="flex flex-col items-center w-full max-w-lg bg-white p-10 rounded-2xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-semibold text-blue-800 mb-10">
          Criar Conta
        </h1>

        <form onSubmit={handleRegister} className="flex flex-col w-full space-y-6">

          <div>
            <label className="text-blue-800 text-lg font-semibold">Email</label>
            <input
              type="email"
              className="w-full bg-blue-700 text-white rounded-lg px-4 py-3 mt-2 text-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-blue-800 text-lg font-semibold">Senha</label>
            <input
              type="password"
              className="w-full bg-blue-700 text-white rounded-lg px-4 py-3 mt-2 text-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-blue-800 text-lg font-semibold">
              Confirmar Senha
            </label>
            <input
              type="password"
              className="w-full bg-blue-700 text-white rounded-lg px-4 py-3 mt-2 text-lg"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 text-black font-semibold rounded-lg py-3 text-lg hover:bg-yellow-500"
          >
            {loading ? "Criando..." : "Criar"}
          </button>

        </form>
      </div>
    </div>
  );
}
