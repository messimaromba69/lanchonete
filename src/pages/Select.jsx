import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabase";
import { toast } from "../hooks/use-toast";

import { ArrowLeft } from "lucide-react";

export default function Select() {
  const navigate = useNavigate();

  const selecionarLanchonete = async (nomeEscola) => {
    try {
      // 0️⃣ Verifica se há usuário autenticado (tabelas com RLS exigem login)
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        toast({
          title: "Login necessário",
          description:
            "A operação exige que você esteja logado. Faça login para continuar.",
          variant: "destructive",
        });
        navigate("/loginUser"); // ajuste para sua rota de login se necessário
        return;
      }

      // opcional: tentar buscar se já existe antes de inserir
      // limitar a 1 linha para evitar PGRST116 (múltiplas linhas quando maybeSingle() espera 0/1)
      const { data: existingRaw, error: selectError } = await supabase
        .from("escola")
        .select("id_escola")
        .eq("nome_escola", nomeEscola)
        .limit(1)
        .maybeSingle();

      // normaliza resultado (algumas versões/combinações podem retornar array por segurança)
      const existing = Array.isArray(existingRaw)
        ? existingRaw[0]
        : existingRaw;

      if (selectError) {
        // mostra mensagem legível e loga o objeto completo
        const msg =
          selectError?.message ||
          selectError?.details ||
          JSON.stringify(selectError);
        console.error("Erro ao buscar escola existente:", selectError);
        if (selectError?.status === 401) {
          toast({
            title: "Erro 401",
            description:
              "Erro 401 ao acessar Supabase. Verifique SUPABASE_URL e SUPABASE_ANON_KEY, além das políticas RLS no painel do Supabase.",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Erro ao buscar escola",
          description: msg,
          variant: "destructive",
        });
        return;
      }

      if (existing?.id_escola) {
        // já existe: usar esse id e seguir para inserção da lanchonete (ou somente navegar)
        const idEscola = existing.id_escola;
        const { data: lanchoInsert, error: lanchoError } = await supabase
          .from("lanchonete")
          .insert([
            {
              id_escola: idEscola,
              nome_lanchonete: nomeEscola,
              id_senac: nomeEscola === "Senac" ? "1" : null,
              id_sesc: nomeEscola === "Sesc" ? "1" : null,
            },
          ])
          .select()
          .single();

        if (lanchoError) {
          console.error("Erro ao salvar lanchonete:", lanchoError);
          if (lanchoError?.status === 401 || lanchoError?.code === "42501") {
            toast({
              title: "Operação bloqueada",
              description:
                "Operação bloqueada por políticas de segurança (RLS). Certifique-se de que o usuário tem permissão para inserir.",
              variant: "destructive",
            });
            return;
          }
          toast({
            title: "Erro ao salvar lanchonete",
            description: JSON.stringify(lanchoError),
            variant: "destructive",
          });
          return;
        }

        if (nomeEscola === "Sesc") navigate("/sesc");
        if (nomeEscola === "Senac") navigate("/menu/senac");
        // salva a lanchonete selecionada no localStorage para uso posterior (fallback no carrinho)
        try {
          if (lanchoInsert && lanchoInsert.id_lanchonete) {
            localStorage.setItem(
              "selectedLanchoneteId",
              String(lanchoInsert.id_lanchonete)
            );
          }
        } catch (e) {
          console.warn(
            "Não foi possível salvar selectedLanchoneteId no localStorage:",
            e
          );
        }
        return;
      }

      // 1️⃣ INSERIR ESCOLA (caso não exista)
      // Nota: não recriamos automaticamente as escolas 'Sesc' e 'Senac'.
      let idEscola = null;
      if (nomeEscola !== "Sesc" && nomeEscola !== "Senac") {
        const { data: escolaInsert, error: escolaError } = await supabase
          .from("escola")
          .insert([{ nome_escola: nomeEscola }])
          .select()
          .single();

        if (escolaError) {
          console.error("Erro ao salvar escola:", escolaError);
          if (escolaError?.status === 401 || escolaError?.code === "42501") {
            toast({
              title: "Operação bloqueada",
              description:
                "Operação bloqueada por políticas de segurança (RLS) ou credenciais inválidas. Faça login com um usuário autorizado ou ajuste as políticas no painel Supabase.",
              variant: "destructive",
            });
            return;
          }
          toast({
            title: "Erro ao salvar escola",
            description: JSON.stringify(escolaError),
            variant: "destructive",
          });
          return;
        }

        console.log("Escola salva:", escolaInsert);

        // PEGAR O ID CERTO
        idEscola = escolaInsert.id_escola;
      } else {
        // Para Sesc/Senac não criamos o registro em `escola`; mantemos idEscola null
        idEscola = null;
      }

      // 2️⃣ INSERIR LANCHONETE VINCULADA
      const { data: lanchoInsert, error: lanchoError } = await supabase
        .from("lanchonete")
        .insert([
          {
            id_escola: idEscola,
            nome_lanchonete: nomeEscola,
            id_senac: nomeEscola === "Senac" ? "1" : null,
            id_sesc: nomeEscola === "Sesc" ? "1" : null,
          },
        ])
        .select()
        .single();

      if (lanchoError) {
        console.error("Erro ao salvar lanchonete:", lanchoError);
        if (lanchoError?.status === 401 || lanchoError?.code === "42501") {
          toast({
            title: "Operação bloqueada",
            description:
              "Operação bloqueada por políticas de segurança (RLS) ou credenciais inválidas. Faça login com um usuário autorizado ou ajuste as políticas no painel Supabase.",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Erro ao salvar lanchonete",
          description: JSON.stringify(lanchoError),
          variant: "destructive",
        });
        return;
      }

      // salva id da lanchonete selecionada para uso posterior (fallback no carrinho)
      try {
        if (lanchoInsert && lanchoInsert.id_lanchonete) {
          localStorage.setItem(
            "selectedLanchoneteId",
            String(lanchoInsert.id_lanchonete)
          );
        }
      } catch (e) {
        console.warn(
          "Não foi possível salvar selectedLanchoneteId no localStorage:",
          e
        );
      }

      console.log("Lanchonete salva:", lanchoInsert);

      // 3️⃣ REDIRECIONAR
      if (nomeEscola === "Sesc") navigate("/sesc");
      if (nomeEscola === "Senac") navigate("/menu/senac");
    } catch (err) {
      const msg = err?.message || JSON.stringify(err);
      console.error("Erro inesperado:", err);
      toast({
        title: "Erro inesperado",
        description: msg,
        variant: "destructive",
      });
    }
  };

  function handleSubmit(e) {
    e.preventDefault();
    // ...logica de submissao via JS/Fetch/Supabase...
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Top logos + back */}
        <div className="absolute top-8 left-0 right-0 px-10 flex items-start justify-between">
          {/* Coluna esquerda: logo Sesc com seta abaixo */}
          <div className="flex flex-col items-center">
            <img src="./src/assets/sesc.png" alt="Sesc" className="w-40" />
            <button onClick={() => navigate("/loginUser")} className="text-black mt-3">
              <ArrowLeft size={40} />
            </button>
          </div>

          {/* Logo Senac à direita */}
          <img src="./src/assets/senac.png" alt="Senac" className="w-40" />
        </div>

        <div className="px-12 py-12">
          <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed">
            Escolha a lanchonete onde deseja fazer o pedido. Você será
            redirecionado ao cardápio correspondente.
          </p>

          <div className="grid grid-cols-1 gap-6">
            <button
              type="button"
              onClick={() => selecionarLanchonete("Sesc")}
              className="w-full rounded-3xl py-6 text-3xl font-bold text-white 
                 bg-gradient-to-r from-blue-700 to-sky-600
                 shadow-lg hover:scale-[1.04] transform transition"
            >
              Sesc
            </button>

            <button
              type="button"
              onClick={() => selecionarLanchonete("Senac")}
              className="w-full rounded-3xl py-6 text-3xl font-bold text-white
                 bg-gradient-to-r from-orange-500 to-amber-400
                 shadow-lg hover:scale-[1.04] transform transition"
            >
              Senac
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
