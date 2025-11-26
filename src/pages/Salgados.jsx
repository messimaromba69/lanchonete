import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FaShoppingCart } from "react-icons/fa";
import { supabase } from "../../supabase/supabase";
import fundoSesc from "./assets/sesc.png";

export default function SalgadosSesc() {
  const navigate = useNavigate();
  const STORAGE_KEY = "carrinhoSesc";

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantidades, setQuantidades] = useState([]);

  // Busca produtos da tabela "produto" com tipo "salgado"
  useEffect(() => {
    async function fetchProdutos() {
      setLoading(true);
      const { data, error } = await supabase
        .from("produto")
        .select("*")
        .eq("tipo_produto", "salgado");

      if (error) {
        console.log("Erro ao buscar produtos:", error.message);
      } else {
        setProdutos(data);

        // Puxa carrinho salvo
        const carrinho = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

        // Carrega quantidades já salvas
        const iniciais = data.map((p) => {
          const item = carrinho.find((c) => c.id_produto === p.id_produto);
          return item ? item.quantidade : 0;
        });

        setQuantidades(iniciais);
      }
      setLoading(false);
    }
    fetchProdutos();
  }, []);

  const alterarQuantidade = (index, delta) => {
    const novas = [...quantidades];
    novas[index] = Math.max(0, (novas[index] || 0) + delta);
    setQuantidades(novas);
  };

  const irParaCarrinho = () => {
    const carrinhoAtual = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    const novosItens = produtos
      .map((p, i) => ({
        id_produto: p.id_produto,
        nome_produto: p.nome_produto,
        preco: p.preco,
        imagem: p.imagem,
        quantidade: quantidades[i],
      }))
      .filter((p) => p.quantidade > 0);

    // Evita duplicação de itens
    const idsNovos = novosItens.map((i) => i.id_produto);
    const filtrado = carrinhoAtual.filter(
      (i) => !idsNovos.includes(i.id_produto)
    );

    const resultado = [...filtrado, ...novosItens];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resultado));

    alert("Itens adicionados ao carrinho!");
    navigate("/carrinho");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-800 p-4">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-4 max-w-2xl">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>

        <img src={fundoSesc} alt="Logo Sesc" className="h-20 object-contain" />

        <button onClick={() => navigate("/carrinho")}>
          <FaShoppingCart size={30} className="text-blue-600" />
        </button>
      </div>

      <h1 className="text-xl font-semibold text-blue-700 mt-4">
        Opções de Salgados
      </h1>

      {loading ? (
        <div className="mt-10 text-center text-blue-700">Carregando...</div>
      ) : (
        <div className="w-full max-w-md mt-6 space-y-3">
          {produtos.map((p, i) => (
            <div
              key={p.id_produto}
              className="flex items-center justify-between bg-blue-700 text-white rounded-lg p-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.imagem}
                  alt={p.nome_produto}
                  className="w-12 h-12 rounded"
                />
                <div>
                  <div className="font-medium">{p.nome_produto}</div>
                  <div className="text-sm">R$ {p.preco.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alterarQuantidade(i, -1)}
                  className="px-2 bg-blue-600 rounded"
                >
                  -
                </button>
                <span>{quantidades[i]}</span>
                <button
                  onClick={() => alterarQuantidade(i, 1)}
                  className="px-2 bg-blue-600 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={irParaCarrinho}
        className="bg-yellow-400 text-black font-semibold py-2 px-6 rounded-lg mt-6"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}
