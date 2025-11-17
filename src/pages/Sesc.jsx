import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Menu() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-800 p-9">
      {/* Topo com voltar e carrinho */}
      <div className="w-full flex justify-between items-center">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-12" />
        </button>

      </div>

      <h1 className="text-xl font-semibold text-blue-700 mt-4">Cardápio - SESC</h1>

      <div className="mt-6 flex flex-col space-y-4 w-64">
        <button
          onClick={() => navigate("/salgados")}
          className="bg-blue-700 text-white py-5 rounded-lg font-semibold hover:bg-blue-800 transition"
        >
          Salgados
        </button>
        <button
          onClick={() => navigate("/doces")}
          className="bg-blue-700 text-white py-5 rounded-lg font-semibold hover:bg-blue-800 transition"
        >
          Doces
        </button>
        <button
          onClick={() => navigate("/bebidas")}
          className="bg-blue-700 text-white py-5 rounded-lg font-semibold hover:bg-blue-800 transition"
        >
          Bebidas
        </button>
      </div>
    </div>
  );
}