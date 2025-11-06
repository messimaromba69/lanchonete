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

    users.push({ email, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Conta criada com sucesso!");
    navigate("/login");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
      {/* Botão de voltar */}
            <div className="absolute top-8 w-full flex justify-between px-10">
        <img src="./src/assets/sesc.png" alt="Sesc" className="w-40" />
        <img src="./src/assets/senac.png" alt="Senac" className="w-40" />
      </div>
            <div className=" flex items-end justify-between w-[90%] max-w-8xl mb-30">
        <button
          onClick={() => navigate(-1)}
          className="absolute  text-black hover:text-gray-700"
        >
          <ArrowLeft size={38} />
        </button>
        
      </div>

      {/* Cabeçalho com logos */}


      {/* Formulário central */}
      <div className="flex flex-col items-center w-full max-w-lg bg-white p-10 rounded-2xl shadow-lg border border-gray-200 mb-2">
        <h1 className="text-3xl font-semibold text-blue-800 mb-10">
          Criar Conta
        </h1>

        <form
          onSubmit={handleRegister}
          className="flex flex-col w-full space-y-6"
        >
          <div>
            <label className="block text-blue-800 font-medium mb-2 text-lg">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-blue-700 text-white rounded-lg px-4 py-3  text-lg focus:outline-none "

            />
          </div>

          <div>
            <label className="block text-blue-800 font-medium mb-2 text-lg ">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-blue-700 text-white rounded-lg px-4 py-3  text-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-blue-800 font-medium mb-2 text-lg">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-blue-700 text-white rounded-lg px-4 py-3  text-lg focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-yellow-400 text-black font-semibold rounded-lg py-3 text-lg hover:bg-yellow-500 transition"
          >
            Criar
          </button>
        </form>
      </div>
    </div>
  );
}
