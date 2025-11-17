import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SescCart() {
  const navigate = useNavigate();
  const STORAGE_KEY = "carrinhoSesc";

  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setItems(saved);
  }, []);

  const changeQty = (index, delta) => {
    const copy = [...items];
    copy[index].quantidade = Math.max(0, (copy[index].quantidade || 0) + delta);
    setItems(copy);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
  };

  const removeItem = (index) => {
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
  };

  const total = items.reduce((s, it) => s + (it.preco || 0) * (it.quantidade || 0), 0);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-black">
          <ArrowLeft size={28} />
        </button>

        <button onClick={() => navigate("/profile")} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">👤</div>
          <ShoppingCart size={20} />
        </button>
      </div>

      <h2 className="text-center text-blue-700 text-xl font-semibold mt-4">Carrinho</h2>

      <div className="max-w-2xl mx-auto mt-6 space-y-3">
        {items.length === 0 && <p className="text-center text-gray-600">Carrinho vazio</p>}

        {items.map((p, i) => (
          <div key={i} className="flex items-center justify-between bg-blue-700 text-white rounded-lg p-2">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-medium">{p.nome}</div>
                <div className="text-sm">R$ {Number(p.preco).toFixed(2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => changeQty(i, -1)} className="px-2 bg-blue-600 rounded">-</button>
              <div className="px-2">{p.quantidade || 0}</div>
              <button onClick={() => changeQty(i, 1)} className="px-2 bg-blue-600 rounded">+</button>
              <button onClick={() => removeItem(i)} className="ml-2 text-sm bg-white text-blue-700 px-2 py-1 rounded">Remover</button>
            </div>
          </div>
        ))}

        {items.length > 0 && (
          <>
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
              <div className="font-medium">Total</div>
              <div className="font-bold">R$ {total.toFixed(2)}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/sesc")}
                className="flex-1 bg-blue-700 text-white py-2 rounded font-semibold"
              >
                Continuar comprando
              </button>

              <button
                onClick={() => navigate("/pagamento")}
                className="flex-1 bg-yellow-400 text-black py-2 rounded font-semibold"
              >
                Finalizar compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
