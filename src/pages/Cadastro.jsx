import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Lanchonete() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center text-gray-800 relative">
      {/* Logos no topo */}
      <div className="absolute top-8 left-0 right-0 px-10 flex items-start justify-between">
        {/* Coluna esquerda: logo Sesc com seta abaixo */}
        <div className="flex flex-col items-center">
          <img src="./src/assets/sesc.png" alt="Sesc" className="w-40" />
          <button onClick={() => navigate("/")} className="text-black mt-3">
            <ArrowLeft size={40} />
          </button>
        </div>

        {/* Logo Senac à direita */}
        <img src="./src/assets/senac.png" alt="Senac" className="w-40" />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-7xl font-semibold text-blue-700">Lanchonete</h1>
        <h1 className="text-7xl font-semibold text-blue-700">Sesc e Senac</h1>

        <button
          onClick={() => navigate("/loginUser")}
          className="bg-blue-700 text-xl text-white px-14 py-5 rounded-xl font-medium hover:bg-blue-800 transition"
        >
          Entrar em sua conta
        </button>

        <button
          onClick={() => navigate("/register")}
          className=" text-blue-700 hover:underline"
        >
          Não tem conta? Crie uma
        </button>
      </div>
    </div>
  );
}
