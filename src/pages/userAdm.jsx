import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabase";
import { notify } from "../lib/customToast";
import {
  ArrowLeft,
  Trash2,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserAdm() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminAllowed, setAdminAllowed] = useState(true);

  const [pedidosByUser, setPedidosByUser] = useState({});
  const [lanchonetesMap, setLanchonetesMap] = useState({});
  const [showOrders, setShowOrders] = useState({});

  // busca
  const [busca, setBusca] = useState("");

  // mostrar todos sem paginação
  const [showAll, setShowAll] = useState(false);

  // paginação
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;

  // modal edição
  const [editando, setEditando] = useState(null);

  // formatação semelhante ao EditarPerfil
  function maskPhone(v) {
    if (!v) return "";
    const nums = String(v).replace(/\D/g, "");
    if (nums.length === 0) return "";
    const ddd = nums.slice(0, 2);
    const rest = nums.slice(2);
    let formatted = `(${ddd}) `;
    if (rest.length <= 4) {
      formatted += rest;
    } else if (rest.length <= 8) {
      formatted +=
        rest.slice(0, 4) + (rest.slice(4) ? `-${rest.slice(4)}` : "");
    } else {
      // more than 8 digits after DDD -> use 5-4 split (common for 11-digit numbers)
      formatted +=
        rest.slice(0, 5) + (rest.slice(5) ? `-${rest.slice(5, 9)}` : "");
    }
    return formatted.trim();
  }

  function maskCEP(v) {
    if (!v) return "";
    const nums = String(v).replace(/\D/g, "").slice(0, 8);
    if (nums.length <= 5) return nums;
    return nums.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
  }

  function formatDateDisplay(iso) {
    if (!iso) return "";
    if (typeof iso === "string" && iso.includes("-"))
      return iso.split("-").reverse().join("/");
    return iso;
  }

  useEffect(() => {
    buscarUsuarios();
    buscarEscolas();
  }, []);

  // =======================================================
  // BUSCAR ESCOLAS
  // =======================================================
  const buscarEscolas = async () => {
    const { data, error } = await supabase.from("escola").select("*");
    if (!error && data) setEscolas(data);
  };

  // =======================================================
  // BUSCAR USUÁRIOS
  // =======================================================
  const buscarUsuarios = async () => {
    setLoading(true);
    try {
      // RPC USERS (JSON wrapper)
      const { data: authUsers, error } = await supabase.rpc(
        "admin_get_users_json"
      );
      if (error) throw error;

      // authUsers pode vir como array de json/objetos ou strings JSON
      const parsed = (authUsers || []).map((r) =>
        typeof r === "string" ? JSON.parse(r) : r
      );

      const lista = parsed.map((u) => ({
        id: u.id_user,
        email: u.email || "",
        perfil: {
          nome: u.nome || "",
          telefone: u.telefone || "",
          id_escola: u.id_escola || null,
          // campos extras serão preenchidos pela query em seguida quando existir
          cep: null,
          cidade: null,
          estado: null,
          rua: null,
          bairro: null,
          complemento: null,
          sexo: null,
          data_nascimento: null,
          foto: null,
        },
      }));
      // Buscamos perfis completos e mesclamos para garantir todos os campos
      try {
        const { data: perfis } = await supabase.from("perfil").select("*");
        const listaFinal = lista.map((u) => ({
          ...u,
          perfil: {
            ...(perfis?.find((p) => p.id_user === u.id) || {}),
            ...u.perfil,
          },
        }));
        setUsuarios(listaFinal);
      } catch (e2) {
        // se falhar, mantemos a lista parcial
        setUsuarios(lista);
      }
      setAdminAllowed(true);

      carregarPedidosELanchonetes();
    } catch (e) {
      console.error("Erro RPC:", e);
      // Fallback: se RPC de admin não funcionar, carregamos apenas os perfis
      setAdminAllowed(false);
      try {
        const { data: perfis } = await supabase.from("perfil").select("*");
        const lista = (perfis || []).map((p) => ({
          id: p.id_user,
          email: "",
          perfil: p,
        }));
        setUsuarios(lista);
        carregarPedidosELanchonetes();
      } catch (err2) {
        console.error("Erro fallback perfis:", err2);
      }
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // PEDIDOS
  // =======================================================
  const carregarPedidosELanchonetes = async () => {
    try {
      const { data: pedidos } = await supabase.from("pedido").select("*");

      const tmp = {};
      pedidos?.forEach((p) => {
        if (!tmp[p.id_user_cliente]) tmp[p.id_user_cliente] = [];
        tmp[p.id_user_cliente].push(p);
      });

      setPedidosByUser(tmp);

      const { data: lanch } = await supabase
        .from("lanchonete")
        .select("id_lanchonete, nome_lanchonete");

      const map = {};
      lanch?.forEach((l) => (map[l.id_lanchonete] = l.nome_lanchonete));

      setLanchonetesMap(map);
    } catch (e) {
      console.error("Erro pedidos:", e);
    }
  };

  // =======================================================
  // EXCLUIR
  // =======================================================
  const removerUsuario = async (id) => {
    if (!confirm("Deseja realmente excluir este usuário?")) return;

    const { error } = await supabase.rpc("admin_delete_user", { uid: id });
    if (error) {
      notify({ description: "Erro ao excluir", variant: "destructive" });
      return;
    }
    buscarUsuarios();
  };

  const removerPedido = async (id_pedido) => {
    if (!confirm("Deseja realmente excluir este pedido?")) return;
    try {
      const { error } = await supabase
        .from("pedido")
        .delete()
        .eq("id_pedido", id_pedido);
      if (error) {
        console.error("Erro ao deletar pedido:", error);
        notify({
          description:
            "Erro ao deletar pedido: " +
            (error.message || JSON.stringify(error)),
          variant: "destructive",
        });
        return;
      }
      carregarPedidosELanchonetes();
    } catch (e) {
      console.error(e);
      notify({
        description: "Erro ao deletar pedido.",
        variant: "destructive",
      });
    }
  };

  const removerEscola = async (id_escola) => {
    if (!id_escola) {
      notify({ description: "Escola inválida", variant: "destructive" });
      return;
    }
    if (
      !confirm(
        "Deseja realmente excluir esta escola? Isso removerá apenas a escola - verifique dependências."
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("escola")
        .delete()
        .eq("id_escola", id_escola);
      if (error) {
        console.error("Erro ao deletar escola:", error);
        notify({
          description:
            "Erro ao deletar escola: " +
            (error.message || JSON.stringify(error)),
          variant: "destructive",
        });
        return;
      }
      // atualizar listas
      buscarEscolas();
      buscarUsuarios();
    } catch (e) {
      console.error(e);
      notify({
        description: "Erro ao deletar escola.",
        variant: "destructive",
      });
    }
  };

  // =======================================================
  // SALVAR EDIÇÃO
  // =======================================================
  const salvarEdicao = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      notify({
        description:
          "Sessão não encontrada. Faça login novamente para salvar o perfil.",
        variant: "destructive",
      });
      navigate("/userAdm"); // ou abrir modal de login
      return;
    }
    const { id, perfil } = editando;

    try {
      // DEBUG: verificar sessão atual antes de tentar o upsert
      try {
        const sessionResp = await supabase.auth.getSession();
        console.log(
          "salvarEdicao - sessão atual:",
          sessionResp?.data?.session || null
        );
      } catch (sessErr) {
        console.warn("salvarEdicao - falha ao obter sessão:", sessErr);
      }

      // Tentamos persistir no perfil via upsert para garantir todos os campos
      const upsertData = { ...perfil, id_user: id };
      const {
        data: upserted,
        error,
        status,
      } = await supabase
        .from("perfil")
        .upsert(upsertData, { onConflict: "id_user" });

      if (error) {
        // Mostra detalhes do erro para diagnóstico (status, message, details)
        console.error("Erro ao salvar perfil:", { status, error });
        if (status === 401) {
          notify({
            description:
              "Falha 401: não autorizado. Verifique se há sessão válida e se as policies RLS permitem esta operação para seu usuário.",
            variant: "destructive",
          });
        } else {
          notify({
            description:
              "Erro ao salvar: " + (error.message || JSON.stringify(error)),
            variant: "destructive",
          });
        }
        return;
      }

      setEditando(null);
      buscarUsuarios();
    } catch (e) {
      console.error("Erro salvarEdicao:", e);
      notify({ description: "Erro ao salvar", variant: "destructive" });
    }
  };

  // filtro
  const filtrado = usuarios.filter(
    (u) =>
      u.email?.toLowerCase().includes(busca.toLowerCase()) ||
      u.perfil?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  // paginação
  const totalPaginas = showAll
    ? 1
    : Math.max(1, Math.ceil(filtrado.length / porPagina));
  const exibidos = showAll
    ? filtrado
    : filtrado.slice((pagina - 1) * porPagina, pagina * porPagina);

  // =======================================================
  // RENDER
  // =======================================================
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button onClick={() => navigate(-1)} className="text-black mb-6">
        <ArrowLeft size={40} />
      </button>

      <h1 className="text-4xl font-bold text-blue-800 mb-8">
        Painel Administrativo – Usuários
      </h1>

      {/* BUSCA */}
      <div className="flex items-center bg-white shadow p-3 rounded-xl mb-6 max-w-lg">
        <Search className="mr-2 text-gray-600" />
        <input
          type="text"
          className="w-full outline-none"
          placeholder="Buscar por email ou nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button
          onClick={() => {
            setShowAll((s) => !s);
            setPagina(1);
          }}
          className="ml-3 text-sm px-3 py-1 border rounded"
        >
          {showAll ? "Mostrar página" : "Mostrar todos"}
        </button>
      </div>

      {/* MODAL DE EDIÇÃO DO USUÁRIO */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Editar Usuário</h2>
              <button
                onClick={() => setEditando(null)}
                className="text-gray-600"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                className="border p-2 rounded"
                placeholder="Nome"
                value={editando.perfil?.nome || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: { ...editando.perfil, nome: e.target.value },
                  })
                }
              />

              {/* Telefone removido (duplicado). Campo com máscara abaixo mantém edição. */}

              <input
                type="text"
                className="border p-2 rounded"
                placeholder="CEP"
                value={editando.perfil?.cep || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: { ...editando.perfil, cep: e.target.value },
                  })
                }
              />

              <input
                type="text"
                className="border p-2 rounded"
                placeholder="Cidade"
                value={editando.perfil?.cidade || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: { ...editando.perfil, cidade: e.target.value },
                  })
                }
              />

              <input
                type="text"
                className="border p-2 rounded"
                placeholder="Estado"
                value={editando.perfil?.estado || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: { ...editando.perfil, estado: e.target.value },
                  })
                }
              />

              <input
                type="text"
                className="border p-2 rounded"
                placeholder="Rua"
                value={editando.perfil?.rua || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: { ...editando.perfil, rua: e.target.value },
                  })
                }
              />

              <input
                type="text"
                className="border p-2 rounded"
                placeholder="Bairro"
                value={editando.perfil?.bairro || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: { ...editando.perfil, bairro: e.target.value },
                  })
                }
              />

              <select
                className="border p-2 rounded"
                value={editando.perfil?.complemento || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: { ...editando.perfil, complemento: e.target.value },
                  })
                }
              >
                <option value="">Complemento</option>
                <option value="Casa">Casa</option>
                <option value="Condomínio">Condomínio</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Bloco">Bloco</option>
              </select>

              <select
                className="border p-2 rounded"
                value={editando.perfil?.sexo || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: { ...editando.perfil, sexo: e.target.value },
                  })
                }
              >
                <option value="">Sexo</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>

              <input
                type="text"
                className="border p-2 rounded"
                placeholder="Telefone"
                value={editando.perfil?.telefone || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: { ...editando.perfil, telefone: maskPhone(e.target.value) },
                  })
                }
              />
              <input
                type="date"
                className="border p-2 rounded"
                placeholder="Data Nascimento"
                value={
                  editando.perfil?.data_nascimento
                    ? String(editando.perfil.data_nascimento).slice(0, 10)
                    : ""
                }
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: {
                      ...editando.perfil,
                      data_nascimento: e.target.value,
                    },
                  })
                }
              />

              <input
                type="text"
                className="border p-2 rounded md:col-span-2"
                placeholder="URL da Foto"
                value={editando.perfil?.foto || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: { ...editando.perfil, foto: e.target.value },
                  })
                }
              />

              <select
                className="border p-2 rounded md:col-span-2"
                value={editando.perfil?.id_escola ?? ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    perfil: {
                      ...editando.perfil,
                      id_escola:
                        e.target.value === "" ? null : Number(e.target.value),
                    },
                  })
                }
              >
                <option value="">Selecione Escola</option>
                {escolas.map((esc) => (
                  <option key={esc.id_escola} value={esc.id_escola}>
                    {esc.nome_escola}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditando(null)}
                className="px-4 py-2 rounded border"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABELA */}
      <div className="bg-white shadow-xl rounded-xl p-6">
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xl border-b">
                <th className="p-3">Email</th>
                <th className="p-3">Nome</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Escola</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>

            <tbody>
              {exibidos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                exibidos.map((u) => (
                  <React.Fragment key={u.id}>
                    <tr className="border-b hover:bg-gray-50 transition">
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.perfil?.nome || "-"}</td>
                      <td className="p-3">{u.perfil?.telefone ? maskPhone(u.perfil.telefone) : "-"}</td>
                      <td className="p-3">
                        {
                          escolas.find(
                            (e) => e.id_escola === u.perfil?.id_escola
                          )?.nome_escola
                        }
                      </td>

                      <td className="p-3 flex gap-4">
                        <button
                          onClick={async () => {
                            try {
                              const { data: perfilData } = await supabase
                                .from("perfil")
                                .select("*")
                                .eq("id_user", u.id)
                                .maybeSingle();

                              const perfil = perfilData || u.perfil || {};

                              // aplicar máscaras de exibição
                              perfil.telefone = perfil.telefone ? maskPhone(perfil.telefone) : "";
                              perfil.cep = perfil.cep ? maskCEP(perfil.cep) : "";

                              // garantir formato de data para o input date (YYYY-MM-DD)
                              if (perfil.data_nascimento) {
                                const d = String(perfil.data_nascimento);
                                if (d.includes("/")) {
                                  // se estiver em DD/MM/AAAA, converter
                                  const [dd, mm, yy] = d.split("/");
                                  perfil.data_nascimento = `${yy}-${mm}-${dd}`;
                                } else {
                                  perfil.data_nascimento = d.slice(0, 10);
                                }
                              }

                              setEditando({ ...u, perfil });
                            } catch (e) {
                              console.error("Erro ao carregar perfil para edição:", e);
                              setEditando({ ...u, perfil: { ...(u.perfil || {}) } });
                            }
                          }}
                          className="text-blue-600"
                        >
                          <Pencil size={22} />
                        </button>

                        <button
                          onClick={() => removerUsuario(u.id)}
                          className="text-red-600"
                        >
                          <Trash2 size={22} />
                        </button>

                        <button
                          onClick={() =>
                            setShowOrders((s) => ({
                              ...s,
                              [u.id]: !s[u.id],
                            }))
                          }
                        >
                          ⋮
                        </button>
                      </td>
                    </tr>

                    {showOrders[u.id] && (
                      <tr key={u.id + "-orders"} className="bg-gray-50">
                        <td colSpan={5} className="p-4">
                          {/* Dados completos do aluno */}
                          <div className="bg-white p-4 rounded mb-4">
                            <h3 className="font-semibold">Dados do Aluno</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
                              <div>
                                <b>Nome:</b> {u.perfil?.nome || "-"}
                              </div>
                              <div>
                                <b>Telefone:</b>{" "}
                                {u.perfil?.telefone
                                  ? maskPhone(u.perfil.telefone)
                                  : "-"}
                              </div>
                              <div>
                                <b>CEP:</b>{" "}
                                {u.perfil?.cep ? maskCEP(u.perfil.cep) : "-"}
                              </div>
                              <div>
                                <b>Cidade:</b> {u.perfil?.cidade || "-"}
                              </div>
                              <div>
                                <b>Estado:</b> {u.perfil?.estado || "-"}
                              </div>
                              <div>
                                <b>Rua:</b> {u.perfil?.rua || "-"}
                              </div>
                              <div>
                                <b>Bairro:</b> {u.perfil?.bairro || "-"}
                              </div>
                              <div>
                                <b>Complemento:</b>{" "}
                                {u.perfil?.complemento || "-"}
                              </div>
                              <div>
                                <b>Sexo:</b> {u.perfil?.sexo || "-"}
                              </div>
                              <div>
                                <b>Data Nasc.:</b>{" "}
                                {u.perfil?.data_nascimento
                                  ? formatDateDisplay(u.perfil.data_nascimento)
                                  : "-"}
                              </div>
                              <div className="col-span-2">
                                <b>Foto:</b>{" "}
                                {u.perfil?.foto ? (
                                  <img
                                    src={u.perfil.foto}
                                    alt="foto"
                                    className="h-16 inline-block ml-2"
                                  />
                                ) : (
                                  " -"
                                )}
                              </div>
                              <div className="col-span-2">
                                <b>Escola cadastrada:</b>{" "}
                                {escolas.find((e) => e.id_escola === u.perfil?.id_escola)
                                  ?.nome_escola || "-"}
                                {u.perfil?.id_escola && (
                                  <button
                                    onClick={() => removerEscola(u.perfil.id_escola)}
                                    className="ml-3 text-red-600 text-sm"
                                  >
                                    <Trash2 size={16} /> Excluir Escola
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {(pedidosByUser[u.id] || []).length === 0 ? (
                            <p className="text-sm text-gray-500">
                              Nenhum pedido deste usuário.
                            </p>
                          ) : (
                            pedidosByUser[u.id].map((p) => (
                              <div
                                key={p.id_pedido}
                                className="bg-white p-3 border rounded mb-2"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p>
                                      <b>Pedido:</b> {p.id_pedido}
                                    </p>
                                    <p>
                                      <b>Status:</b> {p.status_pedido}
                                    </p>
                                    <p>
                                      <b>Data:</b>{" "}
                                      {p.created_at
                                        ? new Date(
                                            p.created_at
                                          ).toLocaleString()
                                        : "-"}
                                    </p>
                                    <p>
                                      <b>Lanchonete:</b>{" "}
                                      {lanchonetesMap[p.id_lanchonete] ||
                                        p.id_lanchonete ||
                                        "-"}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <p>
                                      <b>Total:</b> R${" "}
                                      {Number(p.valor_total || 0).toFixed(2)}
                                    </p>
                                    <p>
                                      <b>Pagamento:</b>{" "}
                                      {p.metodo_pagamento || "-"}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <b>Itens:</b>
                                  {Array.isArray(p.itens) ? (
                                    <ul className="list-disc ml-6 mt-2">
                                      {p.itens.map((it, idx) => (
                                        <li key={idx} className="text-sm">
                                          {it.nome_produto ||
                                            it.nome ||
                                            `produto ${
                                              it.id_produto || ""
                                            }`}{" "}
                                          — x
                                          {it.quantidade ||
                                            it.quantidade_item ||
                                            it.qty ||
                                            1}{" "}
                                          {it.preco_unitario ||
                                          it.preco ||
                                          it.preco_produto
                                            ? `R$ ${Number(
                                                it.preco_unitario ||
                                                  it.preco ||
                                                  it.preco_produto
                                              ).toFixed(2)}`
                                            : ""}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : p.itens ? (
                                    <pre className="text-sm bg-gray-100 p-2 rounded mt-2 overflow-auto">
                                      {JSON.stringify(p.itens, null, 2)}
                                    </pre>
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      Sem itens registrados.
                                    </p>
                                  )}

                                  <div className="mt-2 flex gap-4 items-center">
                                    <button
                                      onClick={() => {
                                        try {
                                          navigator.clipboard.writeText(
                                            JSON.stringify(p, null, 2)
                                          );
                                          notify({
                                            description:
                                              "JSON do pedido copiado para a área de transferência.",
                                          });
                                        } catch (e) {
                                          console.error(
                                            "Erro ao copiar JSON do pedido",
                                            e
                                          );
                                        }
                                      }}
                                      className="text-xs text-blue-600"
                                    >
                                      Ver JSON do pedido
                                    </button>

                                    <button
                                      onClick={() => removerPedido(p.id_pedido)}
                                      className="text-xs text-red-600"
                                    >
                                      <Trash2 size={14} /> Excluir Pedido
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
