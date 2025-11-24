import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

export default function Menu() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 p-4 relative">
      {/* ÍCONE DE PERFIL (à esquerda do carrinho) */}
      <button
        onClick={() => navigate("/profile")}
        className="absolute top-4 right-20 p-2 rounded-lg z-40 bg-white/90 shadow-sm"
        aria-label="Perfil"
      >
        <FaUserCircle size={32} className="text-blue-600" />
      </button>

      {/* ÍCONE DO CARRINHO (canto direito superior) */}
      <button
        onClick={() => navigate("/cart")}
        className="absolute top-4 right-6 p-2 rounded-lg z-50 bg-white/90 shadow-sm"
        aria-label="Abrir carrinho"
      >
        <FaShoppingCart size={32} className="text-blue-600" />
      </button>

      {/* Conteúdo centralizado */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <h1 className="text-3xl font-semibold text-orange-500 text-center mt-4">
          Cardápio -{" "}
          <span className="text-4xl font-extrabold uppercase">SENAC</span>
        </h1>

        <div className="mt-6 flex flex-col space-y-4 w-[420px]">
          <button
            onClick={() => navigate("/salgado")}
            className="bg-orange-500 text-white py-6 rounded-2xl text-2xl font-semibold hover:bg-orange-600 transition w-full"
          >
            Salgados
          </button>

          <button
            onClick={() => navigate("/doce")}
            className="bg-orange-500 text-white py-6 rounded-2xl text-2xl font-semibold hover:bg-orange-600 transition w-full"
          >
            Doces
          </button>

          <button
            onClick={() => navigate("/bebida")}
            className="bg-orange-500 text-white py-6 rounded-2xl text-2xl font-semibold hover:bg-orange-600 transition w-full"
          >
            Bebidas
          </button>

          <button
            onClick={() => navigate("/select")}
            className="bg-yellow-500 text-white py-3 rounded-2xl text-lg font-semibold hover:bg-yellow-400 transition w-full"
          >
            Sair do Cardápio
          </button>
        </div>
      </div>
    </div>
  );
}