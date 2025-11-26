import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../supabase/supabase";

export default function PagamentoSesc() {
  const navigate = useNavigate();
  const location = useLocation();

  const id_pedido = location.state?.id_pedido;

  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!id_pedido) {
      alert("Erro: Nenhum pedido encontrado!");
      navigate("/carrinho");
    }
  }, [id_pedido]);

  useEffect(() => {
    async function carregarPedido() {
      if (!id_pedido) return;

      const { data, error } = await supabase
        .from("pedido")
        .select("valor_total, metodo_pagamento")
        .eq("id_pedido", id_pedido)
        .single();

      if (error) {
        console.error(error);
        alert("Erro ao carregar o pedido.");
        return;
      }

      setTotal(data.valor_total);

      if (data.metodo_pagamento) {
        setMetodoPagamento(data.metodo_pagamento);
      }
    }

    carregarPedido();
  }, [id_pedido]);

  const finalizarPedido = async () => {
    if (!metodoPagamento) {
      alert("Escolha uma forma de pagamento antes de confirmar.");
      return;
    }

    try {
      setCarregando(true);

      const { error } = await supabase
        .from("pedido")
        .update({
          metodo_pagamento: String(metodoPagamento),
          status_pedido: "aguardando retirada",
        })
        .eq("id_pedido", id_pedido);

      if (error) {
        console.error(error);
        alert("Erro ao atualizar pedido.");
        return;
      }

      alert("Pedido finalizado! Vá ao balcão para retirar.");
      localStorage.removeItem("carrinhoSesc");
      navigate("/sesc");
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar pedido.");
    } finally {
      setCarregando(false);
    }
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
        Forma de Pagamento
      </h2>

      <p className="text-center text-lg font-semibold text-gray-800 mt-6">
        Total: <span className="text-blue-700">R$ {total.toFixed(2)}</span>
      </p>

      <div className="max-w-md mx-auto mt-6 space-y-4">
        <button
          onClick={() => setMetodoPagamento("Pix")}
          className={`w-full py-3 rounded font-semibold ${
            metodoPagamento === "Pix" ? "bg-blue-700 text-white" : "bg-gray-200"
          }`}
        >
          Pix
        </button>

        <button
          onClick={() => setMetodoPagamento("Dinheiro")}
          className={`w-full py-3 rounded font-semibold ${
            metodoPagamento === "Dinheiro"
              ? "bg-blue-700 text-white"
              : "bg-gray-200"
          }`}
        >
          Dinheiro
        </button>

        <button
          onClick={() => setMetodoPagamento("Cartão")}
          className={`w-full py-3 rounded font-semibold ${
            metodoPagamento === "Cartão"
              ? "bg-blue-700 text-white"
              : "bg-gray-200"
          }`}
        >
          Cartão
        </button>
      </div>

      <div className="max-w-md mx-auto mt-6">
        <button
          onClick={finalizarPedido}
          disabled={carregando}
          className="w-full bg-yellow-400 py-3 rounded font-semibold"
        >
          {carregando ? "Enviando pedido..." : "Confirmar Pedido"}
        </button>
      </div>
    </div>
  );
}
