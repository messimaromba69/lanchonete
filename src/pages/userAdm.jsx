import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabase";
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

  // paginação
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;

  // modal edição
  const [editando, setEditando] = useState(null);

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
        },
      }));

      setUsuarios(lista);
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
      alert("Erro ao excluir");
      return;
    }
    buscarUsuarios();
  };

  // =======================================================
  // SALVAR EDIÇÃO
  // =======================================================
  const salvarEdicao = async () => {
    const { id, perfil } = editando;

    const { error } = await supabase.rpc("admin_update_user", {
      uid: id,
      nome: perfil.nome,
      telefone: perfil.telefone,
      id_escola: perfil.id_escola,
    });

    if (error) {
      alert("Erro ao salvar");
      return;
    }

    setEditando(null);
    buscarUsuarios();
  };

  // filtro
  const filtrado = usuarios.filter(
    (u) =>
      u.email?.toLowerCase().includes(busca.toLowerCase()) ||
      u.perfil?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  // paginação
  const totalPaginas = Math.max(1, Math.ceil(filtrado.length / porPagina));
  const exibidos = filtrado.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  // =======================================================
  // RENDER
  // =======================================================
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button onClick={() => navigate("/")} className="text-black mb-6">
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
      </div>

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
                    <tr
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.perfil?.nome || "-"}</td>
                      <td className="p-3">{u.perfil?.telefone || "-"}</td>
                      <td className="p-3">
                        {
                          escolas.find(
                            (e) => e.id_escola === u.perfil?.id_escola
                          )?.nome_escola
                        }
                      </td>

                      <td className="p-3 flex gap-4">
                        <button
                          onClick={() => setEditando(u)}
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
                                <p>
                                  <b>Pedido:</b> {p.id_pedido}
                                </p>
                                <p>
                                  <b>Status:</b> {p.status_pedido}
                                </p>
                                <p>
                                  <b>Total:</b> R${" "}
                                  {Number(p.valor_total).toFixed(2)}
                                </p>
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

      {/* PAGINAÇÃO */}
      <div className="flex gap-6 mt-6 text-xl items-center">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
        >
          <ChevronLeft size={32} />
        </button>

        <span>
          Página {pagina} de {totalPaginas}
        </span>

        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(pagina + 1)}
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* MODAL EDITAR */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-3">Editar Usuário</h2>

            <input
              type="text"
              className="w-full border p-3 rounded"
              value={editando.perfil.nome}
              onChange={(e) =>
                setEditando({
                  ...editando,
                  perfil: { ...editando.perfil, nome: e.target.value },
                })
              }
              placeholder="Nome"
            />

            <input
              type="text"
              className="w-full border p-3 rounded"
              value={editando.perfil.telefone}
              onChange={(e) =>
                setEditando({
                  ...editando,
                  perfil: {
                    ...editando.perfil,
                    telefone: e.target.value,
                  },
                })
              }
              placeholder="Telefone"
            />

            <select
              className="w-full border p-3 rounded"
              value={editando.perfil.id_escola ?? ""}
              onChange={(e) =>
                setEditando({
                  ...editando,
                  perfil: {
                    ...editando.perfil,
                    id_escola: e.target.value === "" ? null : Number(e.target.value),
                  },
                })
              }
            >
              <option value="">Selecione uma Escola</option>
              {escolas.map((esc) => (
                <option
                  key={esc.id_escola}
                  value={esc.id_escola}
                >
                  {esc.nome_escola}
                </option>
              ))}
            </select>

            <div className="flex justify-between">
              <button
                onClick={() => setEditando(null)}
                className="text-gray-600"
              >
                Cancelar
              </button>

              <button
                onClick={salvarEdicao}
                className="bg-blue-600 px-4 py-2 rounded text-white"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
