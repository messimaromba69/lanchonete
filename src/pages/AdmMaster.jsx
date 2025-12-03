import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { toast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";

export default function AdmMaster() {
	const navigate = useNavigate();
	const [escolas, setEscolas] = useState([]);
	const [nome, setNome] = useState("");
	const [loading, setLoading] = useState(false);
	const { user, loading: authLoading } = useAuth();
	// detecta um admin local marcado pelo login administrativo (LoginAdm)
	const isLocalAdmin = typeof window !== "undefined" && localStorage.getItem("isLocalAdmin") === "1";

	useEffect(() => {
		carregarEscolas();
	}, []);

	const carregarEscolas = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("escola")
				.select("id_escola, nome_escola, created_at")
				.order("created_at", { ascending: false });
			if (error) throw error;
			setEscolas(data || []);
		} catch (e) {
			console.error("Erro ao carregar escolas:", e);
			toast({ title: "Erro", description: "Não foi possível carregar as escolas." });
		} finally {
			setLoading(false);
		}
	};

	const criarEscola = async () => {
		if (!nome || !nome.trim()) {
			toast({ title: "Nome vazio", description: "Informe o nome da escola." });
			return;
		}
		// Se a autenticação ainda está sendo verificada, avise e saia
		if (authLoading) {
			toast({ title: "Aguarde", description: "Verificando autenticação..." });
			return;
		}

		// Verifica usuário vindo do contexto de autenticação ou admin local
		if (!user && !isLocalAdmin) {
			toast({ title: "Não autenticado", description: "Faça login antes de criar uma escola." });
			return;
		}

		setLoading(true);
		try {
			// Tenta inserir
			const { data, error } = await supabase
				.from("escola")
				.insert([{ nome_escola: nome.trim() }])
				.select("id_escola, nome_escola, created_at");

			if (error) {
				console.error("Erro criar escola:", error);
				if (error.code === "42501") {
					throw new Error(
						"Inserção bloqueada por Row-Level Security (RLS). Configure uma policy adequada ou use um backend."
					);
				}
				throw error;
			}

			// `data` é um array das linhas inseridas — descompacta ao adicionar localmente
			console.log("Escola criada:", data);
			setEscolas((s) => [...(data || []), ...s]);
			setNome("");
			toast({ title: "Criado", description: "Escola criada com sucesso." });
		} catch (err) {
			console.error("Erro ao criar escola:", err);
			toast({ title: "Erro", description: err.message || "Erro desconhecido ao criar escola." });
		} finally {
			setLoading(false);
		}
	};

	const removerEscola = async (id_escola) => {
		if (!confirm("Deseja realmente excluir esta escola?")) return;
		try {
			setLoading(true);

			// 1) buscar lanchonetes dessa escola
			const { data: lanchonetes, error: errList } = await supabase
				.from("lanchonete")
				.select("id_lanchonete")
				.eq("id_escola", id_escola);
			if (errList) throw errList;

			const lanchIds = (lanchonetes || []).map((l) => l.id_lanchonete).filter(Boolean);

			// 2) remover pedidos vinculados às lanchonetes (se houver)
			if (lanchIds.length > 0) {
				const { data: deletedPedidos, error: errPedidos } = await supabase
					.from("pedido")
					.delete()
					.in("id_lanchonete", lanchIds)
					.select("id_pedido");
				if (errPedidos) {
					console.error("Erro removendo pedidos:", errPedidos);
					throw errPedidos;
				}
				console.debug("Pedidos removidos:", deletedPedidos);
			}

			// 3) remover lanchonetes da escola
			const { data: deletedLanch, error: errLanchDelete } = await supabase
				.from("lanchonete")
				.delete()
				.eq("id_escola", id_escola)
				.select("id_lanchonete");
			if (errLanchDelete) {
				console.error("Erro removendo lanchonetes:", errLanchDelete);
				throw errLanchDelete;
			}
			console.debug("Lanchonetes removidas:", deletedLanch);

			// 4) remover perfis vinculados à escola
			const { data: deletedPerfis, error: errPerfil } = await supabase
				.from("perfil")
				.delete()
				.eq("id_escola", id_escola)
				.select("*");
			if (errPerfil) {
				console.error("Erro removendo perfis:", errPerfil);
				throw errPerfil;
			}
			console.debug("Perfis removidos/atualizados:", deletedPerfis);

			// 5) remover a escola e confirmar remoção no banco
			const { data: removedEscola, error: errEscola, status, statusText } = await supabase
				.from("escola")
				.delete()
				.eq("id_escola", id_escola)
				.select("id_escola");
			if (errEscola) {
				console.error("Erro removendo escola (errEscola):", errEscola, { status, statusText });
				throw errEscola;
			}
			console.debug("Escola removida (resposta):", removedEscola, { status, statusText });
			if (errEscola) throw errEscola;

			// Se o banco retornou linhas removidas, atualizamos o estado local
			if (removedEscola && removedEscola.length > 0) {
				setEscolas((s) => s.filter((x) => x.id_escola !== id_escola));
				toast({ title: "Removido", description: `Escola e dependências removidas (${removedEscola.length}).` });
			} else {
				console.warn("Remoção não retornou linhas (possível RLS/permissão):", removedEscola);
				toast({ title: "Não removido", description: "A operação não removeu registros no banco. Verifique permissões (RLS) e console." });
			}
		} catch (e) {
			console.error("Erro remover escola:", e);
			toast({ title: "Erro", description: "Não foi possível remover a escola. Veja o console." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 py-12">
			<div className="max-w-5xl mx-auto px-6">
				<header className="bg-white shadow rounded-2xl p-6 mb-6 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<button onClick={() => navigate("/selecionarAdm")} className="text-slate-600 hover:text-slate-900">
							<ArrowLeft size={28} />
						</button>
						<div>
							<h1 className="text-2xl font-bold">Admin Master</h1>
							<p className="text-sm text-slate-500">Gerencie escolas da aplicação</p>
						</div>
					</div>
					<div className="flex items-center gap-4">
						{authLoading ? (
							<span className="text-sm text-amber-600">Verificando autenticação...</span>
						) : !user ? (
							<Link to="/loginAdm" className="px-3 py-2 bg-sky-100 text-sky-700 rounded">Entrar</Link>
						) : (
							<span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Autenticado</span>
						)}
						<Link to="/userAdm" className="px-3 py-2 bg-gray-100 rounded">Painel Usuários</Link>
					</div>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<section className="col-span-1 lg:col-span-1 bg-white p-6 rounded-2xl shadow">
						<h2 className="font-semibold text-lg mb-4 flex items-center gap-2">Criar nova escola <PlusCircle className="text-indigo-600" /></h2>
						<div className="space-y-3">
							<input
								value={nome}
								onChange={(e) => setNome(e.target.value)}
								placeholder="Nome da escola"
								className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-200"
							/>
							<button onClick={criarEscola} disabled={loading || authLoading} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-400 text-white rounded-lg shadow hover:from-indigo-700 disabled:opacity-50">
								Criar Escola
							</button>
							<div className="text-xs text-slate-400">
								{authLoading ? 'Verificando autenticação...' : (!user ? 'Faça login para criar uma escola.' : 'Você está autenticado e pode criar escolas.')}
							</div>
						</div>
					</section>

					<section className="col-span-1 lg:col-span-2">
						<div className="bg-white p-6 rounded-2xl shadow">
							<h3 className="font-semibold mb-4">Escolas cadastradas</h3>
							{loading && escolas.length === 0 ? (
								<p>Carregando...</p>
							) : escolas.length === 0 ? (
								<div className="text-center py-16 text-slate-400">Nenhuma escola cadastrada.</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{escolas.map((esc) => (
										<div key={esc.id_escola} className="p-4 border rounded-lg flex flex-col justify-between">
											<div>
												<div className="font-medium text-lg">{esc.nome_escola}</div>
												<div className="text-xs text-slate-400">{esc.created_at ? new Date(esc.created_at).toLocaleString() : ''}</div>
											</div>
											<div className="mt-4 flex items-center justify-end gap-3">
												<button onClick={() => removerEscola(esc.id_escola)} className="inline-flex items-center gap-2 text-red-600 hover:underline">
													<Trash2 size={16} /> Excluir
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
