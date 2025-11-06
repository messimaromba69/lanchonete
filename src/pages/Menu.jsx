import { useNavigate, useParams } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();
  const { unidade } = useParams(); // pega 'sesc' ou 'senac'

  // Definindo cores e logo sem classes dinâmicas
  const logo = unidade === "sesc" ? sescLogo : senacLogo;
  const titleColor = unidade === "sesc" ? "text-blue-700" : "text-orange-500";
  const buttonColor = unidade === "sesc" ? "bg-blue-700" : "bg-orange-500";

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-800 p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 border px-3 py-1 rounded hover:bg-gray-100"
      >
        Voltar
      </button>

      <img src={logo} alt={unidade.toUpperCase()} className="w-28 mb-4" />

      <h1 className={`text-xl font-semibold mb-6 ${titleColor}`}>Cardápio</h1>

      <div className="flex flex-col space-y-4 w-64">
        <button className={`${buttonColor} text-white py-3 rounded-lg font-semibold`}>
          Salgados
        </button>
        <button className={`${buttonColor} text-white py-3 rounded-lg font-semibold`}>
          Doces
        </button>
        <button className={`${buttonColor} text-white py-3 rounded-lg font-semibold`}>
          Bebidas
        </button>
      </div>
    </div>
  );
}
