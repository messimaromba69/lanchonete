import { useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

import fundoSenac from "./assets/senac.png";

export default function CardapioSenac() {
  const navigate = useNavigate();
  const location = useLocation();

  const { itensSelecionados = [], quantidades = {} } = location.state || {};

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 p-9 relative">

      {/* ÍCONE DE PERFIL */}
      <button
        onClick={() => navigate("/profile")}
        className="absolute top-6 right-20 p-2 rounded-lg z-40"
        aria-label="Perfil"
      >
        <FaUserCircle size={40} className="text-orange-500" />
      </button>

      {/* ÍCONE DO CARRINHO */}
      <button
        onClick={() =>
          navigate("/cart", {
            state: { itensSelecionados, quantidades },
          })
        }
        className="absolute top-6 right-6 p-2 rounded-lg z-50"
        aria-label="Carrinho"
      >
        <FaShoppingCart size={36} className="text-orange-500" />
      </button>

      {/* LOGO */}
      <div className="flex justify-center mt-4">
        <img
          src={fundoSenac}
          alt="Senac"
          className="w-40 h-32 object-contain"
        />
      </div>

      {/* TÍTULO */}
      <h1 className="text-3xl font-semibold text-orange-600 text-center mt-4">
        Cardápio - <span className="text-4xl font-extrabold uppercase">SENAC</span>
      </h1>

      {/* BOTÕES */}
      <div className="mt-10 flex flex-col space-y-5 w-[420px] mx-auto">

        <button
          onClick={() =>
            navigate("/salgado", {
              state: { itensSelecionados, quantidades },
            })
          }
          className="bg-orange-600 text-white py-6 rounded-2xl text-2xl font-semibold hover:bg-orange-700 transition"
        >
          Salgados
        </button>

        <button
          onClick={() =>
            navigate("/doce", {
              state: { itensSelecionados, quantidades },
            })
          }
          className="bg-orange-600 text-white py-6 rounded-2xl text-2xl font-semibold hover:bg-orange-700 transition"
        >
          Doces
        </button>

        <button
          onClick={() =>
            navigate("/bebida", {
              state: { itensSelecionados, quantidades },
            })
          }
          className="bg-orange-600 text-white py-6 rounded-2xl text-2xl font-semibold hover:bg-orange-700 transition"
        >
          Bebidas
        </button>

        <button
          onClick={() => navigate("/select")}
          className="bg-yellow-500 text-white py-4 rounded-2xl text-lg font-semibold hover:bg-yellow-400 transition"
        >
          Sair do Cardápio
        </button>
      </div>
    </div>
  );
}
