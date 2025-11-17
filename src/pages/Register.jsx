import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (!email || !password || !confirm) {
      alert("Preencha todos os campos!");
      return;
    }

    if (password !== confirm) {
      alert("As senhas não coincidem!");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some((user) => user.email === email)) {
      alert("Este e-mail já está cadastrado!");
      return;
    }

    // Salva como usuário normal
    users.push({ email, password, type: "usuario" });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Conta criada com sucesso!");
    navigate("/loginuser");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">

      {/* Logos */}
      <div className="absolute top-8 w-full flex justify-between px-10">
        <img src="./src/assets/sesc.png" alt="Sesc" className="w-40" />
        <img src="./src/assets/senac.png" alt="Senac" className="w-40" />
      </div>


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
            className="bg-yellow-400 text-black font-semibold rounded-lg py-3 text-lg hover:bg-yellow-500"
          >
            Criar
          </button>
        </form>
      </div>
    </div>
  );
}
