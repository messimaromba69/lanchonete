import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function SescPayment() {
  const navigate = useNavigate();
  const STORAGE_KEY = "carrinhoSesc";

  const [total, setTotal] = useState(0);

  // Carrega o total do carrinho
  useEffect(() => {
    const carrinho = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const soma = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    setTotal(soma);
  }, []);

  const handlePay = (method) => {
    // Mensagem unificada
    alert(
      `Pagamento por ${method} realizado com sucesso!\nDirija-se ao balcão para pagar.`
    );

    // Limpa o carrinho
    localStorage.removeItem(STORAGE_KEY);

    // Volta para o cardápio
    navigate("/sesc");
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-black">
          <ArrowLeft size={28} />
        </button>

        <div style={{ width: 36 }} />
      </div>

      <h2 className="text-center text-blue-700 text-xl font-semibold mt-4">
        Pagamento
      </h2>

      {/* TOTAL DO PEDIDO */}
      <p className="text-center text-lg font-semibold text-gray-800 mt-4">
        Total: <span className="text-blue-700">R$ {total.toFixed(2)}</span>
      </p>

      <div className="max-w-md mx-auto mt-6 space-y-4">
        <button
          onClick={() => handlePay("PIX")}
          className="w-full bg-yellow-400 py-3 rounded font-semibold"
        >
          PIX
        </button>

        <button
          onClick={() => handlePay("cartão")}
          className="w-full bg-yellow-400 py-3 rounded font-semibold"
        >
          Cartão
        </button>

        <button
          onClick={() => handlePay("dinheiro")}
          className="w-full bg-yellow-400 py-3 rounded font-semibold"
        >
          Dinheiro
        </button>

        <button
          onClick={() => navigate("/carrinho")}
          className="w-full bg-blue-700 text-white py-3 rounded font-semibold"
        >
          Voltar ao carrinho
        </button>
      </div>
    </div>
  );
}
