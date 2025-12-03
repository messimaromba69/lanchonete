import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";   // <- FALTAVA ISSO
import fundoSesc from "./assets/sesc.png";
import { supabase } from "../../supabase/supabase";
import { toast } from "../hooks/use-toast";

export default function CarrinhoSesc() {
  const navigate = useNavigate();
  const STORAGE_KEY = "carrinhoSesc";

  const [itens, setItens] = useState([]);
  const [qtd, setQtd] = useState({});
  const [total, setTotal] = useState(0);

  const location = useLocation();

  // Carrega carrinho (prioriza location.state.carrinho, depois localStorage)
  useEffect(() => {
    try {
      const fromState = location.state?.carrinho;
      if (fromState && Array.isArray(fromState)) {
        setItens(fromState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fromState));

        const objQtd = {};
        fromState.forEach((item) => {
          objQtd[item.id_produto] = item.quantidade;
        });
        setQtd(objQtd);
        return;
      }

      const carrinho = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      setItens(carrinho);

      const objQtd = {};
      carrinho.forEach((item) => {
        objQtd[item.id_produto] = item.quantidade;
      });

      setQtd(objQtd);
    } catch (e) {
      console.error("Erro ao carregar carrinho:", e);
      setItens([]);
      setQtd({});
    }
  }, [location.state]);

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
      toast({ title: "Seu carrinho está vazio!", variant: "destructive" });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        toast({ title: "Login necessário", description: "Você precisa estar logado!", variant: "destructive" });
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

      // Determina id_lanchonete a partir dos itens do carrinho (verifica várias chaves possíveis)
      const possibleKeys = ["id_lanchonete", "lanchonete_id", "id_lanch", "id_lanchonete_id"];
      const rawLanch = itens.find((it) => {
        if (!it) return false;
        return possibleKeys.some((k) => it[k] !== undefined && it[k] !== null);
      }) || itens[0];

      let idLanchonete = null;
      if (rawLanch) {
        for (const k of possibleKeys) {
          if (rawLanch[k] !== undefined && rawLanch[k] !== null) {
            const num = Number(rawLanch[k]);
            if (Number.isFinite(num)) {
              idLanchonete = num;
            }
            break;
          }
        }
      }

      // Fallback: se não encontramos id_lanchonete nos itens, tentar localStorage (seleção anterior)
      if (idLanchonete === null) {
        try {
          const saved = localStorage.getItem("selectedLanchoneteId");
          const parsed = saved ? Number(saved) : null;
          if (Number.isFinite(parsed)) idLanchonete = parsed;
        } catch (e) {
          console.warn("Erro ao ler selectedLanchoneteId do localStorage:", e);
        }
      }

      // Prepara o payload e loga para diagnóstico
      const payload = {
        id_user_cliente: userId,
        id_lanchonete: idLanchonete,
        valor_total: totalPedido,
        status_pedido: "pendente",
        metodo_pagamento: "",
        itens: itensPedido,
      };

      console.log("Payload do insert pedido:", payload);

      // Se não conseguimos determinar id_lanchonete, aborta e pede correção (evita pedidos sem vinculo)
      if (idLanchonete === null) {
        console.warn("id_lanchonete está nulo — abortando insert para evitar pedido sem lanchonete.");
        toast({ title: "Lanchonete não identificada", description: "Não foi possível identificar a lanchonete do pedido. Verifique os itens do carrinho e tente novamente.", variant: "destructive" });
        return;
      }

      // insert sem exigir formato complexo; usa maybeSingle e trata retorno de forma robusta
      const { data: pedidoData, error: insertError } = await supabase
        .from("pedido")
        .insert(payload)
        .select()
        .maybeSingle(); // evita problemas quando o servidor não retorna exatamente 1 objeto

      console.log("Resposta insert pedido (raw):", JSON.stringify({ pedidoData, insertError }));

      if (insertError) {
        console.error("Erro ao inserir pedido:", insertError);
        toast({ title: "Erro ao criar pedido", description: insertError.message || JSON.stringify(insertError), variant: "destructive" });
        return;
      }

      // Verificação adicional: buscar a linha criada para confirmar id_lanchonete salvo
      try {
        const byId =
          pedidoData?.id_pedido ?? (Array.isArray(pedidoData) ? pedidoData[0]?.id_pedido : undefined);
        if (byId) {
          const { data: fetched, error: fetchErr } = await supabase
            .from("pedido")
            .select("id_pedido, id_lanchonete")
            .eq("id_pedido", byId)
            .maybeSingle();
          if (fetchErr) {
            console.warn("Não foi possível buscar pedido criado para verificação:", fetchErr);
          } else {
            console.log("Verificação pós-insert (id_lanchonete):", fetched);
            if (fetched && (fetched.id_lanchonete === null || fetched.id_lanchonete === undefined)) {
              console.warn("id_lanchonete não foi gravado no banco para o pedido", byId);
            }
          }
        }
      } catch (e) {
        console.warn("Erro na verificação pós-insert:", e);
      }

      // extrai id de forma robusta
      const createdId =
        pedidoData?.id_pedido ??
        (Array.isArray(pedidoData) ? pedidoData[0]?.id_pedido : undefined);

      if (!createdId) {
        console.error("id_pedido não retornado após insert", { pedidoData });
        toast({ title: "Erro ao criar pedido", description: "id do pedido não foi retornado pelo servidor.", variant: "destructive" });
        return;
      }

      // Não removemos o carrinho aqui — manter no localStorage para permitir
      // que o usuário volte da tela de pagamento e veja os mesmos itens.
      navigate("/pagamento", { state: { id_pedido: createdId } });
    } catch (e) {
      console.log(e);
      toast({ title: "Erro inesperado", variant: "destructive" });
    }
  };

  return (
    // container centralizado e relativo
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white p-4">
      {/* Header absoluto no topo — logo à esquerda e perfil à direita */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4">
        {/* Logo à esquerda com botão voltar abaixo */}
        <div className="flex flex-col items-center">
          <img
            src={fundoSesc}
            alt="Logo Sesc"
            className="h-28 md:h-32 object-contain"
          />

          <button
            onClick={() => navigate(-1)}
            className="text-black mt-3"
            aria-label="Voltar"
          >
            <ArrowLeft size={40} />
          </button>
        </div>

        {/* ÍCONE DE PERFIL à direita (aumentado) */}
        <button
          onClick={() => navigate("/profile")}
          className="p-1 rounded-lg z-40"
          aria-label="Perfil"
        >
          <FaUserCircle size={64} className="text-blue-600" />
        </button>
      </div>

      {/* Título mais para cima */}
      <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mt-2 mb-3">
        Carrinho
      </h2>

      {/* Caixas aproximadas do título */}
      <div className="w-full max-w-2xl space-y-3 mt-1">
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
                onClick={() => alterarQuantidade(item.id_produto, -1)}
                className="px-2 bg-blue-600 rounded"
              >
                -
              </button>

              <div className="px-2">{qtd[item.id_produto] || 0}</div>

              <button
                onClick={() => alterarQuantidade(item.id_produto, 1)}
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
