import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "../hooks/use-toast";

export default function RegisterAdm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    const admins = JSON.parse(localStorage.getItem("admins")) || [];

    // Verifica se o email já existe
    if (admins.some((a) => a.email === email)) {
      toast({ title: "Este email já está registrado como administrador!", variant: "destructive" });
      return;
    }

    const newAdmin = {
      name,
      email,
      password,
      role: "admin",
    };

    admins.push(newAdmin);
    localStorage.setItem("admins", JSON.stringify(admins));

    toast({ title: "Administrador criado com sucesso!" });
    navigate("/loginAdm");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">

      {/* Logos no topo */}
      <div className="absolute top-8 w-full flex justify-between px-10">
        <img src="../src/assets/sesc.png" alt="Sesc" className="w-40" />
        <img src="../src/assets/senac.png" alt="Senac" className="w-40" />
      </div>

      {/* Botão Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 text-black hover:text-gray-700"
      >
        <ArrowLeft size={38} />
      </button>

      {/* Título */}
      <h1 className="text-4xl font-bold text-blue-800 mb-10">
        Criar Administrador
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleRegister}
        className="flex flex-col items-center w-[80%] max-w-3xl space-y-8"
      >
        <div className="w-full">
          <label className="block text-blue-800 font-semibold mb-2 text-xl">
            Nome Completo
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-blue-700 text-white rounded-lg px-6 py-4 text-xl focus:outline-none focus:ring-2"
          />
        </div>

        <div className="w-full">
          <label className="block text-blue-800 font-semibold mb-2 text-xl">
            Email do Administrador
          </label>
          <input
            type="email"
            required
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
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-blue-700 text-white rounded-lg px-6 py-4 text-xl focus:outline-none focus:ring-2"
          />
        </div>

        <button
          type="submit"
          className="bg-yellow-400 text-black font-bold rounded-lg px-10 py-4 w-1/2 text-2xl hover:bg-yellow-500 transition"
        >
          Criar Administrador
        </button>
      </form>
    </div>
  );
}
