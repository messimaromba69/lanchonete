import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import fundoSesc from "./assets/sesc.png"; // ajuste o caminho da imagem

export default function CarrinhoSesc() {
  const navigate = useNavigate();
  const STORAGE_KEY = "carrinhoSesc";

  const [itens, setItens] = useState([]);
  const [qtd, setQtd] = useState({});

  // Carrega itens do localStorage ao iniciar
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setItens(saved);
    const quantidades = saved.reduce((acc, item) => {
      acc[item.id] = item.quantidade || 0;
      return acc;
    }, {});
    setQtd(quantidades);
  }, []);

  // Atualiza localStorage sempre que itens ou quantidades mudam
  useEffect(() => {
    const updatedItems = itens.map(item => ({ ...item, quantidade: qtd[item.id] || 0 }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
  }, [itens, qtd]);

  const alterarQuantidade = (id, delta) => {
    setQtd(prev => {
      const novaQtd = Math.max((prev[id] || 0) + delta, 0);
      return { ...prev, [id]: novaQtd };
    });
  };

  const removeItem = (id) => {
    setItens(prev => prev.filter(item => item.id !== id));
    setQtd(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const total = itens.reduce((s, item) => s + (item.preco || 0) * (qtd[item.id] || 0), 0);

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-2xl mb-4">
        <button onClick={() => navigate(-1)} className="text-black">
          <ArrowLeft size={28} />
        </button>

        <img src={fundoSesc} alt="Logo Sesc" className="h-20 object-contain" />

        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
            👤
          </div>
        </button>
      </div>

      <h2 className="text-blue-700 text-2xl font-semibold mb-4">Carrinho</h2>

      {/* Lista de itens */}
      <div className="w-full max-w-2xl space-y-3">
        {itens.length === 0 && (
          <p className="text-center text-gray-600">Seu carrinho está vazio</p>
        )}

        {itens.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-blue-700 text-white rounded-lg p-3">
            <div className="flex items-center gap-3">
              <img src={item.imagem} alt={item.nome} className="w-12 h-12 rounded" />
              <div>
                <div className="font-medium">{item.nome}</div>
                <div className="text-sm">R$ {item.preco.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alterarQuantidade(item.id, -1)}
                className="px-2 bg-blue-600 rounded"
              >
                -
              </button>
              <div className="px-2">{qtd[item.id] || 0}</div>
              <button
                onClick={() => alterarQuantidade(item.id, 1)}
                className="px-2 bg-blue-600 rounded"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-2 text-sm bg-white text-blue-700 px-2 py-1 rounded"
              >
                Remover
              </button>
            </div>
          </div>
        ))}

        {/* Total e botões */}
        {itens.length > 0 && (
          <>
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded mt-3">
              <div className="font-medium">Total</div>
              <div className="font-bold">R$ {total.toFixed(2)}</div>
            </div>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => navigate("/sesc")}
                className="flex-1 bg-yellow-400 text-black py-2 rounded font-semibold"
              >
                Continuar comprando
              </button>

              <button
                onClick={() => {
                  if (itens.length === 0) {
                    alert("Seu carrinho está vazio!");
                    return;
                  }
                  navigate("/pagamento");
                }}
                className="flex-1 bg-blue-700 text-white py-2 rounded font-semibold"
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
