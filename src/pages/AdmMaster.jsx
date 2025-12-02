import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "../hooks/use-toast";

export default function AdmMaster() {
	const [escolas, setEscolas] = useState([]);
	const [nome, setNome] = useState("");
	const [loading, setLoading] = useState(false);

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
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("escola")
				.insert({ nome_escola: nome.trim() })
				.select("id_escola, nome_escola, created_at")
				.single();
			if (error) throw error;
			setEscolas((s) => [data, ...s]);
			setNome("");
			toast({ title: "Criado", description: "Escola criada com sucesso." });
		} catch (e) {
			console.error("Erro criar escola:", e);
			toast({ title: "Erro", description: "Não foi possível criar a escola." });
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
				const { error: errPedidos } = await supabase
					.from("pedido")
					.delete()
					.in("id_lanchonete", lanchIds);
				if (errPedidos) throw errPedidos;
			}

			// 3) remover lanchonetes da escola
			const { error: errLanchDelete } = await supabase
				.from("lanchonete")
				.delete()
				.eq("id_escola", id_escola);
			if (errLanchDelete) throw errLanchDelete;

			// 4) remover perfis vinculados à escola
			const { error: errPerfil } = await supabase
				.from("perfil")
				.delete()
				.eq("id_escola", id_escola);
			if (errPerfil) throw errPerfil;

			// 5) remover a escola
			const { error } = await supabase.from("escola").delete().eq("id_escola", id_escola);
			if (error) throw error;

			setEscolas((s) => s.filter((x) => x.id_escola !== id_escola));
			toast({ title: "Removido", description: "Escola e dependências removidas." });
		} catch (e) {
			console.error("Erro remover escola:", e);
			toast({ title: "Erro", description: "Não foi possível remover a escola. Veja o console." });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen p-8 bg-slate-50">
			<div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h1 className="text-2xl font-bold">Admin Master</h1>
						<p className="text-sm text-slate-500">Gerencie escolas da aplicação</p>
					</div>
					<div className="space-x-3">
						<Link to="/selecionarAdm" className="px-3 py-2 bg-sky-100 text-sky-700 rounded">Selecionar Painel</Link>
						<Link to="/userAdm" className="px-3 py-2 bg-gray-100 rounded">Painel Usuários</Link>
					</div>
				</div>

				<div className="border-t pt-4">
					<h2 className="font-semibold mb-2">Criar nova escola</h2>
					<div className="flex gap-2">
						<input
							value={nome}
							onChange={(e) => setNome(e.target.value)}
							placeholder="Nome da escola"
							className="flex-1 border rounded px-3 py-2"
						/>
						<button onClick={criarEscola} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
							Criar
						</button>
					</div>
				</div>

				<div className="mt-6">
					<h3 className="font-semibold mb-3">Escolas cadastradas</h3>
					{loading && escolas.length === 0 ? (
						<p>Carregando...</p>
					) : escolas.length === 0 ? (
						<p className="text-sm text-slate-500">Nenhuma escola cadastrada.</p>
					) : (
						<ul className="space-y-2">
							{escolas.map((esc) => (
								<li key={esc.id_escola} className="flex items-center justify-between p-3 rounded border">
									<div>
										<div className="font-medium">{esc.nome_escola}</div>
										<div className="text-xs text-slate-400">{esc.created_at ? new Date(esc.created_at).toLocaleString() : ''}</div>
									</div>
									<div className="flex items-center gap-3">
										<button onClick={() => removerEscola(esc.id_escola)} className="text-sm text-red-600">Excluir</button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
