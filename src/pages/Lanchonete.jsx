import { useNavigate } from "react-router-dom";
import fundoSesc from "./assets/sesc.png";
import fundoSenac from "./assets/senac.png";

export default function LanchoneteSelecao() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center text-gray-800 relative p-6">

      {/* Logos no topo */}
      <div className="absolute top-8 left-0 right-0 px-10 flex items-start justify-between">
        
        {/* Coluna esquerda: logo Sesc */}
        <div className="flex flex-col items-center">
          <img src={fundoSesc} alt="Sesc" className="w-40" />
        </div>

        {/* Logo Senac à direita */}
        <img src={fundoSenac} alt="Senac" className="w-40" />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col items-center space-y-8 mt-32">
        <h1 className="text-6xl md:text-7xl font-extrabold text-blue-700 tracking-wide">
          Lanchonete
        </h1>

        <h2 className="text-3xl md:text-4xl font-semibold text-slate-600">
          Sesc e Senac
        </h2>

        <h3 className="text-xl md:text-2xl font-medium text-slate-500 mt-4">
          Selecione seu Perfil
        </h3>

        <div className="flex flex-col md:flex-row gap-6 mt-6">
          <button
            onClick={() => navigate("/loginAdm")}
            className="bg-blue-700 text-white text-xl px-10 py-5 rounded-2xl font-semibold 
            hover:bg-blue-800 transition shadow-lg"
          >
            Administrativo
          </button>

          <button
            onClick={() => navigate("/cadastro")}
            className="bg-white border border-slate-300 text-slate-900 text-xl px-10 py-5 
            rounded-2xl font-semibold hover:shadow-lg transition"
          >
            Usuário
          </button>
        </div>
      </div>
    </div>
  );
}
