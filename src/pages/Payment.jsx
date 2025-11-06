import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SenacPayment() {
  const navigate = useNavigate();
  const STORAGE_KEY = "carrinhoSenac";

  const handlePay = (method) => {
    localStorage.removeItem(STORAGE_KEY);
    alert(`Pagamento por ${method} realizado! Obrigado.`);
    navigate("/senac");
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-black">
          <ArrowLeft size={28} />
        </button>

        <div style={{ width: 36 }} />
      </div>

      <h2 className="text-center text-orange-600 text-xl font-semibold mt-4">Pagamento</h2>

      <div className="max-w-md mx-auto mt-6 space-y-4">
        <button onClick={() => handlePay("PIX")} className="w-full bg-yellow-400 py-3 rounded font-semibold">pix</button>
        <button onClick={() => handlePay("cartão")} className="w-full bg-yellow-400 py-3 rounded font-semibold">cartao</button>
        <button onClick={() => handlePay("dinheiro")} className="w-full bg-yellow-400 py-3 rounded font-semibold">dinheiro</button>

        <button onClick={() => navigate("/cart")} className="w-full bg-blue-700 text-white py-3 rounded font-semibold">Voltar ao carrinho</button>
      </div>
    </div>
  );
}
