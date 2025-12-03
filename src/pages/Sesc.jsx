import { useLocation, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

import fundoSesc from "./assets/sesc.png";

export default function CardapioSesc() {
  const navigate = useNavigate();
  const location = useLocation();

  const { itensSelecionados = [], quantidades = {} } = location.state || {};
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-slate-100 p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="relative px-8 py-8">
          {/* top icons */}
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-6">
              <img src={fundoSesc} alt="Sesc" className="w-28 md:w-32" />
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-sky-700">Cardápio</h2>
              <div className="text-base md:text-lg text-slate-500">SESC</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate("/carrinho", { state: { itensSelecionados, quantidades } })
                }
                className="p-2 rounded-lg hover:bg-slate-100"
                aria-label="Carrinho"
              >
                <FaShoppingCart size={36} className="text-sky-700" />
              </button>

              <button onClick={() => navigate("/profile")} className="p-2 rounded-lg hover:bg-slate-100">
                <FaUserCircle size={36} className="text-sky-700" />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-500 mb-4">Escolha a categoria para ver os itens disponíveis no Sesc.</p>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => navigate("/salgados", { state: { itensSelecionados, quantidades } })}
                className="w-full rounded-2xl py-4 text-xl font-semibold text-white bg-gradient-to-r from-blue-700 to-sky-600 shadow-md hover:scale-[1.02] transform transition"
              >
                Salgados
              </button>

              <button
                onClick={() => navigate("/doces", { state: { itensSelecionados, quantidades } })}
                className="w-full rounded-2xl py-4 text-xl font-semibold text-white bg-gradient-to-r from-blue-700 to-sky-600 shadow-md hover:scale-[1.02] transform transition"
              >
                Doces
              </button>

              <button
                onClick={() => navigate("/bebidas", { state: { itensSelecionados, quantidades } })}
                className="w-full rounded-2xl py-4 text-xl font-semibold text-white bg-gradient-to-r from-blue-700 to-sky-600 shadow-md hover:scale-[1.02] transform transition"
              >
                Bebidas
              </button>

              <button
                onClick={() => navigate("/select")}
                className="w-full rounded-2xl py-3 text-lg font-semibold text-white bg-yellow-500 shadow-sm hover:bg-yellow-400 transition"
              >
                Sair do Cardápio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
