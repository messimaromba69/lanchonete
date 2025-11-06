import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Menu() {
  const navigate = useNavigate();

 return (
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-800 p-4">
      {/* Topo com voltar e carrinho */}
      <div className="w-full flex justify-between items-center">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button onClick={() => navigate("/carrinho")}>
          <ShoppingCart className="w-6 h-6 text-orange-500 hover:text-orange-700 transition" />
        </button>
      </div>

      <h1 className="text-xl font-semibold text-orange-500 mt-4">Cardápio - SENAC</h1>

      <div className="mt-6 flex flex-col space-y-4 w-64">
        <button
          onClick={() => navigate("/salgado")}
          className="bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Salgados
        </button>
        <button
          onClick={() => navigate("/doce")}
          className="bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Doces
        </button>
        <button
          onClick={() => navigate("/bebida")}
          className="bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Bebidas
        </button>
      </div>
    </div>
  );
}