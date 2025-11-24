import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FaShoppingCart } from "react-icons/fa";

export default function Bebidas() {
  const navigate = useNavigate();

  const produtos = [
    { nome: "Achocolatado", preco: 4.0, img: "" },
    { nome: "Café com Leite", preco: 3.7, img: "" },
    { nome: "Suco Prats", preco: 7.0, img: "" },
    { nome: "Suco Lata", preco: 6.0, img: "" },
    { nome: "Chá Mate", preco: 6.0, img: "" },
    { nome: "Água Mineral", preco: 3.5, img: "" },
  ];

  const [quantidades, setQuantidades] = useState(produtos.map(() => 0));

  useEffect(() => {
    const carrinho = JSON.parse(localStorage.getItem("carrinhoSesc")) || [];
    const novas = produtos.map(p => {
      const item = carrinho.find(c => c.nome === p.nome);
      return item ? item.quantidade : 0;
    });
    setQuantidades(novas);
  }, []);

  const handleAdd = (index, delta) => {
    const novas = [...quantidades];
    novas[index] = Math.max(0, novas[index] + delta);
    setQuantidades(novas);
  };

  const handleCarrinho = () => {
    const carrinhoAtual = JSON.parse(localStorage.getItem("carrinhoSesc")) || [];

    const novosItens = produtos
      .map((p, i) => ({ ...p, quantidade: quantidades[i] }))
      .filter(p => p.quantidade > 0);

    const nomesNovos = novosItens.map(i => i.nome);
    const filtrado = carrinhoAtual.filter(i => !nomesNovos.includes(i.nome));

    const resultado = [...filtrado, ...novosItens];

    localStorage.setItem("carrinhoSesc", JSON.stringify(resultado));
    alert("Itens adicionados ao carrinho!");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-800 p-4">
      <div className="w-full flex justify-between items-center">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button onClick={() => navigate("/carrinho")}>
          <FaShoppingCart size={30} className="text-blue-600" />
        </button>
      </div>

      <h1 className="text-xl font-semibold text-blue-700 mt-4">Opções de Bebidas</h1>

      <div className="w-full max-w-md mt-6 space-y-3">
        {produtos.map((p, i) => (
          <div key={i} className="flex items-center justify-between bg-blue-700 text-white rounded-lg p-2">
            <span>{`${p.nome} (R$${p.preco.toFixed(2)})`}</span>
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
        className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg mt-6"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}
