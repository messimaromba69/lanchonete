import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FaShoppingCart } from "react-icons/fa";
import { supabase } from "../../supabase/supabase";
import fundoSenac from "./assets/senac.png";
import { toast } from "../hooks/use-toast";

export default function SalgadosSenac() {
  const navigate = useNavigate();
  const STORAGE_KEY = "carrinhoSenac";

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

    if (novosItens.length === 0) {
      toast({ title: "não tem nada em seu carrinho", variant: "destructive" });
      return;
    }

    const resultado = [...filtrado, ...novosItens];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resultado));

    toast({ title: "Itens adicionados ao carrinho" });
    navigate("/cart");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-800 p-4 pt-2">
      {/* Header */}
      {/* Tornei o header full-width e removi o max-w para que logo fique à esquerda e carrinho à direita */}
      <div className="w-full flex items-center justify-between mb-2 px-4">
        <div className="flex flex-col items-center">
          <img
            src={fundoSenac}
            alt="Logo Senac"
            className="w-40 h-32 object-contain"
          />

          <button
            onClick={() => navigate("/senac")}
            className="text-black mt-3"
            aria-label="Voltar"
          >
            <ArrowLeft size={40} />
          </button>
        </div>

        <div className="flex items-center justify-end">
          <button onClick={() => navigate("/cart")} className="p-1">
            <FaShoppingCart size={44} className="text-orange-500" />
          </button>
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-orange-600 mt-2 text-center mb-6">
        Opções de Salgados
      </h1>

      {loading ? (
        <div className="mt-10 text-center text-orange-600">Carregando...</div>
      ) : (
        <div className="w-full max-w-md mt-0 space-y-3 mx-auto">
          {produtos.map((p, i) => (
            <div
              key={p.id_produto}
              className="flex items-center justify-between bg-orange-600 text-white rounded-lg p-2"
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
                  className="px-3 py-1 bg-orange-500 rounded"
                >
                  -
                </button>
                <span className="w-6 text-center">{quantidades[i]}</span>
                <button
                  onClick={() => alterarQuantidade(i, 1)}
                  className="px-3 py-1 bg-orange-500 rounded"
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
        className="bg-yellow-400 text-black font-semibold py-3 px-8 rounded-lg mt-6 text-lg"
      >
        Adicionar ao carrinho
      </button>
    </div>
  );
}
