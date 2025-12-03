import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../supabase/supabase";
import fundoSenac from "./assets/senac.png";
import { toast } from "../hooks/use-toast";

export default function PagamentoSenac() {
  const navigate = useNavigate();
  const location = useLocation();

  // garante que id_pedido é um número (evita comparação string vs int)
  const id_pedido = location.state?.id_pedido
    ? Number(location.state.id_pedido)
    : undefined;

  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [total, setTotal] = useState(0);

  const handleBack = () => {
    try {
      const idx = window.history.state && window.history.state.idx;
      if (typeof idx === "number" && idx > 0) {
        navigate(-1);
        return;
      }

      const raw = localStorage.getItem("carrinhoSenac");
      if (raw) {
        const carrinho = JSON.parse(raw);
        navigate("/cart", { state: { carrinho } });
        return;
      }
    } catch (e) {
      console.error("Erro ao recuperar carrinhoSenac:", e);
    }
    navigate(-1);
  };

  useEffect(() => {
    if (!id_pedido) {
      toast({ title: "Nenhum pedido encontrado", description: "Volte ao carrinho e tente novamente.", variant: "destructive" });
      navigate("/cart");
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
        toast({ title: "Erro ao carregar pedido", description: "Tente novamente mais tarde.", variant: "destructive" });
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
      toast({ title: "Escolha uma forma de pagamento", description: "Selecione um método antes de confirmar.", variant: "destructive" });
      return;
    }

    if (!id_pedido) {
      toast({ title: "ID do pedido não encontrado", description: "Volte ao carrinho e tente novamente.", variant: "destructive" });
      return;
    }

    try {
      setCarregando(true);

      // checa autenticação (tabelas com RLS podem exigir usuário)
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        toast({ title: "Login necessário", description: "Faça login para finalizar o pedido.", variant: "destructive" });
        navigate("/loginUser");
        return;
      }

      // 0️⃣ BUSCAR O PEDIDO ANTES DO UPDATE (diagnóstico / verificação de propriedade)
      const { data: pedidoDebug, error: debugErr } = await supabase
        .from("pedido")
        .select("id_pedido, id_user_cliente, status_pedido, metodo_pagamento")
        .eq("id_pedido", id_pedido)
        .maybeSingle();

      console.log("Diagnóstico pré-update:", { userId, pedidoDebug, debugErr });

      if (debugErr) {
        console.error("Erro ao buscar pedido para diagnóstico:", debugErr);
        toast({ title: "Erro interno", description: "Não foi possível verificar o pedido. Contate o suporte.", variant: "destructive" });
        return;
      }

      // se o pedido existe, verifica se pertence ao usuário atual
      if (pedidoDebug && pedidoDebug.id_user_cliente) {
        if (pedidoDebug.id_user_cliente !== userId) {
          toast({ title: "Ação não permitida", description: "Este pedido pertence a outro usuário.", variant: "destructive" });
          return;
        }
      } else if (!pedidoDebug) {
        toast({ title: "Pedido não encontrado", description: "Verifique o ID do pedido e tente novamente.", variant: "destructive" });
        return;
      }

      // 1️⃣ Executa o update pois a verificação de propriedade passou
      // Executa update sem pedir retorno (evita problemas de content-negotiation / 406)
      const { error: updateError } = await supabase
        .from("pedido")
        .update({
          metodo_pagamento: metodoPagamento,
          status_pedido: "aguardando retirada",
        })
        .eq("id_pedido", id_pedido);

      if (updateError) {
        console.error("Erro ao executar update no pedido:", updateError);
        if (updateError?.status === 401 || updateError?.code === "42501") {
          toast({ title: "Permissão negada", description: "Você não tem permissão para atualizar este pedido.", variant: "destructive" });
        } else {
          toast({ title: "Erro ao atualizar pedido", description: updateError.message || JSON.stringify(updateError), variant: "destructive" });
        }
        return;
      }

      // Consulta separada para confirmar se o campo foi realmente atualizado
      const { data: updatedPedido, error: fetchUpdatedErr } = await supabase
        .from("pedido")
        .select("metodo_pagamento, status_pedido, id_user_cliente")
        .eq("id_pedido", id_pedido)
        .maybeSingle();

      if (fetchUpdatedErr) {
        console.error("Erro ao buscar pedido atualizado:", fetchUpdatedErr);
        toast({ title: "Pedido atualizado, mas não foi possível confirmar a atualização.", description: "Verifique no painel.", variant: "destructive" });
        return;
      }

      if (!updatedPedido) {
        console.warn("Update não refletido (fetch retornou null)", { id_pedido });
        toast({ title: "Pedido não foi atualizado (0 linhas afetadas).", description: "Verifique permissões/ID do pedido.", variant: "destructive" });
        return;
      }

      // Confirmação do campo
      if (updatedPedido.metodo_pagamento !== metodoPagamento) {
        console.warn("Aviso: metodo_pagamento retornado é diferente do selecionado", {
          enviado: metodoPagamento,
          retornado: updatedPedido.metodo_pagamento,
        });

        // Busca a linha completa para diagnóstico adicional
        const { data: fullRow, error: fullErr } = await supabase
          .from("pedido")
          .select("*")
          .eq("id_pedido", id_pedido)
          .maybeSingle();

        console.log("Diagnóstico completo após update:", {
          userId,
          pedidoDebug,
          updatedPedido,
          fullRow,
          fullErr,
        });

        // Mensagem útil para o desenvolvedor/administrador (usuário final recebe instrução simples)
        toast({ title: "Atualização parcial", description: "Pedido atualizado, mas método de pagamento não persistiu. Verifique no painel.", variant: "destructive" });
        return;
      }

      console.log("Pedido atualizado confirmado:", updatedPedido);
      toast({ title: "Pedido finalizado", description: "Vá ao balcão para retirar.", variant: "default" });

      localStorage.removeItem("carrinhoSenac");
      navigate("/senac");
    } catch (err) {
      console.error("Erro inesperado ao finalizar pedido:", err);
      toast({ title: "Erro ao finalizar pedido", description: err?.message || JSON.stringify(err), variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="relative flex items-center justify-center mt-2">
          <button
            onClick={handleBack}
            className="fixed left-0 top-4 text-black p-8 rounded-r-md"
            aria-label="Voltar"
          >
            <ArrowLeft size={40} />
          </button>

          <img
            src={fundoSenac}
            alt="Logo Senac"
            className="h-28 md:h-24 object-contain"
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 -mt-4">
          <h2 className="text-center text-2xl font-semibold text-gray-800">Forma de Pagamento</h2>

          <p className="text-center text-3xl font-bold text-orange-600 mt-4">R$ {total.toFixed(2)}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <button
              onClick={() => setMetodoPagamento("Pix")}
              className={`py-3 rounded-lg font-semibold shadow-sm transition-colors ${
                metodoPagamento === "Pix" ? "bg-orange-600 text-white ring-2 ring-orange-300" : "bg-gray-100"
              }`}
            >
              Pix
            </button>

            <button
              onClick={() => setMetodoPagamento("Dinheiro")}
              className={`py-3 rounded-lg font-semibold shadow-sm transition-colors ${
                metodoPagamento === "Dinheiro" ? "bg-orange-600 text-white ring-2 ring-orange-300" : "bg-gray-100"
              }`}
            >
              Dinheiro
            </button>

            <button
              onClick={() => setMetodoPagamento("Cartão")}
              className={`py-3 rounded-lg font-semibold shadow-sm transition-colors ${
                metodoPagamento === "Cartão" ? "bg-orange-600 text-white ring-2 ring-orange-300" : "bg-gray-100"
              }`}
            >
              Cartão
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={finalizarPedido}
              disabled={carregando}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 py-3 rounded-lg font-semibold shadow hover:brightness-95 disabled:opacity-60"
            >
              {carregando ? "Enviando pedido..." : "Confirmar Pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
