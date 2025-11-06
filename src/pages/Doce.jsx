import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Doces() {
  const navigate = useNavigate();

  const produtos = [
    { nome: "Bolo", preco: 6.25, img: "" },
    { nome: "Salada de Frutas", preco: 5.5, img: "" },
  ];

  const [quantidades, setQuantidades] = useState(produtos.map(() => 0));

  const handleAdd = (index, delta) => {
    const novas = [...quantidades];
    novas[index] = Math.max(0, novas[index] + delta);
    setQuantidades(novas);
  };

  const handleCarrinho = () => {
    const carrinho = produtos
      .map((p, i) => ({ ...p, quantidade: quantidades[i] }))
      .filter(p => p.quantidade > 0);

    localStorage.setItem("carrinhoSenac", JSON.stringify(carrinho));
    alert("Itens adicionados ao carrinho!");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-800 p-4">
      <div className="w-full flex justify-between items-center">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="w-6 h-6" />
      </div>

      <h1 className="text-xl font-semibold text-blue-700 mt-4">Opções de Doces</h1>

      <div className="w-full max-w-md mt-6 space-y-3">
        {produtos.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-blue-700 text-white rounded-lg p-2"
          >
            <div className="flex items-center gap-3">
              <img src={p.img} alt={p.nome} className="w-10 h-10 rounded" />
              <span>{`${p.nome} (R$${p.preco.toFixed(2)})`}</span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handleAdd(i, -1)} className="px-2 bg-blue-600 rounded">-</button>
              <span>{quantidades[i]}</span>
              <button onClick={() => handleAdd(i, 1)} className="px-2 bg-blue-600 rounded">+</button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleCarrinho}
        className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg mt-6 hover:bg-yellow-500 transition"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}
