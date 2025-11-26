import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import fundoSesc from "./assets/sesc.png";
import { supabase } from "../../supabase/supabase";

export default function CarrinhoSesc() {
  const navigate = useNavigate();
  const STORAGE_KEY = "carrinhoSesc";

  const [itens, setItens] = useState([]);
  const [qtd, setQtd] = useState({});
  const [total, setTotal] = useState(0);

  // Carrega carrinho
  useEffect(() => {
    const carrinho = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setItens(carrinho);

    const objQtd = {};
    carrinho.forEach((item) => {
      objQtd[item.id_produto] = item.quantidade;
    });

    setQtd(objQtd);
  }, []);

  // Recalcula total
  useEffect(() => {
    const novoTotal = itens.reduce(
      (s, i) => s + i.preco * (qtd[i.id_produto] || 0),
      0
    );
    setTotal(novoTotal);
  }, [itens, qtd]);

  // Atualiza quantidade
  const alterarQuantidade = (id_produto, delta) => {
    setQtd((prev) => {
      const nova = {
        ...prev,
        [id_produto]: Math.max(0, (prev[id_produto] || 0) + delta),
      };

      const atualizado = itens.map((item) =>
        item.id_produto === id_produto
          ? { ...item, quantidade: nova[id_produto] }
          : item
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizado));
      setItens(atualizado);

      return nova;
    });
  };

  // Remove item do carrinho
  const removeItem = (id_produto) => {
    const filtrado = itens.filter((i) => i.id_produto !== id_produto);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrado));
    setItens(filtrado);

    const novoQtd = { ...qtd };
    delete novoQtd[id_produto];
    setQtd(novoQtd);
  };

  // Finaliza compra e envia para o Supabase
  const finalizarCompra = async () => {
    if (itens.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        alert("Você precisa estar logado!");
        return;
      }

      const itensPedido = itens
        .map((item) => ({
          id_produto: item.id_produto,
          nome_produto: item.nome_produto,
          quantidade: qtd[item.id_produto] || 0,
          preco: item.preco,
        }))
        .filter((i) => i.quantidade > 0);

      const totalPedido = itensPedido.reduce(
        (s, i) => s + i.preco * i.quantidade,
        0
      );

      const { data: pedido, error } = await supabase
        .from("pedido")
        .insert({
          id_user_cliente: userId,
          id_lanchonete: itens[0].id_lanchonete,
          valor_total: totalPedido,
          status_pedido: "pendente",
          metodo_pagamento: "none",
          itens: itensPedido,
        })
        .select()
        .single();

      if (error) {
        console.log(error);
        alert("Erro ao criar pedido.");
        return;
      }

      localStorage.removeItem(STORAGE_KEY);

      navigate("/pagamento", { state: { id_pedido: pedido.id_pedido } });
    } catch (e) {
      console.log(e);
      alert("Erro inesperado.");
    }
  };

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

      <div className="w-full max-w-2xl space-y-3">
        {itens.length === 0 && (
          <p className="text-center text-gray-600">Seu carrinho está vazio</p>
        )}

        {itens.map((item) => (
          <div
            key={item.id_produto}
            className="flex items-center justify-between bg-blue-700 text-white rounded-lg p-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.imagem}
                alt={item.nome_produto}
                className="w-12 h-12 rounded"
              />
              <div>
                <div className="font-medium">{item.nome_produto}</div>
                <div className="text-sm">R$ {item.preco.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  alterarQuantidade(item.id_produto, -1)
                }
                className="px-2 bg-blue-600 rounded"
              >
                -
              </button>

              <div className="px-2">{qtd[item.id_produto] || 0}</div>

              <button
                onClick={() =>
                  alterarQuantidade(item.id_produto, 1)
                }
                className="px-2 bg-blue-600 rounded"
              >
                +
              </button>

              <button
                onClick={() => removeItem(item.id_produto)}
                className="ml-2 text-sm bg-white text-blue-700 px-2 py-1 rounded"
              >
                Remover
              </button>
            </div>
          </div>
        ))}

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
                onClick={finalizarCompra}
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
