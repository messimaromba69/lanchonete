import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // ← FALTAVA ISSO!
import { supabase } from "../../supabase/supabase";
import { toast } from "../hooks/use-toast";

import fundoSesc from "./assets/sesc.png";
import fundoSenac from "./assets/senac.png";

export default function EditarPerfil() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    cep: "",
    cidade: "",
    estado: "",
    rua: "",
    bairro: "",
    complemento: "",
    sexo: "",
    telefone: "",
    data_nascimento: "",
    foto: "",
  });

  // MÁSCARAS
  function maskPhone(v) {
    return v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }

  function maskCEP(v) {
    return v
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  }

  function maskDate(v) {
    return v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 10);
  }

  function convertDateToISO(br) {
    if (!br.includes("/")) return br;
    const [d, m, y] = br.split("/");
    return `${y}-${m}-${d}`;
  }

  // CARREGAR DADOS
  async function loadData() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const { data } = await supabase
      .from("perfil")
      .select("*")
      .eq("id_user", user.id)
      .maybeSingle();

    if (data) {
      setForm({
        ...data,
        telefone: maskPhone(data.telefone ?? ""),
        cep: maskCEP(data.cep ?? ""),
        data_nascimento: data.data_nascimento
          ? data.data_nascimento.split("-").reverse().join("/")
          : "",
      });
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // SALVAR
  async function salvarEdicao() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    if (!form.nome || !form.telefone) {
      toast({ title: "Nome e telefone são obrigatórios!", variant: "destructive" });
      return;
    }

    const dados = { ...form };
    delete dados.id_user;
    dados.data_nascimento = convertDateToISO(form.data_nascimento);

    const { error } = await supabase
      .from("perfil")
      .upsert({ ...dados, id_user: user.id }, { onConflict: ["id_user"] });

    if (error) {
      console.log(error);
      toast({ title: "Erro ao salvar alterações", variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado com sucesso!" });
      navigate(-1);
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 pt-32">
      {/* Logos */}
      <div className="absolute top-8 left-0 right-0 px-10 flex items-start justify-between">
        {/* Coluna esquerda: logo Sesc com seta abaixo */}
        <div className="flex flex-col items-center">
          <img src="./src/assets/sesc.png" alt="Sesc" className="w-40" />
          <button onClick={() => navigate(-1)} className="text-black mt-3">
            <ArrowLeft size={40} />
          </button>
        </div>

        {/* Logo Senac à direita */}
        <img src="./src/assets/senac.png" alt="Senac" className="w-40" />
      </div>

      <h1 className="text-3xl text-center mt-4 mb-6 text-blue-700 font-semibold">
        Editar Perfil
      </h1>

      <div className="max-w-md mx-auto bg-white border border-slate-100 rounded-xl shadow-md p-6">
        {[
          { key: "nome", placeholder: "Nome" },
          { key: "cep", placeholder: "CEP", mask: maskCEP },
          { key: "cidade", placeholder: "Cidade" },
          { key: "estado", placeholder: "Estado" },
          { key: "rua", placeholder: "Rua" },
          { key: "bairro", placeholder: "Bairro" },
          { key: "complemento", placeholder: "Complemento", options: ["Apartamento", "Bloco", "Casa", "Condomínio"] },
          { key: "sexo", placeholder: "Sexo" },
          { key: "telefone", placeholder: "Telefone", mask: maskPhone },
          {
            key: "data_nascimento",
            placeholder: "Data de Nascimento (DD/MM/AAAA)",
            mask: maskDate,
          },
        ].map((item) => (
          (item.key === "sexo" || item.key === "complemento") ? (
            <select
              key={item.key}
              className="w-full bg-gray-100 p-3 rounded-md mb-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              value={form[item.key] ?? ""}
              onChange={(e) => setForm({ ...form, [item.key]: e.target.value })}
            >
              <option value="">{item.key === "sexo" ? "Sexo" : "Complemento"}</option>
              {item.key === "sexo" ? (
                <>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </>
              ) : (
                item.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))
              )}
            </select>
          ) : (
            <input
              key={item.key}
              className="w-full bg-gray-100 p-3 rounded-md mb-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder={item.placeholder}
              value={form[item.key] ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  [item.key]: item.mask
                    ? item.mask(e.target.value)
                    : e.target.value,
                })
              }
            />
          )
        ))}

        <button
          onClick={salvarEdicao}
          className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-black py-3 rounded-md font-bold mt-4 mb-4 hover:brightness-95 transition"
        >
          Salvar
        </button>
        <div className="text-center text-sm text-slate-400">Os campos são obrigatórios.</div>
      </div>
    </div>
  );
}
